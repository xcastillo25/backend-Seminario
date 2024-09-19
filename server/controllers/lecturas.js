const { where } = require('sequelize');
const { Lecturas, ViewLecturas, Servicios } = require('../models');
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

//Crear Lectura
const crearLectura = async (req, res) => {
    const { idservicio, lectura, mes, año, fecha, url_foto, idusuario } = req.body;

    const data = {
        idservicio,
        lectura,
        mes,
        año,
        fecha,
        url_foto,
        idusuario,
        uuid: uuidv4() // Generar un UUID único para esta lectura
    };

    try {
        // Verificar si ya existe una lectura para el mismo idservicio, mes y año
        const lecturaExistente = await Lecturas.findOne({
            where: { idservicio, mes, año }
        });

        if (lecturaExistente) {
            return res.status(400).json({ message: 'Ya existe una lectura para este servicio en el mismo mes y año.' });
        }

        // Crear la nueva lectura
        const nuevaLectura = await Lecturas.create(data);

        res.status(201).json({ nuevaLectura });
    } catch (error) {
        console.error('Error en crearLectura:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const actualizarLectura = async (req, res) => {
    const { idlectura } = req.params;
    const { lectura, fecha, url_foto} = req.body;

    try {
        const lecturasEncontrado = await Lecturas.findByPk(idlectura);

        if (!lecturasEncontrado) {
            return res.status(404).json({ message: 'Lectura no encontrado.' });
        }

        await lecturasEncontrado.update({ lectura,fecha,url_foto });

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
