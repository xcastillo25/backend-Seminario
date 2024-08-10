const configuracionController = require('../controllers').configuracion;

module.exports = (app) => {
    app.get('/api/configuracion', configuracionController.mostrarConfiguracion);
    app.post('/api/configuracion', configuracionController.crearConfiguracion);
    app.put('/api/configuracion/:idconfiguracion', configuracionController.actualizarConfiguracion);
    app.delete('/api/configuracion/:idconfiguracion', configuracionController.eliminarConfiguracion);
    app.patch('/api/configuracion/:idconfiguracion/toggle', configuracionController.toggleActivoConfiguracion);
};
