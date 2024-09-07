const viewlecturasController = require('../controllers').viewlecturas;

module.exports = (app) => {
    app.get('/api/view-lecturas', viewlecturasController.obtenerTodasLasLecturas);
    //app.get('/view-lecturas/servicio/:idservicio', viewlecturasController.mostrarLecturasPorServicio);
};