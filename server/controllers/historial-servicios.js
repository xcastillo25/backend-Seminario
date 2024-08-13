const {HistorialServicios} = require('../models');

const mostrarHistorialServicios = async (req, res) => {
    try{
        const historialServicios = await HistorialServicios.findAll();
        res.status(200).json({ historialServicios});
    } catch (error) {
        console.error('Error en mostrar el Historial de los Servicios', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message});
    }
}

const mostrarHistorialServiciosActivos = async (req, res) => {
    try{
        const historialServicios = await HistorialServicios.findAll({
            where: {
                activo: true
            }
        });
        res.status(200).json({ historialServicios});
    } catch (error) {
        console.error('Error en mostrar el Historial de los Servicios', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message});
    }
}

const toggleActivoHistorialServicios = async (req, res) => {
    const { idhistorial_servicios } = req.params;

    try{
        const historialServicios = await HistorialServicios.findByPk(idhistorial_servicios);

        if(!historialServicios) {
            return res.status(404).json({ message: 'Historial del servicio no encontrado' });
        }

        historialServicios.activo = !historialServicios.activo;

        await historialServicios.save();

        res.status(200).json({ message: 'Estado del historial de servicios actualizado con éxito.', historialServicios });
    } catch (error) {
        console.error('Error al cambiar el estado del historial de servicios:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}

const crearHistorialServicios = async (req, res) =>{
    try {
        const { idservicio, fecha, evento, monto } = req.body;

        const nuevoHistorialServicios = await HistorialServicios.create({
            idservicio, fecha, evento, monto
        });

        res.status(201).json( { nuevoHistorialServicios });

    } catch (error) {
        console.error('Error en crear un historial de Servicios:', error);
        res.status(400).json({ message: 'Error interno del servidor', error: error.message });
    }
}

const actualizarHistorialServicios = async (req, res) =>{
    
    const { idhistorial_servicios } = req.params;
    const { idservicio, fecha, evento, monto } = req.body;
    
    try{
        const historialServicios = await HistorialServicios.findByPk(idhistorial_servicios);

        if (!historialServicios) {
            return res.status(404).json({ message: 'Historial de Servicios no econtrado.' });
        }

        await historialServicios.update({ idservicio, fecha, evento, monto });

        res.status(200).json({ message: 'Historial de Servicios actualizado con éxito' });
    } catch (error) {
        console.error('Error en actualizar el Historial de Servicios:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }

}

const eliminarHistorialServicios = async (req, res) => {
    const { idhistorial_servicios } = req.params;

    try {
        await HistorialServicios.destroy({
            where: { idhistorial_servicios: idhistorial_servicios}
        });

        res.status(200).json({ message: 'Historial de Servicios eliminado definitivamente con éxito.'});
    } catch (error) {
        console.error('Error en eliminarel Historial de Servicios:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}

module.exports = {
    mostrarHistorialServicios, mostrarHistorialServiciosActivos, crearHistorialServicios, actualizarHistorialServicios, eliminarHistorialServicios,
    toggleActivoHistorialServicios
}