const { Agua } = require('../models');

const mostrarAgua = async (req, res) => {
    try{
        const agua = await Agua.findAll();
        res.status(200).json({ agua: agua});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message});
    }
};

const crearAgua = async (req, res) => {
    try {
        const { servicio, cuota, mora, empresa } = req.body;

        const nuevaAgua = await Agua.create({ servicio, cuota, mora, empresa });

        res.status(201).json({ nuevaAgua });
    } catch (error) {
        console.error('Error en crearAgua:', error);
        res.status(400).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const actualizarAgua = async (req, res) => {
    const { idagua } = req.params;
    const { servicio, cuota, mora, empresa } = req.body;

    try{
        const agua = await Agua.findByPk(idagua);

        if (!agua) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        await agua.update({ servicio, cuota, mora, empresa });

        res.status(200).json( { message: 'Servicio actualizado con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error interno del servidor', error: error.message});
    }
};

const eliminarAgua = async (req, res) => {
    const { idagua } = req.params;

    try {
        await Agua.destroy({
            where: { idagua: idagua}
        });

        res.status(200).json({ message: 'Servicio eliminado definitivamente conéxito.'});
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor', error: error.message});
    }
};

module.exports = {
    mostrarAgua, crearAgua, actualizarAgua, eliminarAgua
}
