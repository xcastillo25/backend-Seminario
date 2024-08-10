const personasController = require('../controllers').personas;

module.exports = (app) => {
    app.get('/api/personas', personasController.MostrarPersonas);
    app.post('/api/personas', personasController.crearPersona);
    app.put('/api/personas/:idpersona', personasController.actualizarPersona);
    app.delete('/api/personas/:idpersona', personasController.eliminarPersona);
}