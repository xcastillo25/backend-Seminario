const { ViewServices } = require('../models');

const mostrarViewServices = async (req, res) => {
    try {
        const viewServices = await ViewServices.findAll();
        res.status(200).json({ viewServices });
    } catch (error) {
        console.error('Error al mostrar los servicios de la vista:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const mostrarViewServicesActivos = async (req, res) => {
    try {
        const viewServices = await ViewServices.findAll({
            where: {
                estatus_contador: 'activo' // Suponiendo que "estatus_contador" indica si el servicio está activo
            }
        });
        res.status(200).json({ viewServices });
    } catch (error) {
        console.error('Error al mostrar los servicios activos de la vista:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

// No se necesita un método para crear, actualizar o eliminar, ya que esta es una vista de solo lectura.

module.exports = {
    mostrarViewServices,
    mostrarViewServicesActivos
};
