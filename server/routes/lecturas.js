const lecturasController = require('../controllers').lecturas;

module.exports = (app) => {
    app.get('/api/lectura', lecturasController.mostrarLecturas);
    app.get('/api/lectura/activo', lecturasController.mostrarLecturasActivas);
    app.post('/api/lectura', lecturasController.crearLectura);
    app.put('/api/lectura/:idlectura', lecturasController.actualizarLectura);
    app.delete('/api/lectura/:idlectura', lecturasController.eliminarLectura);
    app.patch('/api/lectura/:idlectura/toggle', lecturasController.toggleActivoLectura);
};
