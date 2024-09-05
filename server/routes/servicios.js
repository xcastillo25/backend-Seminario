const servicioController = require('../controllers').servicios;

module.exports = (app) => {
    app.get('/api/servicio', servicioController.mostrarServicios);
    app.get('/api/servicio-pago', servicioController.mostrarServiciosPagos);
    app.get('/api/servicioalt', servicioController.mostrarServiciosAlt);
    app.get('/api/servicio/activo', servicioController.mostrarServiciosActivos);
    app.post('/api/servicio', servicioController.crearServicio);
    app.put('/api/servicio/:idservicio', servicioController.actualizarServicio);
    app.delete('/api/servicio/:idservicio', servicioController.eliminarServicio);
    app.patch('/api/servicio/:idservicio/toggle', servicioController.toggleActivoServicio);
};
