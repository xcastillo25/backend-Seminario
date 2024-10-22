const lecturasController = require('../controllers').lecturas;

module.exports = (app) => {
    app.get('/api/lectura', lecturasController.mostrarLecturas);
    app.get('/api/viewlecturas', lecturasController.mostrarLecturasDiarias);
    app.get('/api/lectura/activo', lecturasController.mostrarLecturasActivas);
    app.get('/api/lecturas-idservicio/:idservicio', lecturasController.mostrarLecturasIdServicio);
    app.get('/api/lecturas-pagadas/:idservicio', lecturasController.mostrarLecturasPagadasPorServicio);
    app.post('/api/lectura', lecturasController.crearLectura);
    app.put('/api/lectura/:idlectura', lecturasController.actualizarLectura);
    app.put('/api/lectura-pagada/:idlectura', lecturasController.actualizarLecturaPagada);
    app.put('/api/lectura-parcial/:idlectura', lecturasController.actualizarLecturaParcial);
    app.delete('/api/lectura/:idlectura', lecturasController.eliminarLectura);
    app.patch('/api/lectura/:idlectura/toggle', lecturasController.toggleActivoLectura);
    app.get('/api/lecturas-no-pagadas/:idservicio', lecturasController.obtenerLecturasNoPagadas);
};
