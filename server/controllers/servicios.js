const { Servicio } = require('../models');


const mostrarServicios = async (req, res) => {
    try {
        const servicios = await Servicio.findAll();
        res.status(200).json({ servicios });
    } catch (error) {
        console.error('Error en mostrarServicios:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const mostrarServiciosActivos = async (req, res) => {
    try {
        const servicios = await Servicio.findAll({
            where: {
                activo: true
            }
        });
        res.status(200).json({ servicios });
    } catch (error) {
        console.error('Error en mostrarServicios:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const toggleActivoServicio = async (req, res) => {
    const { idservicio } = req.params;

    try {
        // Buscar el servicio por su ID
        const servicio = await Servicio.findByPk(idservicio);

        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        // Alternar el valor de activo
        servicio.activo = !servicio.activo;

        // Guardar el cambio en la base de datos
        await servicio.save();

        res.status(200).json({ message: 'Estado del servicio actualizado con éxito.', servicio });
    } catch (error) {
        console.error('Error en toggleActivoServicio:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const crearServicio = async (req, res) => {
    try {
        const { idconfiguracion, no_titulo, no_contador, estatus_contador } = req.body;

        const nuevoServicio = await Servicio.create({ idconfiguracion, no_titulo, no_contador, estatus_contador });

        res.status(201).json({ nuevoServicio });
    } catch (error) {
        console.error('Error en crearServicio:', error);
        res.status(400).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const actualizarServicio = async (req, res) => {
    const { idservicio } = req.params;
    const { idconfiguracion, no_titulo, no_contador, estatus_contador } = req.body;

    try {
        const servicio = await Servicio.findByPk(idservicio);

        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        await servicio.update({ idconfiguracion, no_titulo, no_contador, estatus_contador });

        res.status(200).json({ message: 'Servicio actualizado con éxito.' });
    } catch (error) {
        console.error('Error en actualizarServicio:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const eliminarServicio = async (req, res) => {
    const { idservicio } = req.params;

    try {
        await Servicio.destroy({
            where: { idservicio: idservicio }
        });

        res.status(200).json({ message: 'Servicio eliminado definitivamente con éxito.' });
    } catch (error) {
        console.error('Error en eliminarServicio:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

module.exports = {
    mostrarServicios, mostrarServiciosActivos, crearServicio, actualizarServicio, eliminarServicio,
    toggleActivoServicio
};
