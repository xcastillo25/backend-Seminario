const { Empleados } = require('../models');

const MostrarEmpleados = async (req, res) => {
    try{
        const empleados = await Empleados.findAll();
        res.status(200).json({ empleados: empleados});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message});
    }
};

const MostrarEmpleadosActivos = async (req, res) => {
    try{
        const empleados = await Empleados.findAll({
            where: {
                activo: true
            }
        });
        res.status(200).json({ empleados: empleados});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message});
    }
};

const MostrarEmpleadoPerfil = async (req, res) => {
    const { idempleado } = req.params;
    try {
        const empleado = await Empleados.findOne({
            where: { idempleado: idempleado }
        });
        if (empleado) {
            res.status(200).json({ empleados: empleado });
        } else {
            res.status(404).json({ message: 'Empleado no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};



const toggleActivoEmpleado = async (req, res) => {
    const { idempleado } = req.params;

    try {
        const empleado = await Empleados.findByPk(idempleado);

        if (!empleado) {
            return res.status(404).json({ message: 'Empleado no encontrado.' });
        }

        empleado.activo = !empleado.activo;

        await empleado.save();

        res.status(200).json({ message: 'Estado del empleado actualizado con éxito.', empleado });
    } catch (error) {
        console.error('Error en toggleActivoempleado:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};


const crearEmpleado = async (req, res) => {
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


const actualizarEmpleado = async (req, res) => {
    const { idempleado } = req.params;
    const { nombre, apellidos, cui, telefono, email, activo } = req.body;

    try{
        const empleado = await Empleados.findByPk(idempleado);

        if (!empleado) {
            return res.status(404).json({ message: 'Empleado no encontrado.' });
        }

        const empleadoExistente = await Empleados.findOne({ where: { cui } });
        if (empleadoExistente) {
            return res.status(400).json({ message: 'El empleado con este CUI ya existe.' });
        }

        await empleado.update({ nombre, apellidos, cui, telefono, email, activo });

        res.status(200).json( { message: 'Empleado actualizado con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error interno del servidor', error: error.message});
    }
};

const eliminarEmpleado = async (req, res) => {
    const { idempleado } = req.params;

    try {
        await Empleados.destroy({
            where: { idempleado: idempleado}
        });

        res.status(200).json({ message: 'Empleado eliminado definitivamente con éxito.'});
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor', error: error.message});
    }
};

module.exports = {
    MostrarEmpleados, MostrarEmpleadosActivos, crearEmpleado, actualizarEmpleado, eliminarEmpleado, 
    toggleActivoEmpleado, MostrarEmpleadoPerfil
}