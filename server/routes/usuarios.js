const usuariosController = require('../controllers').usuarios;

module.exports = (app) => {
    app.get('/api/usuarios/', usuariosController.mostrarUsuarios);
    app.get('/api/usuarios-activos', usuariosController.mostrarUsuariosActivos);
    app.get('/api/usuario-empleado/:idempleado', usuariosController.mostrarUsuarioEmpleado);
    app.post('/api/usuarios', usuariosController.crearUsuario);
    app.put('/api/usuarios/:idusuario', usuariosController.actualizarUsuario);
    app.delete('/api/usuarios/:idusuario', usuariosController.eliminarUsuario);
    app.put('/api/estado-usuarios/:idusuario', usuariosController.cambiarEstadoUsuario);
    app.put('/api/reset-password/:idusuario', usuariosController.resetPassword);
};
