const { where } = require('sequelize');
const { Op } = require('sequelize');
const { Lecturas, ViewLecturas, Servicios, Excesos, Configuracion, Pagos_Adelantados } = require('../models');
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
            where: {
                idservicio,  // Filtramos por el idservicio
                [Op.or]: [
                    { lectura_pagada: false },
                    { mora_pagada: false },
                    { exceso_pagado: false }
                ]
            },
            order: [['createdAt', 'DESC']]  // Ordenamos por createdAt en orden descendente (del más reciente al más antiguo)
        });

        if (lecturas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron lecturas pendientes de pago para este servicio' });
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

const mostrarLecturasPagadasPorServicio = async (req, res) => {
    const { idservicio } = req.params;  // Obtener el idservicio de los parámetros de la URL

    try {
        // Buscar lecturas pagadas que correspondan al id_servicio proporcionado
        const lecturasPagadas = await Lecturas.findAll({
            where: {
                idservicio,  // Filtrar por idservicio
                lectura_pagada: true,
                mora_pagada: true,
                exceso_pagado: true
            },
            order: [['fecha', 'DESC']]  // Ordenar por la fecha en orden descendente (de la más reciente a la más antigua)
        });

        if (lecturasPagadas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron lecturas pagadas para este servicio.' });
        }

        res.status(200).json({ lecturasPagadas });
    } catch (error) {
        console.error('Error en mostrar lecturas pagadas:', error);
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

const crearLectura2 = async (req, res) => {
    try {
        const { idservicio, lectura, mes, año, fecha, url_foto, idusuario, uuid } = req.body;

        // Verificar si ya existe una lectura con el mismo idservicio, mes y año
        const lecturaExistentePorServicioMesAno = await Lecturas.findOne({
            where: { idservicio, mes, año }
        });

        if (lecturaExistentePorServicioMesAno) {
            return res.status(400).json({ message: 'Ya existe una lectura para este servicio en el mismo mes y año.' });
        }

        // Obtener el servicio con su configuración
        const servicio = await Servicios.findByPk(idservicio, {
            include: [{ model: Configuracion, as: 'configuracion' }]
        });

        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        const cuota = parseFloat(servicio.configuracion.cuota);
        const porcentaje_base = 0.03; // 3% de mora
        const iva = 0.12;  // 12% de IVA
        const limiteExceso = parseFloat(servicio.configuracion.limite);
        const porcentajeExceso = 0.10;  // 10% del valor de la cuota

        // Crear la nueva lectura
        const nuevaLectura = await Lecturas.create({
            idservicio,
            lectura,
            mes,
            año,
            fecha,
            url_foto,
            idusuario,
            uuid,
            cuota
        });

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
            order: [['año', 'ASC'], ['mes', 'ASC']]  // Asegurarse de que las lecturas estén ordenadas por año y mes
        });

        let acumulado = 0;
        let porcentaje_acumulado = porcentaje_base * (lecturasNoPagadas.length - 1);  // El porcentaje más alto será para la lectura más antigua

        // Recorrer las lecturas no pagadas desde la más antigua hasta la más reciente
        for (let i = 0; i < lecturasNoPagadas.length; i++) {
            const lecturaNoPagada = lecturasNoPagadas[i];

            const mesesDeAtraso = (año - lecturaNoPagada.año) * 12 + (mes - lecturaNoPagada.mes);
            let mora = 0;

            if (mesesDeAtraso > 0) {
                mora = cuota * (porcentaje_base * mesesDeAtraso);  // Calcular mora acumulada
                mora += mora * iva;  // Aplicar IVA
            }

            const cuotaMensualTotal = cuota + mora;  // Cuota más mora

            // Sumar la cuota mensual y mora al acumulado general
            acumulado += cuotaMensualTotal;

            // Calcular el total para esa lectura (cuota_mensual + monto_exceso)
            const total = parseFloat(cuotaMensualTotal) + parseFloat(lecturaNoPagada.monto_exceso);

            // Actualizar la lectura con los valores de mora, acumulado, porcentaje acumulado y total
            await lecturaNoPagada.update({
                monto_mora: mora.toFixed(2),
                cuota_mensual: cuotaMensualTotal.toFixed(2),
                monto_acumulado: acumulado.toFixed(2),
                mora_pagada: false,
                total: total.toFixed(2),
                porcentaje_acumulado: porcentaje_acumulado.toFixed(2)  // Asignar el porcentaje acumulado
            });

            // Reducir el porcentaje acumulado para la siguiente lectura más reciente
            porcentaje_acumulado -= porcentaje_base;
        }

        // Para la nueva lectura (mes actual) que no tiene mora
        const esUltimaLectura = lecturasNoPagadas.length === 0;
        const cuotaMensual = cuota.toFixed(2);

        acumulado = esUltimaLectura ? cuota : acumulado;
        // Ajustar el acumulado en caso de que sea la única lectura

        // El porcentaje acumulado para la nueva lectura es 0
        const totalNuevaLectura = parseFloat(cuotaMensual) + parseFloat(montoExceso);

        // Actualizar la nueva lectura creada (mes actual)
        await nuevaLectura.update({
            monto_mora: 0,  // Sin mora en el mes actual
            cuota_mensual: cuotaMensual,  // Cuota del mes actual
            monto_acumulado: acumulado.toFixed(2),  // Ajuste en el acumulado
            exceso: exceso.toFixed(2),
            monto_exceso: montoExceso.toFixed(2),
            exceso_pagado: false,
            total: totalNuevaLectura.toFixed(2),
            porcentaje_acumulado: 0  // El mes más reciente tiene 0% de mora
        });

        res.status(201).json({
            message: 'Lectura, exceso y moras generadas con éxito',
            nuevaLectura,
            excesoCreado: {
                exceso: exceso.toFixed(2),
                monto_exceso: montoExceso.toFixed(2)
            }
        });
    } catch (error) {
        console.error('Error en crearLectura:', error);
        res.status(500).json({ message: 'Error al crear Lectura', error: error.message });
    }
};

const crearLectura3 = async (req, res) => {
    try {
        const { idservicio, lectura, mes, año, fecha, url_foto, idusuario, uuid } = req.body;

        // Verificar si ya existe una lectura con el mismo idservicio, mes y año
        const lecturaExistentePorServicioMesAno = await Lecturas.findOne({
            where: { idservicio, mes, año }
        });

        if (lecturaExistentePorServicioMesAno) {
            return res.status(400).json({ message: 'Ya existe una lectura para este servicio en el mismo mes y año.' });
        }

        // Obtener el servicio con su configuración
        const servicio = await Servicios.findByPk(idservicio, {
            include: [{ model: Configuracion, as: 'configuracion' }]
        });

        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        const cuota = parseFloat(servicio.configuracion.cuota);
        const porcentaje_base = 0.03; // 3% de mora
        const iva = 0.12;  // 12% de IVA
        const limiteExceso = parseFloat(servicio.configuracion.limite);
        const porcentajeExceso = 0.10;  // 10% del valor de la cuota

        // Crear la nueva lectura
        const nuevaLectura = await Lecturas.create({
            idservicio,
            lectura,
            mes,
            año,
            fecha,
            url_foto,
            idusuario,
            uuid,
            cuota
        });

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
            order: [['año', 'ASC'], ['mes', 'ASC']]  // Asegurarse de que las lecturas estén ordenadas por año y mes
        });

        let acumulado = 0;
        let total_acumulado_exceso = 0;
        let suma_total_acumulada = 0;  // Variable para sumar monto_acumulado + total

        let porcentaje_acumulado = porcentaje_base * (lecturasNoPagadas.length - 1);  // El porcentaje más alto será para la lectura más antigua

        // Recorrer las lecturas no pagadas desde la más antigua hasta la más reciente
        for (let i = 0; i < lecturasNoPagadas.length; i++) {
            const lecturaNoPagada = lecturasNoPagadas[i];

            const mesesDeAtraso = (año - lecturaNoPagada.año) * 12 + (mes - lecturaNoPagada.mes);
            let mora = 0;

            if (mesesDeAtraso > 0) {
                mora = cuota * (porcentaje_base * mesesDeAtraso);  // Calcular mora acumulada
                mora += mora * iva;  // Aplicar IVA
            }

            const cuotaMensualTotal = cuota + mora;  // Cuota más mora

            // Sumar la cuota mensual y mora al acumulado general
            acumulado += cuotaMensualTotal;

            // Acumular monto_exceso
            total_acumulado_exceso += parseFloat(lecturaNoPagada.monto_exceso || 0);

            // Calcular el total para esa lectura (acumulado del monto_exceso)
            const total = total_acumulado_exceso;

            // Calcular la suma total como monto_acumulado + total
            suma_total_acumulada = acumulado + total;

            // Actualizar la lectura con los valores de mora, acumulado, porcentaje acumulado, total y suma_total
            await lecturaNoPagada.update({
                monto_mora: mora.toFixed(2),
                cuota_mensual: cuotaMensualTotal.toFixed(2),
                monto_acumulado: acumulado.toFixed(2),
                mora_pagada: false,
                total: total.toFixed(2),
                porcentaje_acumulado: porcentaje_acumulado.toFixed(2),  // Asignar el porcentaje acumulado
                suma_total: suma_total_acumulada.toFixed(2)  // Asignar la suma total acumulada (monto_acumulado + total)
            });

            // Reducir el porcentaje acumulado para la siguiente lectura más reciente
            porcentaje_acumulado -= porcentaje_base;
        }

        // Para la nueva lectura (mes actual) que no tiene mora
        const esUltimaLectura = lecturasNoPagadas.length === 0;
        const cuotaMensual = cuota.toFixed(2);

        acumulado = esUltimaLectura ? cuota : acumulado;

        // El porcentaje acumulado para la nueva lectura es 0
        total_acumulado_exceso += parseFloat(montoExceso);
        const totalNuevaLectura = total_acumulado_exceso;
        suma_total_acumulada = acumulado + totalNuevaLectura;  // Sumar el acumulado con el total para la nueva lectura

        // Actualizar la nueva lectura creada (mes actual)
        await nuevaLectura.update({
            monto_mora: 0,  // Sin mora en el mes actual
            cuota_mensual: cuotaMensual,  // Cuota del mes actual
            monto_acumulado: acumulado.toFixed(2),  // Ajuste en el acumulado
            exceso: exceso.toFixed(2),
            monto_exceso: montoExceso.toFixed(2),
            exceso_pagado: false,
            total: totalNuevaLectura.toFixed(2),
            porcentaje_acumulado: 0,  // El mes más reciente tiene 0% de mora
            suma_total: suma_total_acumulada.toFixed(2)  // Asignar la suma total acumulada (monto_acumulado + total)
        });

        res.status(201).json({
            message: 'Lectura, exceso y moras generadas con éxito',
            nuevaLectura,
            excesoCreado: {
                exceso: exceso.toFixed(2),
                monto_exceso: montoExceso.toFixed(2)
            }
        });
    } catch (error) {
        console.error('Error en crearLectura:', error);
        res.status(500).json({ message: 'Error al crear Lectura', error: error.message });
    }
};

