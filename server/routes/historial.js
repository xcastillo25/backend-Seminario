const historialController = require('../controllers').historial;


module.exports = (app) => {
    app.get('/api/historial', historialController.mostrarHistorial);
    app.get('/api/historial/activo', historialController.mostrarHistorialActivos);
    app.post('/api/historial', historialController.crearHistorial);
    app.put('/api/historial/:idhistorial', historialController.actualizarHistorial);
    app.delete('/api/historial/:idhistorial', historialController.eliminarHistorial);
    app.patch('/api/historial/:idhistorial/toggle', historialController.toggleActivoHistorial);

};
