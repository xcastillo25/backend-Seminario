const rolController = require('../controllers').roles;
module.exports = (app) => {

    app.get('/api/rol',rolController.MostrarRoles);
    app.get('/api/rol/activo', rolController.mostrarRolesActivos);
    app.post('/api/rol', rolController.crearRol);
    app.put('/api/rol/:idrol', rolController.actualizarRol);
    app.delete('/api/rol/:idrol', rolController.eliminarRol);
    app.patch('/api/rol/:idrol/toggle', rolController.toggleActivoRol);
}