const crearLecturaActual = async (req, res) => {
    try {
        const { idservicio, lectura, mes, año, fecha, url_foto, idusuario, uuid } = req.body;

        // Verificar si ya existe una lectura con el mismo idservicio, mes y año
        const lecturaExistentePorServicioMesAno = await Lecturas.findOne({
            where: { idservicio, mes, año }
        });

        if (lecturaExistentePorServicioMesAno) {
            return res.status(400).json({ message: 'Ya existe una lectura para este servicio en el mismo mes y año.' });
        }

        // Obtener el servicio con su configuración
        const servicio = await Servicios.findByPk(idservicio, {
            include: [{ model: Configuracion, as: 'configuracion' }]
        });

        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        const cuota = parseFloat(servicio.configuracion.cuota);
        const porcentaje_base = 0.03; // 3% de mora
        const iva = 0.12;  // 12% de IVA
        const limiteExceso = parseFloat(servicio.configuracion.limite);
        const porcentajeExceso = 0.10;  // 10% del valor de la cuota

        // Verificar si la lectura es anterior al inicio del servicio
        if (
            año < servicio.anio_inicio_lectura ||
            (año === servicio.anio_inicio_lectura && mes < servicio.mes_inicio_lectura)
        ) {
            const nuevaLectura = await Lecturas.create({
                idservicio,
                lectura,
                mes,
                año,
                fecha,
                url_foto,
                idusuario,
                uuid,
                cuota: 0,
                monto_mora: 0,
                monto_acumulado: 0,
                porcentaje_acumulado: 0,
                cuota_mensual: 0,
                exceso: 0,
                monto_exceso: 0,
                suma_total: 0,
                lectura_pagada: true,
                mora_pagada: true,
                exceso_pagado: true
            });

            return res.status(201).json({
                message: 'Lectura registrada con valores en cero por ser anterior al inicio del servicio',
                nuevaLectura
            });
        }

        // Verificar si existe un pago adelantado para este servicio, mes y año
        const pagoAdelantado = await Pagos_Adelantados.findOne({
            where: { idservicio, mes, año }
        });

        let mora = 0;
        let acumulado = 0;
        let mora_pagada = false;
        let cuota_mensual = cuota;
        let lectura_pagada = false;
        let cuotaLectura = cuota;

        if (pagoAdelantado) {
            mora_pagada = true;
            lectura_pagada = true;
            mora = 0;
            acumulado = 0;
            cuota_mensual = 0;
            cuotaLectura = 0; // La cuota será cero porque ya fue pagada
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
            uuid,
            cuota: cuotaLectura
        });

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
            order: [['año', 'ASC'], ['mes', 'ASC']]  // Asegurarse de que las lecturas estén ordenadas por año y mes
        });

        let total_acumulado_exceso = 0;
        let suma_total_acumulada = 0;  // Variable para sumar monto_acumulado + total

        let porcentaje_acumulado = porcentaje_base * (lecturasNoPagadas.length - 1);  // El porcentaje más alto será para la lectura más antigua

        // Recorrer las lecturas no pagadas desde la más antigua hasta la más reciente
        for (let i = 0; i < lecturasNoPagadas.length; i++) {
            const lecturaNoPagada = lecturasNoPagadas[i];

            const mesesDeAtraso = (año - lecturaNoPagada.año) * 12 + (mes - lecturaNoPagada.mes);
            let moraLectura = 0;

            if (mesesDeAtraso > 0) {
                moraLectura = cuota * (porcentaje_base * mesesDeAtraso);  // Calcular mora acumulada
                moraLectura += moraLectura * iva;  // Aplicar IVA
            }

            const cuotaMensualTotal = cuota + moraLectura;  // Cuota más mora

            // Sumar la cuota mensual y mora al acumulado general
            acumulado += cuotaMensualTotal;

            // Acumular monto_exceso
            total_acumulado_exceso += parseFloat(lecturaNoPagada.monto_exceso || 0);

            // Calcular el total para esa lectura (acumulado del monto_exceso)
            const total = total_acumulado_exceso;

            // Calcular la suma total como monto_acumulado + total
            suma_total_acumulada = acumulado + total;

            // Actualizar la lectura con los valores de mora, acumulado, porcentaje acumulado, total y suma_total
            await lecturaNoPagada.update({
                monto_mora: moraLectura.toFixed(2),
                cuota_mensual: cuotaMensualTotal.toFixed(2),
                monto_acumulado: acumulado.toFixed(2),
                mora_pagada: false,
                total: total.toFixed(2),
                porcentaje_acumulado: porcentaje_acumulado.toFixed(2),  // Asignar el porcentaje acumulado
                suma_total: suma_total_acumulada.toFixed(2)  // Asignar la suma total acumulada (monto_acumulado + total)
            });

            // Reducir el porcentaje acumulado para la siguiente lectura más reciente
            porcentaje_acumulado -= porcentaje_base;
        }

        // Para la nueva lectura (mes actual) que no tiene mora
        const esUltimaLectura = lecturasNoPagadas.length === 0;
        const cuotaMensualFinal = cuotaLectura.toFixed(2);

        acumulado = esUltimaLectura ? cuotaLectura : acumulado;

        // El porcentaje acumulado para la nueva lectura es 0
        total_acumulado_exceso += parseFloat(montoExceso);
        const totalNuevaLectura = total_acumulado_exceso;
        suma_total_acumulada = acumulado + totalNuevaLectura;  // Sumar el acumulado con el total para la nueva lectura

        // Actualizar la nueva lectura creada (mes actual)
        await nuevaLectura.update({
            monto_mora: mora,
            cuota_mensual: cuotaMensualFinal,  // Cuota del mes actual
            monto_acumulado: acumulado.toFixed(2),  // Ajuste en el acumulado
            exceso: exceso.toFixed(2),
            monto_exceso: montoExceso.toFixed(2),
            exceso_pagado: false,
            total: totalNuevaLectura.toFixed(2),
            porcentaje_acumulado: 0,  // El mes más reciente tiene 0% de mora
            suma_total: suma_total_acumulada.toFixed(2),  // Asignar la suma total acumulada (monto_acumulado + total)
            lectura_pagada,
            mora_pagada
        });

        res.status(201).json({
            message: 'Lectura, exceso y moras generadas con éxito',
            nuevaLectura,
            excesoCreado: {
                exceso: exceso.toFixed(2),
                monto_exceso: montoExceso.toFixed(2)
            }
        });
    } catch (error) {
        console.error('Error en crearLectura:', error);
        res.status(500).json({ message: 'Error al crear Lectura', error: error.message });
    }
};


