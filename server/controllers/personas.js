const { Personas } = require('../models');

const MostrarPersonas = async (req, res) => {
    try{
        const personas = await Personas.findAll();
        res.status(200).json({ personas: personas});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message});
    }
};

const crearPersona = async (req, res) => {
    try {
        const { nombre, apellidos, cui, telefono, email, activo } = req.body;

        const nuevaPersona = await Personas.create({ nombre, apellidos, cui, telefono, email, activo });

        res.status(201).json({ nuevaPersona });
    } catch (error) {
        console.error('Error en crearPersona:', error);
        res.status(400).json({ message: 'Error interno del servidor', error: error.message });
    }
};


const actualizarPersona = async (req, res) => {
    const { idpersona } = req.params;
    const { nombre, apellidos, cui, telefono, email, activo } = req.body;

    try{
        const persona = await Personas.findByPk(idpersona);

        if (!persona) {
            return res.status(404).json({ message: 'Persona no encontrado.' });
        }

        await persona.update({ nombre, apellidos, cui, telefono, email, activo });

        res.status(200).json( { message: 'Persona actualizada con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error interno del servidor', error: error.message});
    }
};

const eliminarPersona = async (req, res) => {
    const { idpersona } = req.params;

    try {
        await Personas.destroy({
            where: { idpersona: idpersona}
        });

        res.status(200).json({ message: 'Persona eliminado definitivamente con éxito.'});
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor', error: error.message});
    }
};

module.exports = {
    MostrarPersonas, crearPersona, actualizarPersona, eliminarPersona
}