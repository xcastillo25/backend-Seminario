const usuariosController = require('../controllers').usuarios;

module.exports = (app) => {
    app.get('/api/usuario', usuariosController.mostrarUsuarios);
    app.get('/api/usuarios-activos', usuariosController.mostrarUsuariosActivos);
    app.get('/api/usuario-empleado/:idempleado', usuariosController.mostrarUsuarioEmpleado);
    app.post('/api/usuarios', usuariosController.crearUsuario);
    app.put('/api/usuarios/:idusuario', usuariosController.actualizarUsuario);
    app.put('/api/usuarios-sin-pass/:idusuario', usuariosController.actualizarUsuarioSinPass);
    app.delete('/api/usuarios/:idusuario', usuariosController.eliminarUsuario);
    app.patch('/api/usuarios/:idusuario/toggle', usuariosController.cambiarEstadoUsuario);
    app.put('/api/reset-password', usuariosController.resetPassword);
    app.put('/api/reset-password-idusuario', usuariosController.resetPasswordPorIdUsuario);
};
