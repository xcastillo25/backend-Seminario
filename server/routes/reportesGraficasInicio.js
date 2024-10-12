const reportesGraficasInicioController = require('../controllers').reportesGraficasInicio;

module.exports = (app) => {
    app.get('/api/mostrarResumenLecturas', reportesGraficasInicioController.mostrarResumenLecturas);
    app.get('/api/mostrarResumenServicios', reportesGraficasInicioController.mostrarResumenServicios);
    app.get('/api/mostrarResumenPagos', reportesGraficasInicioController.mostrarResumenPagos);
}