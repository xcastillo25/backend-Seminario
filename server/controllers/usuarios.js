const { Usuarios } = require('../models');
const { Roles } = require('../models');
const { Empleados } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

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
            },
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
        const { idempleado, usuario, password, idrol, email } = req.body;

        // Verificar que todos los campos están presentes
        if (!idempleado || !usuario || !password || !idrol || !email) {
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
            subject: 'Bienvenido a Paseo Las Lomas Salamá',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">Bienvenido a Paseo Las Lomas Salamá</h2>
                <p style="font-size: 16px; color: #555;">
                    Hola <strong>${usuario}</strong>,
                </p>
                <p style="font-size: 16px; color: #555;">
                    Tu cuenta ha sido creada exitosamente. Aquí tienes tus credenciales para acceder al sistema:
                </p>
                <div style="margin: 20px 0; padding: 15px; background-color: #f4f4f4; border: 1px solid #ddd; border-radius: 5px;">
                    <p style="font-size: 16px; color: #333;"><strong>Usuario:</strong> ${usuario}</p>
                    <p style="font-size: 16px; color: #333;"><strong>Contraseña:</strong> ${password}</p>
                </div>
                <p style="font-size: 16px; color: #555;">
                    Por favor, recuerda mantener tus credenciales seguras.
                </p>
                <p style="font-size: 16px; color: #555;">
                    Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
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

        res.status(201).send({ nuevoUsuario });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error interno del servidor', error: error.message });
    }
};

