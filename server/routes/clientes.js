const clientesController = require('../controllers').clientes;

module.exports = (app) => {
    app.get('/api/clientes', clientesController.MostrarClientes);
    app.get('/api/clientes/activo', clientesController.MostrarClientesActivos);
    app.post('/api/clientes', clientesController.crearCliente);
    app.put('/api/clientes/:idcliente', clientesController.actualizarCliente);
    app.delete('/api/clientes/:idcliente', clientesController.eliminarCliente);
    app.patch('/api/clientes/:idcliente/toggle', clientesController.toggleActivoCliente);
}