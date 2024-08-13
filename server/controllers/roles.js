const { Roles } = require('../models');

const mostrarRoles = async (req, res) => {
    try{
        const roles = await Roles.findAll();
        res.status(200).json({ roles: roles});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message});
    }
};


module.exports = {
    mostrarRoles
}