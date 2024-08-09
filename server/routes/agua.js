const aguaController = require('../controllers').agua;

module.exports = (app) => {
    app.get('/api/agua', aguaController.mostrarAgua);
    app.post('/api/agua', aguaController.crearAgua);
    app.put('/api/agua/:idagua', aguaController.actualizarAgua);
    app.delete('/api/agua/:idagua', aguaController.eliminarAgua);
}