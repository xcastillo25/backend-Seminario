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

const crearLectura = async (req, res) => {
    try {
        const { idservicio, lectura, mes, año, fecha, url_foto, idusuario, uuid } = req.body;

        console.log('Datos recibidos:', { idservicio, lectura, mes, año, fecha, url_foto, idusuario, uuid });

        // Verificar si ya existe una lectura con el mismo UUID
        const lecturaExistentePorUUID = await Lecturas.findOne({
            where: { uuid }
        });

        if (lecturaExistentePorUUID) {
            console.log('Lectura existente por UUID:', lecturaExistentePorUUID);
            return res.status(400).json({ message: 'La lectura ya ha sido sincronizada previamente.' });
        }

        // Verificar si ya existe una lectura con el mismo idservicio, mes y año
        const lecturaExistentePorServicioMesAno = await Lecturas.findOne({
            where: {
                idservicio,
                mes,
                año
            }
        });

        if (lecturaExistentePorServicioMesAno) {
            console.log('Lectura existente por servicio, mes y año:', lecturaExistentePorServicioMesAno);
            return res.status(400).json({ message: 'Ya existe una lectura para este servicio en el mismo mes y año.' });
        }

        // Crear la nueva lectura si no hay conflictos
        const nuevaLectura = await Lecturas.create({
            idservicio,
            lectura,
            mes,
            año,
            fecha,
            url_foto,
            idusuario,
            uuid  // Guardar el UUID
        });

        console.log('Nueva lectura creada:', nuevaLectura);

        // Obtener la lectura del mes anterior (del mismo servicio, mes anterior y mismo año)
        const lecturaMesAnterior = await Lecturas.findOne({
            where: {
                idservicio,
                mes: mes - 1 > 0 ? mes - 1 : 12,  // Si es enero (mes 1), debemos verificar diciembre del año anterior
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

        console.log('Exceso calculado:', exceso, 'Monto del exceso:', montoExceso);

        // Crear el registro en la tabla Excesos (siempre, incluso si el exceso es 0)
        const excesoCreado = await Excesos.create({
            idlectura: nuevaLectura.idlectura,
            exceso: exceso,
            monto_exceso: montoExceso,
            mora: 0,  // Puedes ajustar este valor o calcular la mora si es necesario
            activo: true,
            pagada: false
        });

        console.log('Exceso creado:', excesoCreado);

        res.status(201).json({
            nuevaLectura,
            excesoCreado: {
                idexceso: excesoCreado.idexceso,
                exceso: excesoCreado.exceso,
                monto_exceso: excesoCreado.monto_exceso
            },
            message: 'Lectura y exceso (incluyendo 0) creados con éxito'
        });
    } catch (error) {
        console.error('Error en crearLectura:', error);
        res.status(500).json({ message: 'Error al crear Lectura', error: error.message });
    }
};

const actualizarLectura = async (req, res) => {
    const { idlectura } = req.params;
    const { lectura, url_foto, idusuario} = req.body;

    try {
        const lecturasEncontrado = await Lecturas.findByPk(idlectura);

        if (!lecturasEncontrado) {
            return res.status(404).json({ message: 'Lectura no encontrado.' });
        }

        await lecturasEncontrado.update({ lectura,url_foto, idusuario });

        res.status(200).json({ message: 'Lectura actualizada con éxito.' });
    } catch (error) {
        console.error('Error en actualizarLectura:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
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
    mostrarLecturasDiarias
};
