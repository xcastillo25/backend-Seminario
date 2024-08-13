const personasController = require('../controllers').personas;

module.exports = (app) => {
    app.get('/api/personas', personasController.MostrarPersonas);
    app.get('/api/personas/activo', personasController.MostrarPersonasActivas);
    app.post('/api/personas', personasController.crearPersona);
    app.put('/api/personas/:idpersona', personasController.actualizarPersona);
    app.delete('/api/personas/:idpersona', personasController.eliminarPersona);
    app.patch('/api/personas/:idpersona/toggle', personasController.toggleActivoPersona);
}