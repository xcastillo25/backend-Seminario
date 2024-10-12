const pagosAdelantadosController = require('../controllers').pagosAdelantados;

module.exports = (app) => {
    app.get('/api/pagos-adelantados/:idservicio', pagosAdelantadosController.mostrarPagosAdelantadosPorServicio);  
    app.post('/api/pagos-adelantados', pagosAdelantadosController.agregarPagoAdelantado);  
}