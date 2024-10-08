const empleadosController = require('../controllers').empleados;

module.exports = (app) => {
    app.get('/api/empleados', empleadosController.MostrarEmpleados);
    app.get('/api/empleado/:idempleado', empleadosController.MostrarEmpleadoPerfil);
    app.get('/api/empleados/activo', empleadosController.MostrarEmpleadosActivos);
    app.post('/api/empleados', empleadosController.crearEmpleado);
    app.put('/api/empleados/:idempleado', empleadosController.actualizarEmpleado);
    app.put('/api/telefono-empleados/:idempleado', empleadosController.actualizarTelefonoEmpleado);
    app.delete('/api/empleados/:idempleado', empleadosController.eliminarEmpleado);
    app.patch('/api/empleados/:idempleado/toggle', empleadosController.toggleActivoEmpleado);
}