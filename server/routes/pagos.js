const pagosController = require('../controllers').pagos;

module.exports = (app) => {
    app.get('/api/pagos', pagosController.MostrarPagos);
    app.get('/api/pagos/activo', pagosController.MostrarPagosActivos);
    app.post('/api/pagos', pagosController.crearPago);
    app.put('/api/pagos/:idpago', pagosController.actualizarPago);
    app.delete('/api/pagos/:idpago', pagosController.eliminarPago);
    app.patch('/api/pagos/:idpago/toggle', pagosController.toggleActivoPago);
}