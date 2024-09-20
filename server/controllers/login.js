const { Usuarios, Empleados, Roles } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const config = require('../config/config.js');
const crypto = require('crypto');

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

const generarPasswordAleatorio = () => {
    return crypto.randomBytes(3).toString('hex'); // Genera una contraseña de 5 caracteres (números y letras)
};

const recuperarPassword = async (req, res) => {
    try {
        const { usuario, email } = req.body;

        // Buscar el usuario por nombre de usuario y correo
        const usuarioEncontrado = await Usuarios.findOne({
            where: { usuario },
            include: [{
                model: Empleados,
                as: 'empleados',
                where: { email }, // Asegúrate de que el campo correo sea el correcto en tu tabla de empleados
                attributes: ['nombre', 'email']
            }]
        });

        if (!usuarioEncontrado) {
            throw new Error('Usuario o correo incorrecto.');
        }

        // Generar una nueva contraseña aleatoria
        const nuevaPassword = generarPasswordAleatorio();

        // Hashear la nueva contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

        // Actualizar la contraseña del usuario
        await Usuarios.update(
            { password: hashedPassword },
            { where: { idusuario: usuarioEncontrado.idusuario } }
        );

        // Configurar el transporte de nodemailer usando las credenciales del archivo .env
        const transporter = nodemailer.createTransport({
            service: 'Outlook', // O cualquier otro servicio de correo que utilices
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        // Definir el contenido del correo electrónico
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Recuperación de Contraseña - Paseo Las Lomas Salamá',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">Recuperación de Contraseña</h2>
                <p style="font-size: 16px; color: #555;">
                    Hola <strong>${usuario}</strong>,
                </p>
                <p style="font-size: 16px; color: #555;">
                    Hemos recibido una solicitud para restablecer tu contraseña. Tu nueva contraseña temporal es la siguiente:
                </p>
                <div style="margin: 20px 0; padding: 15px; background-color: #f4f4f4; border: 1px solid #ddd; border-radius: 5px;">
                    <p style="font-size: 16px; color: #333;"><strong>Nueva Contraseña:</strong> ${nuevaPassword}</p>
                </div>
                <p style="font-size: 16px; color: #555;">
                    Por favor, inicia sesión con esta contraseña y no olvides cambiarla una vez que ingreses.
                </p>
                <p style="font-size: 16px; color: #555;">
                    Si no solicitaste este cambio de contraseña, ponte en contacto con nosotros lo antes posible.
                </p>
                <p style="font-size: 16px; color: #555;">
                    Saludos cordiales,
                </p>
                <p style="font-size: 16px; color: #555;">
                    El equipo de Paseo Las Lomas Salamá
                </p>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 14px; color: #aaa;">
                    <p>&copy; ${new Date().getFullYear()} Paseo Las Lomas Salamá. Todos los derechos reservados.</p>
                </div>
            </div>
            `
        };

        // Enviar el correo electrónico
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el correo electrónico:', error);
            } else {
                console.log('Correo electrónico enviado:', info.response);
            }
        });

        // Respuesta en caso de éxito
        res.status(200).send({ message: 'Contraseña actualizada exitosamente. Revisa tu correo para la nueva contraseña.' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

module.exports = {
    login, recuperarPassword
};