const crearLecturaMorasYExcesoslistos = async (req, res) => {
    try {
        const { idservicio, lectura, mes, año, fecha, url_foto, idusuario, uuid } = req.body;

        // Obtener el servicio con su configuración
        const servicio = await Servicios.findByPk(idservicio, {
            include: [{ model: Configuracion, as: 'configuracion' }]
        });

        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        const { mes_inicio_lectura, anio_inicio_lectura } = servicio;

        // Verificar si la lectura es anterior al inicio de lecturas
        if ((año < anio_inicio_lectura) || (año === anio_inicio_lectura && mes < mes_inicio_lectura)) {
            // La lectura no se cobra, se guarda como exonerada
            const nuevaLecturaExonerada = await Lecturas.create({
                idservicio,
                lectura,
                mes,
                año,
                fecha,
                url_foto,
                idusuario,
                uuid,
                monto_mora: 0,
                monto_acumulado: 0,
                mora_pagada: true,
                cuota: 0,
                cuota_mensual: 0,
                exceso: 0,
                exceso_pagado: true,
                porcentaje_acumulado: 0,
                total: 0,
                suma_total: 0,
                lectura_pagada: true
            });

            return res.status(201).json({
                message: 'Lectura exonerada creada con éxito',
                nuevaLecturaExonerada
            });
        }

        // Verificar si ya existe una lectura con el mismo idservicio, mes y año
        const lecturaExistentePorServicioMesAno = await Lecturas.findOne({
            where: { idservicio, mes, año }
        });

        if (lecturaExistentePorServicioMesAno) {
            return res.status(400).json({ message: 'Ya existe una lectura para este servicio en el mismo mes y año.' });
        }

        const cuota = parseFloat(servicio.configuracion.cuota);
        const porcentaje_base = 0.03; // 3% de mora
        const iva = 0.12;  // 12% de IVA
        const limiteExceso = parseFloat(servicio.configuracion.limite);
        const porcentajeExceso = 0.10;  // 10% del valor de la cuota

        // Crear la nueva lectura
        const nuevaLectura = await Lecturas.create({
            idservicio,
            lectura,
            mes,
            año,
            fecha,
            url_foto,
            idusuario,
            uuid,
            cuota
        });

        // Calcular el consumo del mes actual
        const lecturaMesAnterior = await Lecturas.findOne({
            where: {
                idservicio,
                [Op.or]: [
                    { año: { [Op.eq]: año }, mes: { [Op.lt]: mes } },
                    { año: { [Op.lt]: año } }
                ]
            },
            order: [['año', 'DESC'], ['mes', 'DESC']],
            limit: 1
        });

        // Usar lectura_inicial si no hay lectura anterior
        const lecturaAnteriorValor = lecturaMesAnterior ? parseFloat(lecturaMesAnterior.lectura) : parseFloat(servicio.lectura_inicial);
        const consumoActual = parseFloat(lectura) - lecturaAnteriorValor;

        // Calcular el exceso solo si el consumo actual excede el límite mensual
        let exceso = 0;
        let montoExceso = 0;
        if (consumoActual > limiteExceso) {
            exceso = consumoActual - limiteExceso;
            montoExceso = cuota * porcentajeExceso * exceso;  // Cálculo corregido
        }

        // Verificar las lecturas anteriores no pagadas (antes de la lectura actual)
        const lecturasNoPagadas = await Lecturas.findAll({
            where: {
                idservicio,
                mora_pagada: false,
                [Op.or]: [
                    { año: { [Op.lt]: año } },
                    { año: año, mes: { [Op.lt]: mes } }
                ]
            },
            order: [['año', 'ASC'], ['mes', 'ASC']]
        });

        let acumulado = 0;
        let total_acumulado_exceso = 0;
        let suma_total_acumulada = 0;

        // Procesar lecturas no pagadas
        for (let lecturaNoPagada of lecturasNoPagadas) {
            // Calcular meses de atraso
            const mesesDeAtraso = ((año - lecturaNoPagada.año) * 12) + (mes - lecturaNoPagada.mes);

            // Calcular el porcentaje de mora acumulado
            const porcentajeMora = porcentaje_base * mesesDeAtraso;  // Por ejemplo, 0.03 * 2 meses = 0.06

            // Convertir el porcentaje a porcentaje para mostrar (0.06 * 100 = 6%)
            const porcentajeMoraMostrar = porcentajeMora * 100;

            // Calcular mora acumulada
            let mora = 0;
            if (mesesDeAtraso > 0) {
                mora = cuota * porcentajeMora;
                mora += mora * iva;  // Aplicar IVA
            }

            const cuotaMensualTotal = cuota + mora;

            // Sumar la cuota mensual y mora al acumulado general
            acumulado += cuotaMensualTotal;

            // Acumular monto_exceso
            total_acumulado_exceso += parseFloat(lecturaNoPagada.monto_exceso || 0);

            // Calcular la suma total acumulada
            suma_total_acumulada = acumulado + total_acumulado_exceso;

            // Actualizar la lectura con los valores calculados
            await lecturaNoPagada.update({
                monto_mora: mora.toFixed(2),
                cuota_mensual: cuotaMensualTotal.toFixed(2),
                monto_acumulado: acumulado.toFixed(2),
                mora_pagada: false,
                total: total_acumulado_exceso.toFixed(2),
                suma_total: suma_total_acumulada.toFixed(2),
                porcentaje_acumulado: porcentajeMoraMostrar.toFixed(2)  // Actualizar el porcentaje acumulado
            });
        }

        // Para la nueva lectura (mes actual)
        const cuotaMensual = cuota.toFixed(2);

        // Sumar la cuota del mes actual al acumulado
        acumulado += parseFloat(cuotaMensual);

        // Sumar el monto del exceso al total acumulado de excesos
        total_acumulado_exceso += parseFloat(montoExceso);

        // Calcular la suma total acumulada
        suma_total_acumulada = acumulado + total_acumulado_exceso;

        // La nueva lectura no tiene mora, por lo que el porcentaje es 0%
        const porcentajeMoraNuevaLectura = 0;

        // Actualizar la nueva lectura creada (mes actual)
        await nuevaLectura.update({
            monto_mora: 0,  // Sin mora en el mes actual
            cuota_mensual: cuotaMensual,
            monto_acumulado: acumulado.toFixed(2),
            exceso: exceso.toFixed(2),
            monto_exceso: montoExceso.toFixed(2),
            exceso_pagado: false,
            total: total_acumulado_exceso.toFixed(2),
            suma_total: suma_total_acumulada.toFixed(2),
            lectura_pagada: false,
            mora_pagada: false,
            porcentaje_acumulado: porcentajeMoraNuevaLectura.toFixed(2)  // 0% para la nueva lectura
        });

        res.status(201).json({
            message: 'Lectura, exceso y moras generadas con éxito',
            nuevaLectura,
            excesoCreado: {
                exceso: exceso.toFixed(2),
                monto_exceso: montoExceso.toFixed(2)
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

        // Obtener el servicio con su configuración
        const servicio = await Servicios.findByPk(idservicio, {
            include: [{ model: Configuracion, as: 'configuracion' }]
        });

        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        const { mes_inicio_lectura, anio_inicio_lectura } = servicio;
        const porcentajeExceso = 0.10;  // 10% del valor de la cuota

        // Verificar si la lectura es anterior al inicio de lecturas
        if ((año < anio_inicio_lectura) || (año === anio_inicio_lectura && mes < mes_inicio_lectura)) {
            // La lectura no se cobra, se guarda como exonerada
            const nuevaLecturaExonerada = await Lecturas.create({
                idservicio,
                lectura,
                mes,
                año,
                fecha,
                url_foto,
                idusuario,
                uuid: uuid || require('uuid').v4(),
                monto_mora: 0,
                monto_acumulado: 0,
                mora_pagada: true,
                cuota: 0,
                cuota_mensual: 0,
                exceso: 0,
                exceso_pagado: true,
                porcentaje_acumulado: 0,
                total: 0,
                suma_total: 0,
                lectura_pagada: true
            });

            return res.status(201).json({
                message: 'Lectura exonerada creada con éxito',
                nuevaLecturaExonerada
            });
        }

        // Verificar si ya existe una lectura con el mismo idservicio, mes y año
        const lecturaExistentePorServicioMesAno = await Lecturas.findOne({
            where: { idservicio, mes, año }
        });

        if (lecturaExistentePorServicioMesAno) {
            return res.status(400).json({ message: 'Ya existe una lectura para este servicio en el mismo mes y año.' });
        }

        // Verificar si existe un pago adelantado para el mes y año de la lectura actual
        const pagoAdelantado = await Pagos_Adelantados.findOne({
            where: { idservicio, mes, año }
        });

        // Calcular el consumo del mes actual
        const lecturaMesAnterior = await Lecturas.findOne({
            where: {
                idservicio,
                [Op.or]: [
                    { año: { [Op.eq]: año }, mes: { [Op.lt]: mes } },
                    { año: { [Op.lt]: año } }
                ]
            },
            order: [['año', 'DESC'], ['mes', 'DESC']],
            limit: 1
        });

        // Usar lectura_inicial si no hay lectura anterior
        const lecturaAnteriorValor = lecturaMesAnterior ? parseFloat(lecturaMesAnterior.lectura) : parseFloat(servicio.lectura_inicial);
        const consumoActual = parseFloat(lectura) - lecturaAnteriorValor;

        if (pagoAdelantado) {
            // La lectura tiene un pago adelantado, se guarda con los valores especificados
            const nuevaLecturaPagada = await Lecturas.create({
                idservicio,
                lectura,
                mes,
                año,
                fecha,
                url_foto,
                idusuario,
                uuid: uuid || require('uuid').v4(),
                monto_mora: 0,
                monto_acumulado: 0,
                mora_pagada: true,
                cuota: 0,
                cuota_mensual: 0,
                exceso: 0,
                exceso_pagado: true,
                porcentaje_acumulado: 0,
                total: 0,
                suma_total: 0,
                lectura_pagada: true
            });

            // Si hay exceso (diferencia de lecturas mayor a 30), calcularlo normalmente
            let exceso = 0;
            let montoExceso = 0;
            if (consumoActual > 30) {
                exceso = consumoActual - 30;
                montoExceso = pagoAdelantado.cuota * porcentajeExceso * exceso;
                await nuevaLecturaPagada.update({
                    exceso: exceso.toFixed(2),
                    monto_exceso: montoExceso.toFixed(2),
                    exceso_pagado: false
                });
            }

            // Calcular la suma total acumulada
            const lecturasConExcesos = await Lecturas.findAll({
                where: {
                    idservicio,
                    [Op.or]: [
                        { lectura_pagada: false },
                        { exceso_pagado: false }
                    ]
                },
                order: [['año', 'ASC'], ['mes', 'ASC']]
            });
            let totalExcesoPendiente = 0;
            let montoAcumulado = 0;
            for (let lectura of lecturasConExcesos) {
                totalExcesoPendiente += parseFloat(lectura.monto_exceso || 0);
                montoAcumulado += parseFloat(lectura.cuota_mensual || 0);
                await lectura.update({
                    suma_total: (montoAcumulado + totalExcesoPendiente).toFixed(2)
                });
            }

            return res.status(201).json({
                message: 'Lectura con pago adelantado creada con éxito',
                nuevaLecturaPagada
            });
        }

        const cuota = parseFloat(servicio.configuracion.cuota);
        const porcentaje_base = 0.03; // 3% de mora
        const iva = 0.12;  // 12% de IVA
        const limiteExceso = parseFloat(servicio.configuracion.limite);

        // Crear la nueva lectura
        const nuevaLectura = await Lecturas.create({
            idservicio,
            lectura,
            mes,
            año,
            fecha,
            url_foto,
            idusuario,
            uuid: uuid || require('uuid').v4(),
            cuota
        });

        // Calcular el exceso solo si el consumo actual excede 30
        let exceso = 0;
        let montoExceso = 0;
        if (consumoActual > 30) {
            exceso = consumoActual - 30;
            montoExceso = cuota * porcentajeExceso * exceso;  // Cálculo corregido
        }

        // Verificar las lecturas anteriores no pagadas (antes de la lectura actual)
        const lecturasNoPagadas = await Lecturas.findAll({
            where: {
                idservicio,
                mora_pagada: false,
                [Op.or]: [
                    { año: { [Op.lt]: año } },
                    { año: año, mes: { [Op.lt]: mes } }
                ]
            },
            order: [['año', 'ASC'], ['mes', 'ASC']]
        });

        let acumulado = 0;
        let total_acumulado_exceso = 0;
        let suma_total_acumulada = 0;

        // Procesar lecturas no pagadas
        for (let lecturaNoPagada of lecturasNoPagadas) {
            // Calcular meses de atraso
            const mesesDeAtraso = ((año - lecturaNoPagada.año) * 12) + (mes - lecturaNoPagada.mes);

            // Calcular el porcentaje de mora acumulado
            const porcentajeMora = porcentaje_base * mesesDeAtraso;  // Por ejemplo, 0.03 * 2 meses = 0.06

            // Convertir el porcentaje a porcentaje para mostrar (0.06 * 100 = 6%)
            const porcentajeMoraMostrar = porcentajeMora * 100;

            // Calcular mora acumulada
            let mora = 0;
            if (mesesDeAtraso > 0) {
                mora = cuota * porcentajeMora;
                mora += mora * iva;  // Aplicar IVA
            }

            const cuotaMensualTotal = cuota + mora;

            // Sumar la cuota mensual y mora al acumulado general
            acumulado += cuotaMensualTotal;

            // Acumular monto_exceso
            total_acumulado_exceso += parseFloat(lecturaNoPagada.monto_exceso || 0);

            // Calcular la suma total acumulada
            suma_total_acumulada = acumulado + total_acumulado_exceso;

            // Actualizar la lectura con los valores calculados
            await lecturaNoPagada.update({
                monto_mora: mora.toFixed(2),
                cuota_mensual: cuotaMensualTotal.toFixed(2),
                monto_acumulado: acumulado.toFixed(2),
                mora_pagada: false,
                total: total_acumulado_exceso.toFixed(2),
                suma_total: suma_total_acumulada.toFixed(2),
                porcentaje_acumulado: porcentajeMoraMostrar.toFixed(2)  // Actualizar el porcentaje acumulado
            });
        }

        // Para la nueva lectura (mes actual)
        const cuotaMensual = cuota.toFixed(2);

        // Sumar la cuota del mes actual al acumulado
        acumulado += parseFloat(cuotaMensual);

        // Sumar el monto del exceso al total acumulado de excesos
        total_acumulado_exceso += parseFloat(montoExceso);

        // Calcular la suma total acumulada
        suma_total_acumulada = acumulado + total_acumulado_exceso;

        // La nueva lectura no tiene mora, por lo que el porcentaje es 0%
        const porcentajeMoraNuevaLectura = 0;

        // Actualizar la nueva lectura creada (mes actual)
        await nuevaLectura.update({
            monto_mora: 0,  // Sin mora en el mes actual
            cuota_mensual: cuotaMensual,
            monto_acumulado: acumulado.toFixed(2),
            exceso: exceso.toFixed(2),
            monto_exceso: montoExceso.toFixed(2),
            exceso_pagado: exceso === 0,
            total: total_acumulado_exceso.toFixed(2),
            suma_total: suma_total_acumulada.toFixed(2),
            lectura_pagada: false,
            mora_pagada: false,
            porcentaje_acumulado: porcentajeMoraNuevaLectura.toFixed(2)  // 0% para la nueva lectura
        });

        res.status(201).json({
            message: 'Lectura, exceso y moras generadas con éxito',
            nuevaLectura,
            excesoCreado: {
                exceso: exceso.toFixed(2),
                monto_exceso: montoExceso.toFixed(2)
            }
        });
    } catch (error) {
        console.error('Error en crearLectura:', error);
        res.status(500).json({ message: 'Error al crear Lectura', error: error.message });
    }
};




const actualizarLecturaPagada = async (req, res) => {
    const { idlectura } = req.params; // Obtener el ID de la lectura
    const { pagada, mora_pagada, exceso_pagado } = req.body; // Datos de la actualización

    try {
        // Buscar la lectura por su ID
        const lectura = await Lecturas.findByPk(idlectura);

        if (!lectura) {
            return res.status(404).json({ message: 'Lectura no encontrada.' });
        }

        // Actualizar los campos necesarios
        await lectura.update({
            pagada: pagada !== undefined ? pagada : lectura.pagada,
            mora_pagada: mora_pagada !== undefined ? mora_pagada : lectura.mora_pagada,
            exceso_pagado: exceso_pagado !== undefined ? exceso_pagado : lectura.exceso_pagado,
        });

        res.status(200).json({ message: 'Lectura actualizada con éxito.', lectura });
    } catch (error) {
        console.error('Error en actualizarLectura:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
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
    mostrarLecturasIdServicio,
    actualizarLecturaPagada,
    mostrarLecturasPagadasPorServicio
};
