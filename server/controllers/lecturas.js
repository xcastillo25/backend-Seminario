const { where } = require('sequelize');
const { Lecturas } = require('../models');
const lecturas = require('../models/lecturas');

const mostrarLecturas = async (req, res) => {
    try {
        const lecturas = await Lecturas.findAll();
        res.status(200).json({ lecturas });
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
    try{
        const { idlote, lectura, fecha, url_foto,idusuario} = req.body;

        const nuevaLectura = await Lecturas.create({idlote,lectura, fecha, url_foto,idusuario });
        
        res.status(201).json ({ nuevaLectura });
    }catch (error){
        console.error('Error en crearLectura:' ,error);
        res.status(400).json({message: 'Error al crear Lectura', error: error.message});
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
    toggleActivoLectura
};