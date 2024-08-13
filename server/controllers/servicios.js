const { Servicios } = require('../models');


const mostrarServicios = async (req, res) => {
    try {
        const servicios = await Servicios.findAll();
        res.status(200).json({ servicios });
    } catch (error) {
        console.error('Error en mostrar los Servicios:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const mostrarServiciosActivos = async (req, res) => {
    try {
        const servicios = await Servicios.findAll({
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
        const servicio = await Servicios.findByPk(idservicio);

        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        // Alternar el valor de activo
        servicio.activo = !servicio.activo;

        // Guardar el cambio en la base de datos
        await servicio.save();

        res.status(200).json({ message: 'Estado del servicio actualizado con éxito.', servicio });
    } catch (error) {
        console.error('Error al cambiar el estado del servicio:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const crearServicio = async (req, res) => {
    try {
        const { idconfiguracion, no_titulo, no_contador, estatus_contador } = req.body;

        const nuevoServicio = await Servicios.create({ idconfiguracion, no_titulo, no_contador, estatus_contador });

        res.status(201).json({ nuevoServicio });
    } catch (error) {
        console.error('Error en crear un Servicio:', error);
        res.status(400).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const actualizarServicio = async (req, res) => {
    const { idservicio } = req.params;
    const { idconfiguracion, no_titulo, no_contador, estatus_contador } = req.body;

    try {
        const servicio = await Servicios.findByPk(idservicio);

        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        await servicio.update({ idconfiguracion, no_titulo, no_contador, estatus_contador });

        res.status(200).json({ message: 'Servicio actualizado con éxito.' });
    } catch (error) {
        console.error('Error en actualizar el Servicio:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const eliminarServicio = async (req, res) => {
    const { idservicio } = req.params;

    try {
        await Servicios.destroy({
            where: { idservicio: idservicio }
        });

        res.status(200).json({ message: 'Servicio eliminado definitivamente con éxito.' });
    } catch (error) {
        console.error('Error en eliminar el Servicio:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

module.exports = {
    mostrarServicios, mostrarServiciosActivos, crearServicio, actualizarServicio, eliminarServicio,
    toggleActivoServicio
};
