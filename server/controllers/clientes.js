const { Clientes } = require('../models');

const MostrarClientes = async (req, res) => {
    try{
        const clientes = await Clientes.findAll();
        res.status(200).json({ clientes: clientes});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message});
    }
};

const MostrarClientesActivos = async (req, res) => {
    try{
        const clientes = await Clientes.findAll({
            where: {
                activo: true
            }
        });
        res.status(200).json({ clientes: clientes});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message});
    }
};

const toggleActivoCliente = async (req, res) => {
    const { idcliente } = req.params;

    try {
        const cliente = await Clientes.findByPk(idcliente);

        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado.' });
        }

        cliente.activo = !cliente.activo;

        await cliente.save();

        res.status(200).json({ message: 'Estado del cliente actualizado con éxito.', cliente });
    } catch (error) {
        console.error('Error en cambiar el estado del cliente:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};


const crearCliente = async (req, res) => {
    try {
        const { nombre, apellidos, cui, telefono, email, activo } = req.body;

        const clienteExistente = await Clientes.findOne({ where: { cui } });
        if (clienteExistente) {
            return res.status(400).json({ message: 'El cliente con este CUI ya existe.' });
        }

        const nuevoCliente = await Clientes.create({ nombre, apellidos, cui, telefono, email, activo });

        res.status(201).json({ nuevoCliente });
    } catch (error) {
        console.error('Error al crear el Cliente:', error);
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

        const clienteExistente = await Clientes.findOne({ where: { cui, idcliente: { [Op.ne]: idcliente } } });
        if (clienteExistente) {
            return res.status(400).json({ message: 'Otro cliente con este CUI ya existe.' });
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
    MostrarClientes, MostrarClientesActivos, crearCliente, actualizarCliente, eliminarCliente, 
    toggleActivoCliente
}