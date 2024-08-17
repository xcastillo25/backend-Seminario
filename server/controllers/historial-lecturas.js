const { HistorialLecturas } = require('../models');

const mostrarHistorialLecturas = async (req, res) => {
    try {
        const historialLecturas = await HistorialLecturas.findAll();
        res.status(200).json({ historialLecturas });
    } catch (error) {
        console.error('Error al Mostrar el Historial de Lecturas', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}

const mostrarHistorialLecturasActivos = async (req, res) => {
    try {
        const historialLecturas = await HistorialLecturas.findAll({
            where: {
                activo: true
            }
        });
        res.status(200).json({ historialLecturas });
    } catch (error) {
        console.error('Error al Mostrar los Historial de Lecturas Activos', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}

const toggleActivoHistorialLecturas = async (req, res) => {
    const { idhistorial_lectura } = req.params;
    try {
        const historialLecturas = await HistorialLecturas.findByPk(idhistorial_lectura);

        if (!historialLecturas) {
            return res.status(404).json({ message: 'Historial de Lecturas no Encontrado.' });
        }
        historialLecturas.activo = !historialLecturas.activo;

        await historialLecturas.save();

        res.status(200).json({ message: 'Estado del Historial de Lecturas actualizado con éxito.', historialLecturas });
    } catch (error) {
        console.error('Error al cambiar el estado del Historial de Lecturas:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}

const crearHistorialLecturas = async (req, res) => {
    try {
        const { idlectura, lectura_anterior, nueva_lectura, fecha } = req.body;

        const nuevoHistorialLecturas = await HistorialLecturas.create({
            idlectura, lectura_anterior, nueva_lectura, fecha
        });

        res.status(201).json({ nuevoHistorialLecturas });
    } catch (error) {
        console.error('Error en crear Historial de Lecturas:', error);
        res.status(400).json({ message: 'Error interno del servidor', error: error.message });
    }
}

const actualizarHistorialLecturas = async (req, res) => {
    const { idhistorial_lectura } = req.params; // ID pasado en la URL
    const { idlectura, lectura_anterior, nueva_lectura, fecha } = req.body; // Datos del cuerpo de la solicitud

    try {
        const historialLecturas = await HistorialLecturas.findByPk(idhistorial_lectura);

        if (!historialLecturas) {
            return res.status(404).json({ message: 'Historial de Lecturas no encontrado.' });
        }

        await HistorialLecturas.update(
            { idlectura, lectura_anterior, nueva_lectura, fecha }, // Datos a actualizar
            { where: { idhistorial_lectura } } // Condición de búsqueda
        );

        res.status(200).json({ message: 'Historial de Lecturas actualizado con éxito.' });
    } catch (error) {
        console.error('Error en actualizar Historial de Lecturas:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};


const eliminarHistorialLecturas = async (req, res) => {
    const { idhistorial_lectura } = req.params;

    try {
        await HistorialLecturas.destroy({
            where: { idhistorial_lectura: idhistorial_lectura }
        });
        res.status(200).json({ message: 'Historial de Lecturas eliminado definitivamente con éxito.' });
    } catch (error) {
        console.error('Error en eliminar Historial de Lecturas:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}

module.exports = {
    mostrarHistorialLecturas, 
    mostrarHistorialLecturasActivos, 
    crearHistorialLecturas, 
    actualizarHistorialLecturas, 
    eliminarHistorialLecturas,
    toggleActivoHistorialLecturas
}