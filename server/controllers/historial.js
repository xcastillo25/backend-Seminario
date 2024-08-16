const { Historial } = require('../models');

const mostrarHistorial = async (req, res) => {
    try {
        const historial = await Historial.findAll();
        res.status(200).json({ historial });
    } catch (error) {
        console.error('Error en mostrarHistorial:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const mostrarHistorialActivos = async (req, res) => {
    try {
        const historial = await Historial.findAll({
            where: {
                activo: true
            }
        });
        res.status(200).json({ historial });
    } catch (error) {
        console.error('Error en mostrarHistorialActivos:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const toggleActivoHistorial = async (req, res) => {
    const { idhistorial } = req.params;

    try {
        const historial = await Historial.findByPk(idhistorial);
        if (!historial) {
            return res.status(404).json({ message: 'Historial no encontrado' });
        }
        historial.activo = !historial.activo;
        await historial.save();
        res.status(200).json({ message: 'Historial actualizado con éxito', historial });
    } catch (error) {
        console.error('Error en toggleActivoHistorial:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const crearHistorial = async (req, res) => {
    try {
        const { fecha, idusuario, accion } = req.body;
        const historial = await Historial.create({ fecha, idusuario, accion });
        res.status(201).json({ message: 'Historial creado con éxito', historial });
    } catch (error) {
        console.error('Error en crearHistorial:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const actualizarHistorial = async (req, res) => {
    const { idhistorial } = req.params;
    const { fecha, idusuario, accion } = req.body;

    try {
        const historial = await Historial.findByPk(idhistorial);

        if (!historial) {
            return res.status(404).json({ message: 'Historial no encontrado' });
        }

        await historial.update({ fecha, idusuario, accion });
        res.status(200).json({ message: 'Historial actualizado con éxito', historial });
    } catch (error) {
        console.error('Error en actualizarHistorial:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const eliminarHistorial = async (req, res) => {
    const { idhistorial } = req.params;

    try {
        await Historial.destroy({
            where: { idhistorial: idhistorial }
        });
        res.status(200).json({ message: 'Historial eliminado definitivamente con éxito.' });
    } catch (error) {
        console.error('Error en eliminarHistorial:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};


module.exports = {
    mostrarHistorial,
    mostrarHistorialActivos,
    toggleActivoHistorial,
    crearHistorial,
    actualizarHistorial,
    eliminarHistorial
};
