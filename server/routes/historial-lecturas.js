const historial_lecturasController = require('../controllers').historial_lecturas;

module.exports = (app) => {
    app.get('/api/historial-lectura', historial_lecturasController.mostrarHistorialLecturas);
    app.get('/api/historial-lectura/activo', historial_lecturasController.mostrarHistorialLecturasActivos);
    app.post('/api/historial-lectura', historial_lecturasController.crearHistorialLecturas);
    app.put('/api/historial-lectura/:idhistorial_lectura', historial_lecturasController.actualizarHistorialLecturas);
    app.delete('/api/historial-lectura/:idhistorial_lectura', historial_lecturasController.eliminarHistorialLecturas);
    app.patch('/api/historial-lectura/:idhistorial_lectura/toggle', historial_lecturasController.toggleActivoHistorialLecturas);
};