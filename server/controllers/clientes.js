const { Clientes } = require('../models');

const mostrarClientes = async (req, res) => {
    try{
        const clientes = await Clientes.findAll();
        res.status(200).json({ clientes: clientes});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message});
    }
};

const crearCliente = async (req, res) => {
    try {
        const { nombre, apellidos, cui, telefono, email, activo } = req.body;

        const nuevoCliente = await Clientes.create({ nombre, apellidos, cui, telefono, email, activo });

        res.status(201).json({ nuevoCliente });
    } catch (error) {
        console.error('Error en crearCliente:', error);
        res.status(400).json({ message: 'Error interno del servidor', error: error.message });
    }
};


const actualizarCliente = async (req, res) => {
    const { idcliente } = req.params;
    const { nombre, apellidos, cui, telefono, email, activo } = req.body;

    try{
        const cliente = await Clientes.findByPk(idcliente);

        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado.' });
        }

        await cliente.update({ nombre, apellidos, cui, telefono, email, activo });

        res.status(200).json( { message: 'Cliente actualizado con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error interno del servidor', error: error.message});
    }
};

const eliminarCliente = async (req, res) => {
    const { idcliente } = req.params;

    try {
        await Clientes.destroy({
            where: { idcliente: idcliente}
        });

        res.status(200).json({ message: 'Cliente eliminado definitivamente con éxito.'});
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor', error: error.message});
    }
};

module.exports = {
    mostrarClientes, crearCliente, actualizarCliente, eliminarCliente
}