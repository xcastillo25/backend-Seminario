const { Usuarios } = require('../models');
const { Roles } = require('../models');
const { Empleados } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

const mostrarUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuarios.findAll({
            include: [
                {
                    model: Roles,
                    as: 'roles',
                    attributes: ['rol'] 
                },
                {
                    model: Empleados,
                    as: 'empleados',
                    attributes: ['nombre', 'apellidos', 'email', 'telefono', 'cui']
                }
            ]
        });
        res.status(200).send({ Usuarios: usuarios });
    } catch (error) { 
        console.error(error);
        res.status(500).send({ message: 'Error interno del servidor', error: error.message });
    }
}

const mostrarUsuariosActivos = async (req, res) => {
    try {
        const usuarios = await Usuarios.findAll({
            where: {
                activo: true
            }
        });
        res.status(200).send({ Usuarios: usuarios });
    } catch (error) { 
        console.error(error);
        res.status(500).send({ message: 'Error interno del servidor', error: error.message });
    }
}

const mostrarUsuarioEmpleado = async (req, res) => {
    try {
        const { idempleado } = req.params;

        const usuarios = await Usuarios.findAll({
            where: { idempleado: idempleado },
            include: [
                {
                    model: Roles,
                    as: 'roles',
                    attributes: ['rol'] 
                }
            ]
        });

        res.status(200).send({ usuarios });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error interno del servidor', error: error.message });
    }
};



const crearUsuario = async (req, res) => {
    try {
        const { idempleado, usuario,  password, idrol } = req.body;

        // Verificar que todos los campos están presentes
        if (!idempleado  || !usuario || !password|| !idrol) {
            return res.status(400).send({ message: 'Todos los campos son obligatorios.' });
        }

        // Verificar si el empleado ya tiene un usuario
        const existeUsuarioEmpleado = await Usuarios.findOne({
            where: { idempleado: idempleado }
        });

        if (existeUsuarioEmpleado) {
            return res.status(400).send({ message: 'Este empleado ya cuenta con un usuario.' });
        }

        // Verificar si el nombre de usuario ya está en uso
        const existeUsuario = await Usuarios.findOne({
            where: { usuario: usuario }
        });

        if (existeUsuario) {
            return res.status(400).send({ message: 'El nombre de usuario ya está en uso.' });
        }

        // Encriptar el password antes de guardarlo en la base de datos
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el nuevo usuario asociado al empleado
        const nuevoUsuario = await Usuarios.create({
            idempleado: idempleado,
            usuario: usuario,
            password: hashedPassword,
            idrol: idrol
        });

        res.status(201).send({ nuevoUsuario });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error interno del servidor', error: error.message });
    }
};


const actualizarUsuario = async (req, res) => {
    const { idusuario } = req.params;

    try {
        const usuario = await Usuarios.findByPk(idusuario);

        if (!usuario) {
            return res.status(404).send({ message: 'Usuario no encontrado.' });
        }

        // Verifica si ya existe otro usuario con el mismo correo
        const existeUsuario = await Usuarios.findOne({
            where: {
                usuario: req.body.usuario,
                idusuario: { [Op.ne]: idusuario } // Excluye el usuario actual
            }
        });

        if (existeUsuario) {
            return res.status(400).send({ message: 'Ya has registrado a este usuario' });
        }

        // Actualiza el usuario con los datos proporcionados en el cuerpo de la solicitud
        await usuario.update(req.body);

        res.status(200).send({ message: 'Usuario actualizado con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error interno del servidor', error: error.message });
    }
};


const eliminarUsuario = async (req, res) => {
    const { idusuario } = req.params;

    try{
        await Usuarios.destroy({
            where: { idusuario: idusuario}
        });

        res.status(200).send({ message: 'Usuario eliminado definitivamente con éxito.'});
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error interno del servidor', error: error.message})
    }
}

const cambiarEstadoUsuario = async (req, res) => { 
    try{
        const { idusuario } = req.params;
        const usuario = await Usuarios.findOne({ where: {idusuario: idusuario}});

        usuario.activo = !usuario.activo;

        await usuario.save();

        res.send({ message: 'Estado del usuario actualizado con éxito.', usuario});
    } catch(error){
        res.status(500).send({ message: error.message});
    }
};

const resetPassword = async (req, res) => {
    const { idusuario } = req.params;

    try {
        const usuario = await Usuarios.findByPk(idusuario);

        if (!usuario) {
            return res.status(404).send({ message: 'Usuario no encontrado.' });
        }

        // Nueva contraseña por defecto
        const nuevaContrasena = 'Abc123#';

        // Encriptar la nueva contraseña
        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

        // Actualizar la contraseña del usuario
        usuario.password = hashedPassword;
        await usuario.save();

        res.status(200).send({ message: 'Contraseña restablecida con éxito.', nuevaContrasena: 'Abc123#' });
    } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
        res.status(500).send({ message: 'Error interno del servidor', error: error.message });
    }
};


module.exports = {
    mostrarUsuarios, mostrarUsuariosActivos,
    crearUsuario, actualizarUsuario, eliminarUsuario,
    cambiarEstadoUsuario, resetPassword, mostrarUsuarioEmpleado
};