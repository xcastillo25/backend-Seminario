const { Configuracion } = require('../models');

const mostrarConfiguracion = async (req, res) => {
    try {
        const configuraciones = await Configuracion.findAll({
            where: {
                activo: true
            }
        });
        res.status(200).json({ configuraciones });
    } catch (error) {
        console.error('Error en mostrarConfiguracion:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const toggleActivoConfiguracion = async (req, res) => {
    const { idconfiguracion } = req.params;

    try {
        // Buscar la configuración por su ID
        const configuracion = await Configuracion.findByPk(idconfiguracion);

        if (!configuracion) {
            return res.status(404).json({ message: 'Configuración no encontrada.' });
        }

        // Alternar el valor de activo
        configuracion.activo = !configuracion.activo;

        // Guardar el cambio en la base de datos
        await configuracion.save();

        res.status(200).json({ message: 'Estado de la configuración actualizado con éxito.', configuracion });
    } catch (error) {
        console.error('Error en toggleActivoConfiguracion:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const crearConfiguracion = async (req, res) => {
    try {
        const { servicio, cuota, mora, empresa, direccion, exceso, porcentaje_exceso, limite, cuota_instalacion, cuota_reconexion } = req.body;

        const nuevaConfiguracion = await Configuracion.create({ servicio, cuota, mora, empresa, direccion, exceso, porcentaje_exceso, limite, cuota_instalacion, cuota_reconexion });

        res.status(201).json({ nuevaConfiguracion });
    } catch (error) {
        console.error('Error en crearConfiguracion:', error);
        res.status(400).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const actualizarConfiguracion = async (req, res) => {
    const { idconfiguracion } = req.params;
    const { servicio, cuota, mora, empresa, direccion, exceso, porcentaje_exceso, limite, cuota_instalacion, cuota_reconexion } = req.body;

    try {
        const configuracion = await Configuracion.findByPk(idconfiguracion);

        if (!configuracion) {
            return res.status(404).json({ message: 'Configuración no encontrada.' });
        }

        await configuracion.update({ servicio, cuota, mora, empresa, direccion, exceso, porcentaje_exceso, limite, cuota_instalacion, cuota_reconexion });

        res.status(200).json({ message: 'Configuración actualizada con éxito.' });
    } catch (error) {
        console.error('Error en actualizarConfiguracion:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const eliminarConfiguracion = async (req, res) => {
    const { idconfiguracion } = req.params;

    try {
        await Configuracion.destroy({
            where: { idconfiguracion: idconfiguracion }
        });

        res.status(200).json({ message: 'Configuración eliminada definitivamente con éxito.' });
    } catch (error) {
        console.error('Error en eliminarConfiguracion:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

module.exports = {
    mostrarConfiguracion, crearConfiguracion, actualizarConfiguracion, eliminarConfiguracion,
    toggleActivoConfiguracion
};
