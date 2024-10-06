const pagoServiciosController = require('../controllers/pago-servicios');

module.exports = (app) => {
    app.get('/api/pagoser', pagoServiciosController.MostrarPagos);
    //app.get('/api/pagos/activo', pagosController.MostrarPagosActivos);
    app.post('/api/pagoser', pagoServiciosController.crearPago);
    app.put('/api/pagoser/:idpago', pagoServiciosController.actualizarPago);
    //app.delete('/api/pagos/:idpago', pagosController.eliminarPago);
    //app.patch('/api/pagos/:idpago/toggle', pagosController.toggleActivoPago);
}