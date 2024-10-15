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
                    attributes: ['rol','clientes','empleados','lotes','servicios','roles','usuarios','pagos','lecturas','configuracion','historial_pagos'] // Asegúrate de que 'rol' es el nombre correcto del atributo en tu tabla de roles
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
            rol: usuarioEncontrado.roles.rol,
            clientes: usuarioEncontrado.roles.clientes,
            empleados: usuarioEncontrado.roles.empleados,
            lotes: usuarioEncontrado.roles.lotes,
            servicios: usuarioEncontrado.roles.servicios,
            roles: usuarioEncontrado.roles.roles,
            usuarios: usuarioEncontrado.roles.usuarios,
            pagos: usuarioEncontrado.roles.pagos,
            lecturas: usuarioEncontrado.roles.lecturas,
            configuracion: usuarioEncontrado.roles.configuracion,
            historial_pagos: usuarioEncontrado.roles.historial_pagos 
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

function generateRandomPassword() {
    return Math.random().toString(36).slice(-4);
}

const recuperarPassword = async (req, res) => {
    try {
        const { usuario, email } = req.body;
        console.log(`Datos recibidos - Usuario: ${usuario}, Email: ${email}`);

        // Buscar el usuario por nombre de usuario y verificar el correo en la tabla de Empleados
        const usuarioEncontrado = await Usuarios.findOne({
            where: { usuario: usuario },
            include: [{
                model: Empleados,
                as: 'empleados',
                where: { email: email }, // Verificar que el email coincida en la tabla de Empleados
                attributes: ['nombre', 'apellidos', 'email'] // Incluir los atributos necesarios
            }]
        });

        if (!usuarioEncontrado) {
            console.error('Usuario o correo no encontrado');
            return res.status(404).json({ error: 'Usuario o correo no encontrado.' });
        }

        console.log('Usuario encontrado:', usuarioEncontrado);

        // Generar una nueva contraseña aleatoria
        const nuevaPassword = generateRandomPassword();
        console.log('Nueva contraseña generada:', nuevaPassword);

        // Hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
        console.log('Contraseña hasheada');

        // Actualizar la contraseña en la base de datos
        await Usuarios.update(
            { password: hashedPassword },
            { where: { idusuario: usuarioEncontrado.idusuario } }
        );
        console.log('Contraseña actualizada en la base de datos');

        // Configurar el transporte de nodemailer usando las credenciales del archivo .env
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
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


const cambiarPassword = async (req, res) => {
    try {
        const { idempleado, passwordActual, nuevaPassword } = req.body;
        console.log('Solicitando cambio de contraseña para el empleado:', idempleado);

        // Buscar el empleado por ID y obtener el usuario asociado
        const empleadoEncontrado = await Empleados.findByPk(idempleado, {
            include: [{ model: Usuarios, as: 'usuarios' }]
        });

        if (!empleadoEncontrado) {
            console.error('Empleado no encontrado:', idempleado);
            throw new Error('Empleado no encontrado.');
        }

        const usuarioEncontrado = empleadoEncontrado.usuarios[0];
        if (!usuarioEncontrado) {
            console.error('Usuario no encontrado para el empleado:', idempleado);
            throw new Error('Usuario no encontrado para este empleado.');
        }

        // Verificar la contraseña actual
        console.log('Contraseña almacenada:', usuarioEncontrado.password);
        console.log('Contraseña ingresada:', passwordActual);
        
        const passwordIsValid = await bcrypt.compare(passwordActual, usuarioEncontrado.password);
        if (!passwordIsValid) {
            console.warn('La contraseña actual es incorrecta para el empleado:', idempleado);
            return res.status(400).send({ message: 'La contraseña actual es incorrecta.' });
        }

        // Hashear la nueva contraseña
        const hashedNewPassword = await bcrypt.hash(nuevaPassword, 10);
        console.log('Nueva contraseña hasheada para el empleado:', idempleado);

        // Actualizar la contraseña en la base de datos
        await Usuarios.update(
            { password: hashedNewPassword },
            { where: { idusuario: usuarioEncontrado.idusuario } }
        );
        console.log('Contraseña actualizada exitosamente para el empleado:', idempleado);

        // Configurar el transporte de nodemailer
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // O cualquier otro servicio de correo que utilices
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        // Definir el contenido del correo electrónico
        const mailOptions = {
            from: process.env.EMAIL,
            to: usuarioEncontrado.email, // Suponiendo que el correo está en la tabla de usuarios
            subject: 'Cambio de Contraseña - Paseo Las Lomas Salamá',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">Cambio de Contraseña</h2>
                <p style="font-size: 16px; color: #555;">
                    Hola <strong>${usuarioEncontrado.usuario}</strong>,
                </p>
                <p style="font-size: 16px; color: #555;">
                    Tu contraseña ha sido cambiada exitosamente. Asegúrate de recordar tu nueva contraseña:
                </p>
                <div style="margin: 20px 0; padding: 15px; background-color: #f4f4f4; border: 1px solid #ddd; border-radius: 5px;">
                    <p style="font-size: 16px; color: #333;"><strong>Nueva Contraseña:</strong> ${nuevaPassword}</p>
                </div>
                <p style="font-size: 16px; color: #555;">
                    Si no realizaste este cambio, ponte en contacto con nosotros de inmediato.
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
        res.status(200).send({ message: 'Contraseña cambiada exitosamente. Revisa tu correo para más detalles.' });
    } catch (error) {
        console.error('Error en el proceso de cambio de contraseña:', error.message);
        res.status(500).send({ error: error.message });
    }
};


module.exports = {
    login, recuperarPassword, cambiarPassword
};