const actualizarUsuario = async (req, res) => {
    const { idusuario } = req.params;

    try {
        // Buscar el usuario por ID
        const usuario = await Usuarios.findByPk(idusuario);

        if (!usuario) {
            return res.status(404).send({ message: 'Usuario no encontrado.' });
        }

        // Verifica si ya existe otro usuario con el mismo nombre de usuario
        const existeUsuario = await Usuarios.findOne({
            where: {
                usuario: req.body.usuario,
                idusuario: { [Op.ne]: idusuario } // Excluye el usuario actual de la búsqueda
            }
        });

        if (existeUsuario) {
            return res.status(400).send({ message: 'El nombre de usuario ya está en uso por otro usuario.' });
        }

        // Si se está actualizando la contraseña, encriptarla antes de guardar
        let plainPassword;
        if (req.body.password) {
            plainPassword = req.body.password; // Guardar la contraseña en texto plano antes de encriptarla
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }

        // Actualiza el usuario con los datos proporcionados en el cuerpo de la solicitud
        await usuario.update(req.body);

        // Enviar correo con las credenciales si se actualizó el nombre de usuario o la contraseña
        if (req.body.usuario || req.body.password) {
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            });

            const mailOptions = {
                from: process.env.EMAIL,
                to: req.body.email || usuario.email,
                subject: 'Actualización de Credenciales en Paseo Las Lomas',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">Actualización de Credenciales</h2>
                    <p style="font-size: 16px; color: #555;">
                        Hola <strong>${req.body.usuario || usuario.usuario}</strong>,
                    </p>
                    <p style="font-size: 16px; color: #555;">
                        Tus credenciales han sido actualizadas exitosamente. Aquí tienes tus credenciales actualizadas para acceder al sistema:
                    </p>
                    <div style="margin: 20px 0; padding: 15px; background-color: #f4f4f4; border: 1px solid #ddd; border-radius: 5px;">
                        <p style="font-size: 16px; color: #333;"><strong>Usuario:</strong> ${req.body.usuario || usuario.usuario}</p>
                        <p style="font-size: 16px; color: #333;"><strong>Contraseña:</strong> ${plainPassword ? plainPassword : '(no cambiada)'}</p>
                    </div>
                    <p style="font-size: 16px; color: #555;">
                        Por favor, recuerda mantener tus credenciales seguras.
                    </p>
                    <p style="font-size: 16px; color: #555;">
                        Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
                    </p>
                    <p style="font-size: 16px; color: #555;">
                        Saludos cordiales,
                    </p>
                    <p style="font-size: 16px; color: #555;">
                        El equipo de Paseo Las Lomas
                    </p>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 14px; color: #aaa;">
                        <p>&copy; ${new Date().getFullYear()} Paseo Las Lomas. Todos los derechos reservados.</p>
                    </div>
                </div>
                `
            };            

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error al enviar el correo electrónico:', error);
                } else {
                    console.log('Correo electrónico enviado:', info.response);
                }
            });
        }

        res.status(200).send({ message: 'Usuario actualizado con éxito.' });
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).send({ message: 'Error interno del servidor', error: error.message });
    }
};

const actualizarUsuarioSinPass = async (req, res) => {
    const { idusuario } = req.params;

    try {
        // Buscar el usuario por ID
        const usuario = await Usuarios.findByPk(idusuario);

        if (!usuario) {
            return res.status(404).send({ message: 'Usuario no encontrado.' });
        }

        // Verifica si ya existe otro usuario con el mismo nombre de usuario
        const existeUsuario = await Usuarios.findOne({
            where: {
                usuario: req.body.usuario,
                idusuario: { [Op.ne]: idusuario } // Excluye el usuario actual de la búsqueda
            }
        });

        if (existeUsuario) {
            return res.status(400).send({ message: 'El nombre de usuario ya está en uso por otro usuario.' });
        }

        // Extraer solo los campos permitidos para actualizar (usuario y idrol)
        const datosActualizados = {
            usuario: req.body.usuario,
            idrol: req.body.idrol,
        };

        // Actualiza el usuario solo con usuario e idrol
        await usuario.update(datosActualizados);

        // Enviar correo si se actualizó el nombre de usuario
        if (req.body.usuario) {
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            });

            const mailOptions = {
                from: process.env.EMAIL,
                to: req.body.email || usuario.email,
                subject: 'Actualización de Credenciales en Paseo Las Lomas',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">Actualización de Credenciales</h2>
                    <p style="font-size: 16px; color: #555;">
                        Hola <strong>${req.body.usuario || usuario.usuario}</strong>,
                    </p>
                    <p style="font-size: 16px; color: #555;">
                        Tus credenciales han sido actualizadas exitosamente. Aquí tienes tus credenciales actualizadas para acceder al sistema:
                    </p>
                    <div style="margin: 20px 0; padding: 15px; background-color: #f4f4f4; border: 1px solid #ddd; border-radius: 5px;">
                        <p style="font-size: 16px; color: #333;"><strong>Usuario:</strong> ${req.body.usuario || usuario.usuario}</p>
                        <p style="font-size: 16px; color: #333;"><strong>Contraseña:</strong> (no cambiada)</p>
                    </div>
                    <p style="font-size: 16px; color: #555;">
                        Por favor, recuerda mantener tus credenciales seguras.
                    </p>
                    <p style="font-size: 16px; color: #555;">
                        Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
                    </p>
                    <p style="font-size: 16px; color: #555;">
                        Saludos cordiales,
                    </p>
                    <p style="font-size: 16px; color: #555;">
                        El equipo de Paseo Las Lomas
                    </p>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 14px; color: #aaa;">
                        <p>&copy; ${new Date().getFullYear()} Paseo Las Lomas. Todos los derechos reservados.</p>
                    </div>
                </div>
                `
            };            

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error al enviar el correo electrónico:', error);
                } else {
                    console.log('Correo electrónico enviado:', info.response);
                }
            });
        }

        res.status(200).send({ message: 'Usuario actualizado con éxito.' });
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
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

const generarPasswordAleatoria = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&';
    let password = '';
    for (let i = 0; i < 5; i++) {
        password += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return password;
};

const resetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Buscar el empleado por correo electrónico
        const empleado = await Empleados.findOne({
            where: { email: email },
            include: [{
                model: Usuarios,
                as: 'usuarios' // Usa el alias definido en la asociación
            }]
        });

        // Verificar si el empleado existe y tiene un usuario asociado
        if (!empleado || !empleado.usuarios || empleado.usuarios.length === 0) {
            return res.status(404).send({ message: 'No se encontró ningún usuario asociado con ese correo.' });
        }

        // Acceder al primer usuario asociado
        const usuario = empleado.usuarios[0];

        // Generar una nueva contraseña aleatoria
        const nuevaContrasena = generarPasswordAleatoria();

        // Encriptar la nueva contraseña
        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

        // Actualizar la contraseña del usuario
        usuario.password = hashedPassword;
        await usuario.save();

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
            subject: 'Restablecimiento de Contraseña',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">Restablecimiento de Contraseña</h2>
                <p style="font-size: 16px; color: #555;">
                    Hola <strong>${usuario.usuario}</strong>,
                </p>
                <p style="font-size: 16px; color: #555;">
                    Tu contraseña ha sido restablecida exitosamente. Aquí tienes tu nueva contraseña:
                </p>
                <div style="margin: 20px 0; padding: 15px; background-color: #f4f4f4; border: 1px solid #ddd; border-radius: 5px;">
                    <p style="font-size: 16px; color: #333;"><strong>Usuario:</strong> ${usuario.usuario}</p>
                    <p style="font-size: 16px; color: #333;"><strong>Contraseña:</strong> ${nuevaContrasena}</p>
                </div>
                <p style="font-size: 16px; color: #555;">
                    Por favor, recuerda cambiar esta contraseña después de iniciar sesión.
                </p>
                <p style="font-size: 16px; color: #555;">
                    Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
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
                return res.status(500).send({ message: 'Error al enviar el correo electrónico.' });
            } else {
                console.log('Correo electrónico enviado:', info.response);
            }
        });

        res.status(200).send({ message: 'Contraseña restablecida con éxito y enviada por correo.', username: usuario.usuario, nuevaContrasena: nuevaContrasena });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error interno del servidor', error: error.message });
    }
};

const resetPasswordPorIdUsuario = async (req, res) => {
    try {
        const { idusuario } = req.body;

        // Buscar el usuario por ID de usuario
        const usuario = await Usuarios.findOne({
            where: { idusuario: idusuario },
            include: [{
                model: Empleados,
                as: 'empleados' // Usa el alias definido en la asociación
            }]
        });

        // Verificar si el usuario existe y tiene un empleado asociado
        if (!usuario || !usuario.empleados) {
            return res.status(404).send({ message: 'No se encontró ningún usuario con ese ID.' });
        }

        // Generar una nueva contraseña aleatoria
        const nuevaContrasena = generarPasswordAleatoria();

        // Encriptar la nueva contraseña
        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

        // Actualizar la contraseña del usuario
        usuario.password = hashedPassword;
        await usuario.save();

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
            to: usuario.empleados.email, // Se envía el correo al email del empleado asociado
            subject: 'Restablecimiento de Contraseña',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">Restablecimiento de Contraseña</h2>
                <p style="font-size: 16px; color: #555;">
                    Hola <strong>${usuario.usuario}</strong>,
                </p>
                <p style="font-size: 16px; color: #555;">
                    Tu contraseña ha sido restablecida exitosamente. Aquí tienes tu nueva contraseña:
                </p>
                <div style="margin: 20px 0; padding: 15px; background-color: #f4f4f4; border: 1px solid #ddd; border-radius: 5px;">
                    <p style="font-size: 16px; color: #333;"><strong>Usuario:</strong> ${usuario.usuario}</p>
                    <p style="font-size: 16px; color: #333;"><strong>Contraseña:</strong> ${nuevaContrasena}</p>
                </div>
                <p style="font-size: 16px; color: #555;">
                    Por favor, recuerda cambiar esta contraseña después de iniciar sesión.
                </p>
                <p style="font-size: 16px; color: #555;">
                    Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
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
                return res.status(500).send({ message: 'Error al enviar el correo electrónico.' });
            } else {
                console.log('Correo electrónico enviado:', info.response);
            }
        });

        res.status(200).send({ message: 'Contraseña restablecida con éxito y enviada por correo.', username: usuario.usuario, nuevaContrasena: nuevaContrasena });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error interno del servidor', error: error.message });
    }
};


module.exports = {
    mostrarUsuarios, mostrarUsuariosActivos,
    crearUsuario, actualizarUsuario, eliminarUsuario,
    cambiarEstadoUsuario, resetPassword, mostrarUsuarioEmpleado,
    resetPasswordPorIdUsuario, actualizarUsuarioSinPass
};