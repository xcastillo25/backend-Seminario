const historialServiciosController = require('../controllers').historial_servicios;

module.exports = (app) => {
    app.get('/api/historial-servicio', historialServiciosController.mostrarHistorialServicios);
    app.get('/api/historial-servicio/activa', historialServiciosController.mostrarHistorialServiciosActivos);
    app.post('/api/historial-servicio', historialServiciosController.crearHistorialServicios);
    app.put('/api/historial-servicio/:idhistorial_servicios', historialServiciosController.actualizarHistorialServicios);
    app.delete('/api/historial-servicio/:idhistorial_servicios', historialServiciosController.eliminarHistorialServicios);
    app.patch('/api/historial-servicio/:idhistorial_servicios/toggle', historialServiciosController.toggleActivoHistorialServicios);
};
