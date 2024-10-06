const { where } = require('sequelize');
const { Lecturas, ViewLecturas, Servicios, Excesos, Configuracion } = require('../models');
const lecturas = require('../models/lecturas');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const mostrarLecturas = async (req, res) => {
    try {
        const lecturas = await Lecturas.findAll();
        res.status(200).json({ lecturas });
    } catch (error) {
        console.error('Error en mostrarLecturas:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const mostrarLecturasIdServicio = async (req, res) => {
    const { idservicio } = req.params;  // Obtenemos el idservicio de los parámetros de la URL
    try {
        const lecturas = await Lecturas.findAll({
            where: { idservicio }  // Filtramos por el idservicio
        });

        if (lecturas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron lecturas para este servicio' });
        }

        res.status(200).json({ lecturas });
    } catch (error) {
        console.error('Error en mostrarLecturas:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};



const mostrarLecturasDiarias = async (req, res) => {
    try {
        const viewlecturas = await ViewLecturas.findAll();
        res.status(200).json({ viewlecturas });
    } catch (error) {
        console.error('Error en mostrarLecturas:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const mostrarLecturasActivas = async (req, res) => {
    try {
        const lecturas = await Lecturas.findAll({
            where: {
                activo: true
            }
        });
        res.status(200).json({ lecturas });
    } catch (error) {
        console.error('Error en mostrarLecturasActivas:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const toggleActivoLectura = async (req, res) => {
    const { idlectura } = req.params;

    try {
        const lectura = await Lecturas.findByPk(idlectura);
        if (!lectura) {
            return res.status(404).json({ message: 'Lectura no Encontrada. ' });
        }
        lectura.activo = !lectura.activo;

        await lectura.save();

        res.status(200).json({ message: 'Estado de lectura actualizado con exito' });
    }catch(error){
        console.error(' Error en toggleActivoLectura', error);
        res.status(500).json({message: 'Error interno del Servidor', error: error.message});
    }
};

const crearLecturad = async (req, res) => {
    try {
        const { idservicio, lectura, mes, año, fecha, url_foto, idusuario, uuid } = req.body;

        // Verificar si ya existe una lectura con el mismo idservicio, mes y año
        const lecturaExistentePorServicioMesAno = await Lecturas.findOne({
            where: { idservicio, mes, año }
        });

        if (lecturaExistentePorServicioMesAno) {
            return res.status(400).json({ message: 'Ya existe una lectura para este servicio en el mismo mes y año.' });
        }

        // Crear la nueva lectura
        const nuevaLectura = await Lecturas.create({
            idservicio,
            lectura,
            mes,
            año,
            fecha,
            url_foto,
            idusuario,
            uuid
        });

        // Obtener el servicio con su configuración
        const servicio = await Servicios.findByPk(idservicio, {
            include: [{ model: Configuracion, as: 'configuracion' }]
        });

        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        const cuota = parseFloat(servicio.configuracion.cuota);
        const porcentajeMora = 0.03;  // 3% de mora
        const iva = 0.12;  // 12% de IVA
        const limiteExceso = parseFloat(servicio.configuracion.limite);
        const porcentajeExceso = 0.10;  // 10% del valor de la cuota

        // Calcular el consumo del mes actual
        const lecturaMesAnterior = await Lecturas.findOne({
            where: {
                idservicio,
                mes: mes - 1 > 0 ? mes - 1 : 12,
                año: mes - 1 > 0 ? año : año - 1
            },
            order: [['fecha', 'DESC']],
            limit: 1
        });

        const lecturaAnteriorValor = lecturaMesAnterior ? parseFloat(lecturaMesAnterior.lectura) : 0;
        const consumoActual = parseFloat(lectura) - lecturaAnteriorValor;

        // Calcular el exceso solo si el consumo actual excede el límite mensual
        let exceso = 0;
        let montoExceso = 0;
        if (consumoActual > limiteExceso) {
            exceso = consumoActual - limiteExceso;
            montoExceso = exceso * (cuota * porcentajeExceso);
        }

        // Crear el registro en la tabla Excesos (siempre, incluso si el exceso es 0)
        const excesoCreado = await Excesos.create({
            idlectura: nuevaLectura.idlectura,
            exceso: exceso,
            monto_exceso: montoExceso.toFixed(2),
            mora: 0,  // Se actualizará más adelante si es necesario
            activo: true,
            pagada: false
        });

        console.log('Exceso creado:', excesoCreado);

        // Verificar las lecturas anteriores no pagadas
        const lecturasNoPagadas = await Lecturas.findAll({
            where: {
                idservicio,
                mora_pagada: false
            },
            order: [['mes', 'ASC']]  // Obtener las lecturas en orden ascendente por mes
        });

        let acumulado = 0;

        // Recorrer las lecturas no pagadas desde el más antiguo al más reciente
        for (let i = 0; i < lecturasNoPagadas.length; i++) {
            const lecturaNoPagada = lecturasNoPagadas[i];

            const mesesDeAtraso = mes - lecturaNoPagada.mes;
            let mora = 0;

            if (mesesDeAtraso > 0) {
                mora = cuota * (porcentajeMora * mesesDeAtraso);  // Calcular mora acumulada
                mora += mora * iva;  // Aplicar IVA
            }

            const cuotaMensualTotal = cuota + mora;  // **Cuota más mora**

            // Sumar la cuota mensual y mora al acumulado general
            acumulado += cuotaMensualTotal;

            // Actualizar la lectura con los valores de mora y acumulado
            await lecturaNoPagada.update({
                monto_mora: mora.toFixed(2),
                cuota_mensual: cuotaMensualTotal.toFixed(2),  // **Cuota más mora**
                monto_acumulado: acumulado.toFixed(2),
                mora_pagada: false
            });
        }

        // Para el último registro o si solo hay un registro
        const esUltimaLectura = lecturasNoPagadas.length === 0;

        // Si es el único registro o la última lectura, el acumulado será solo la cuota mensual
        acumulado = esUltimaLectura ? cuota : acumulado;

        // Actualizar la nueva lectura creada (mes actual)
        await nuevaLectura.update({
            monto_mora: 0,  // Sin mora en el mes actual
            cuota_mensual: cuota.toFixed(2),  // Cuota del mes actual
            monto_acumulado: acumulado.toFixed(2)  // Ajuste en el acumulado
        });

        res.status(201).json({
            message: 'Lectura, exceso y moras generadas con éxito',
            nuevaLectura,
            excesoCreado: {
                idexceso: excesoCreado.idexceso,
                exceso: excesoCreado.exceso,
                monto_exceso: excesoCreado.monto_exceso
            }
        });
    } catch (error) {
        console.error('Error en crearLectura:', error);
        res.status(500).json({ message: 'Error al crear Lectura', error: error.message });
    }
};


const crearLectura = async (req, res) => {
    try {
        const { idservicio, lectura, mes, año, fecha, url_foto, idusuario, uuid } = req.body;

        // Verificar si ya existe una lectura con el mismo idservicio, mes y año
        const lecturaExistentePorServicioMesAno = await Lecturas.findOne({
            where: { idservicio, mes, año }
        });

        if (lecturaExistentePorServicioMesAno) {
            return res.status(400).json({ message: 'Ya existe una lectura para este servicio en el mismo mes y año.' });
        }

        // Crear la nueva lectura
        const nuevaLectura = await Lecturas.create({
            idservicio,
            lectura,
            mes,
            año,
            fecha,
            url_foto,
            idusuario,
            uuid
        });

        // Obtener el servicio con su configuración
        const servicio = await Servicios.findByPk(idservicio, {
            include: [{ model: Configuracion, as: 'configuracion' }]
        });

        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        const cuota = parseFloat(servicio.configuracion.cuota);
        const porcentajeMoraBase = 0.03;  // 3% de mora por mes de retraso
        const iva = 0.12;  // 12% de IVA
        const limiteExceso = parseFloat(servicio.configuracion.limite);
        const porcentajeExceso = 0.10;  // 10% del valor de la cuota

        // Calcular el consumo del mes actual
        const lecturaMesAnterior = await Lecturas.findOne({
            where: {
                idservicio,
                mes: mes - 1 > 0 ? mes - 1 : 12,
                año: mes - 1 > 0 ? año : año - 1
            },
            order: [['fecha', 'DESC']],
            limit: 1
        });

        const lecturaAnteriorValor = lecturaMesAnterior ? parseFloat(lecturaMesAnterior.lectura) : 0;
        const consumoActual = parseFloat(lectura) - lecturaAnteriorValor;

        // Calcular el exceso solo si el consumo actual excede el límite mensual
        let exceso = 0;
        let montoExceso = 0;
        if (consumoActual > limiteExceso) {
            exceso = consumoActual - limiteExceso;
            montoExceso = exceso * (cuota * porcentajeExceso);
        }

        // Verificar las lecturas anteriores no pagadas
        const lecturasNoPagadas = await Lecturas.findAll({
            where: {
                idservicio,
                mora_pagada: false
            },
            order: [['mes', 'ASC']]  // Obtener las lecturas en orden ascendente por mes
        });

        let acumulado = 0;
        let porcentaje = 0;

        // Recorrer las lecturas no pagadas desde la más antigua al más reciente
        for (let i = 0; i < lecturasNoPagadas.length; i++) {
            const lecturaNoPagada = lecturasNoPagadas[i];

            // Incrementar el porcentaje acumulado en cada iteración
            porcentaje += porcentajeMoraBase;  // Cada mes acumula 3% más

            // Calcular mora acumulada
            let mora = cuota * porcentaje;  // Calcular mora acumulada
            mora += mora * iva;  // Aplicar IVA a la mora

            const cuotaMensualTotal = cuota + mora;  // Cuota mensual + mora

            // Sumar la cuota mensual y mora al acumulado general
            acumulado += cuotaMensualTotal;

            // Actualizar la lectura con los valores de mora, acumulado y porcentaje
            await lecturaNoPagada.update({
                monto_mora: mora.toFixed(2),
                cuota_mensual: cuotaMensualTotal.toFixed(2),
                monto_acumulado: acumulado.toFixed(2),
                mora_pagada: false,
                porcentaje_acumulado: porcentaje.toFixed(2),
                total: (cuotaMensualTotal + parseFloat(lecturaNoPagada.monto_exceso)).toFixed(2)
            });
        }

        // Si es la última lectura o la única
        const esUltimaLectura = lecturasNoPagadas.length === 0;

        // Si es la única lectura, el acumulado será solo la cuota mensual
        acumulado = esUltimaLectura ? cuota : acumulado;

        // Actualizar la nueva lectura creada (mes actual)
        await nuevaLectura.update({
            monto_mora: 0,  // Sin mora en el mes actual
            cuota_mensual: cuota.toFixed(2),  // Cuota del mes actual
            monto_acumulado: acumulado.toFixed(2),  // Ajuste en el acumulado
            exceso: exceso.toFixed(2),
            monto_exceso: montoExceso.toFixed(2),
            exceso_pagado: false,
            porcentaje_acumulado: porcentaje.toFixed(2),  // Ultimo porcentaje calculado
            total: (cuota + montoExceso).toFixed(2)  // Total de cuota + mora + exceso
        });

        res.status(201).json({
            message: 'Lectura, exceso y moras generadas con éxito',
            nuevaLectura
        });
    } catch (error) {
        console.error('Error en crearLectura:', error);
        res.status(500).json({ message: 'Error al crear Lectura', error: error.message });
    }
};

const actualizarLectura = async (req, res) => {
    const { idlectura } = req.params;
    const { lectura, url_foto, idusuario } = req.body;

    try {
        // Buscar la lectura por ID
        const lecturasEncontrado = await Lecturas.findByPk(idlectura);

        if (!lecturasEncontrado) {
            return res.status(404).json({ message: 'Lectura no encontrada.' });
        }

        // Actualizar la lectura con los nuevos datos
        await lecturasEncontrado.update({ lectura, url_foto, idusuario });

        console.log('Lectura actualizada con éxito:', lecturasEncontrado);

        // Obtener el exceso relacionado con la lectura actualizada
        const excesoEncontrado = await Excesos.findOne({
            where: { idlectura }
        });

        if (!excesoEncontrado) {
            return res.status(404).json({ message: 'Exceso no encontrado para la lectura.' });
        }

        console.log('Exceso encontrado:', excesoEncontrado);

        // Obtener el idservicio de la lectura actualizada
        const idservicio = lecturasEncontrado.idservicio;
        const mes = lecturasEncontrado.mes;
        const año = lecturasEncontrado.año;

        // Obtener la lectura del mes anterior
        const lecturaMesAnterior = await Lecturas.findOne({
            where: {
                idservicio,
                mes: mes - 1 > 0 ? mes - 1 : 12,
                año: mes - 1 > 0 ? año : año - 1
            },
            order: [['fecha', 'DESC']],
            limit: 1
        });

        // Si no existe lectura del mes anterior, tomar lectura anterior como 0
        const lecturaAnteriorValor = lecturaMesAnterior ? parseFloat(lecturaMesAnterior.lectura) : 0;
        console.log('Valor de la lectura anterior (mes anterior):', lecturaAnteriorValor);

        // Obtener el límite de exceso desde la tabla Configuracion
        const servicio = await Servicios.findByPk(idservicio, {
            include: [{ model: Configuracion, as: 'configuracion' }]
        });

        if (!servicio) {
            console.log('Error: Servicio no encontrado para idservicio:', idservicio);
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        console.log('Configuración del servicio:', servicio.configuracion);

        const limiteExceso = parseFloat(servicio.configuracion.limite);
        const cuota = parseFloat(servicio.configuracion.cuota);
        const porcentajeExceso = 0.10; // 10% del valor de la cuota

        console.log('Límite de exceso:', limiteExceso, 'Cuota:', cuota, 'Porcentaje de exceso:', porcentajeExceso);

        // Calcular el consumo del mes actual
        const consumoActual = parseFloat(lectura) - lecturaAnteriorValor;
        console.log('Consumo actual (mes actual):', consumoActual);

        // Calcular el exceso solo si el consumo actual excede el límite mensual
        let exceso = 0;
        let montoExceso = 0;
        if (consumoActual > limiteExceso) {
            exceso = consumoActual - limiteExceso;
            montoExceso = exceso * (cuota * porcentajeExceso);
        }

        console.log('Exceso recalculado:', exceso, 'Monto del exceso:', montoExceso);

        // Actualizar el exceso con los nuevos valores
        await excesoEncontrado.update({
            exceso: exceso,
            monto_exceso: montoExceso
        });

        console.log('Exceso actualizado con éxito:', excesoEncontrado);

        res.status(200).json({ message: 'Lectura y exceso actualizados con éxito.' });
    } catch (error) {
        console.error('Error en actualizarLectura:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

// Controlador para obtener lecturas no pagadas por idservicio
const obtenerLecturasNoPagadas = async (req, res) => {
    try {
        const { idservicio } = req.params;

        // Buscar las lecturas no pagadas del servicio
        const lecturasNoPagadas = await Excesos.findAll({
            where: {
                pagada: false
            },
            include: [
                {
                    model: Lecturas,
                    as: 'lecturas',
                    where: { idservicio: idservicio }
                }
            ]
        });

        // Verificar si existen lecturas no pagadas
        if (lecturasNoPagadas.length === 0) {
            return res.status(404).json({ message: 'No hay lecturas no pagadas para este servicio.' });
        }

        // Obtener la configuración del servicio para conocer la cuota mensual
        const servicio = await Servicios.findByPk(idservicio, {
            include: [{ model: Configuracion, as: 'configuracion' }]
        });

        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        const cuotaMensual = parseFloat(servicio.configuracion.cuota);
        let deudaTotal = 0;

        // Agregar la cuota pendiente a cada lectura no pagada
        const lecturasConCuotaPendiente = lecturasNoPagadas.map((exceso) => {
            const cuotaPendiente = cuotaMensual;

            // Sumar esta cuota a la deuda total
            deudaTotal += cuotaPendiente;

            return {
                ...exceso.toJSON(),
                cuotaPendiente: cuotaPendiente.toFixed(2)
            };
        });

        // Responder con las lecturas no pagadas y la deuda total
        res.status(200).json({
            lecturasNoPagadas: lecturasConCuotaPendiente,
            deudaTotal: deudaTotal.toFixed(2)  // Limitar a 2 decimales
        });

    } catch (error) {
        console.error('Error en obtenerLecturasNoPagadas:', error);
        res.status(500).json({ message: 'Error al obtener lecturas no pagadas', error: error.message });
    }
};

const eliminarLectura = async (req, res) => {
    const { idlectura } = req.params;

    try {
        await Lecturas.destroy({
            where: { idlectura: idlectura }
        });

        res.status(200).json({ message: 'Lectura eliminada definitivamente con éxito.' });
    } catch (error) {
        console.error('Error en eliminarLectura:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

module.exports = {
    mostrarLecturas,
    mostrarLecturasActivas,
    crearLectura,
    actualizarLectura,
    eliminarLectura,
    toggleActivoLectura,
    mostrarLecturasDiarias,
    obtenerLecturasNoPagadas,
    mostrarLecturasIdServicio
};
