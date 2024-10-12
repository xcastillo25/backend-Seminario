const reportesGraficasInicioController = require('../controllers').reportesGraficasInicio;

module.exports = (app) => {
    app.get('/api/reportesGraficasInicio', reportesGraficasInicioController.mostrarResumenLecturas);
    app.get('/api/reportesGraficasInicioServicios', reportesGraficasInicioController.mostrarResumenServicios);
}