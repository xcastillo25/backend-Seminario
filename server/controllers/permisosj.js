const { Permisos } = require('../models');

const MostrarPermisos = async (req, res) => {
    try{
        const permisos = await Permisos.findAll();
        res.status(200).json({ permisos: permisos});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message});
    }
};

const crearPermisos = async (req, res) => {
    try {
        const { nombre, apellidos, cui, telefono, email, activo } = req.body;

        const empleadoExistente = await Empleados.findOne({ where: { cui } });
        if (empleadoExistente) {
            return res.status(400).json({ message: 'El empleado con este CUI ya existe.' });
        }

        const nuevaempleado = await Empleados.create({ nombre, apellidos, cui, telefono, email, activo });

        res.status(201).json({ nuevaempleado });
    } catch (error) {
        console.error('Error al crear el Empleado:', error);
        res.status(400).json({ message: 'Error interno del servidor', error: error.message });
    }
};