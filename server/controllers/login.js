const { Usuarios, Empleados, Roles } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config.js');

const login = async (req, res) => {
    try {
        const { usuario, password } = req.body;

        // Buscar el usuario por nombre de usuario
        const usuarioEncontrado = await Usuarios.findOne({
            where: { usuario: usuario },
            include: [
                {
                    model: Empleados,
                    as: 'empleados',
                    attributes: ['nombre', 'apellidos']
                },
                {
                    model: Roles,
                    as: 'roles',
                    attributes: ['rol'] // Asegúrate de que 'rol' es el nombre correcto del atributo en tu tabla de roles
                }
            ]
        });

        if (!usuarioEncontrado) {
            throw new Error('El usuario no se encuentra registrado.');
        }

        if (!usuarioEncontrado.activo) {
            throw new Error('El usuario no se encuentra activo.');
        }

        // Verificar la contraseña
        const passwordIsValid = await bcrypt.compare(password, usuarioEncontrado.password);

        if (!passwordIsValid) {
            throw new Error('Credenciales Incorrectas');
        }

        // Generar el token de autenticación
        const token = jwt.sign(
            { id: usuarioEncontrado.idusuario },
            config.token_secret,
            { expiresIn: '1h' }
        );

        // Enviar la respuesta con el token, la información del empleado y el rol
        res.status(200).send({
            token,
            idusuario: usuarioEncontrado.idusuario,
            idempleado: usuarioEncontrado.idempleado,
            nombre: usuarioEncontrado.empleados.nombre,
            apellidos: usuarioEncontrado.empleados.apellidos,
            foto: usuarioEncontrado.empleados.foto,
            rol: usuarioEncontrado.roles.rol // Aquí se incluye el rol
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

module.exports = {
    login
};
