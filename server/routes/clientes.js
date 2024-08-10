const clientesController = require('../controllers').clientes;

module.exports = (app) => {
    app.get('/api/clientes', clientesController.mostrarClientes);
    app.post('/api/clientes', clientesController.crearCliente);
    app.put('/api/clientes/:idcliente', clientesController.actualizarCliente);
    app.delete('/api/clientes/:idcliente', clientesController.eliminarCliente);
}