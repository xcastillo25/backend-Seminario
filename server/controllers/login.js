const { tblempleados, tblusuarios } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config.js');

const login = async (req, res) => {
    try {
        const { usuario, password } = req.body;

        // Buscar el usuario por nombre de usuario
        const usuarioEncontrado = await tblusuarios.findOne({
            where: { usuario: usuario }
        });

        if (!usuarioEncontrado) {
            throw new Error('El usuario no se encuentra registrado.');
        }

        if (!usuarioEncontrado.activo) {
            throw new Error('El usuario no se encuentra activo.');
        }

        // Obtener el empleado asociado al usuario
        const empleado = await tblempleados.findByPk(usuarioEncontrado.idempleado);

        if (!empleado) {
            throw new Error('No se encontró un empleado asociado al usuario.');
        }

        // Verificar la contraseña
        const passwordIsValid = await bcrypt.compare(password, usuarioEncontrado.password);

        if (!passwordIsValid) {
            throw new Error('Credenciales Incorrectas');
        }

        // Generar el token de autenticación
        const token = jwt.sign(
            { id: usuarioEncontrado.idempleado },
            config.token_secret,
            { expiresIn: '1h' } // Expira en 1 hora
        );

        // Enviar la respuesta con el token y la información del empleado
        res.status(200).send({
            token,
            idempleado: empleado.idempleado,
            nombre: empleado.nombre,
            apellidos: empleado.apellidos,
            foto: empleado.foto
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

module.exports = {
    login
};
