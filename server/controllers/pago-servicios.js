const { PagoServicios } = require('../models');

const MostrarPagos = async (req, res) => {
    try{
        const pagoservicios = await PagoServicios.findAll();
        res.status(200).json({ pagoservicios});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message});
    }
};

const MostrarPagosActivos = async (req, res) => {
    try{
        const pagos = await PagoServicios.findAll({
            where: {
                activo: true
            }
        });
        res.status(200).json({ pagos: pagos});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message});
    }
};

const toggleActivoPago = async (req, res) => {
    const { idpago } = req.params;

    try {
        // Buscar el pago por su ID
        const pago = await PagoServicios.findByPk(idpago);

        if (!pago) {
            return res.status(404).json({ message: 'pago no encontrado.' });
        }

        // Alternar el valor de activo
        pago.activo = !pago.activo;

        // Guardar el cambio en la base de datos
        await pago.save();

        res.status(200).json({ message: 'Estado del pago actualizado con éxito.', pago });
    } catch (error) {
        console.error('Error en toggleActivoPago:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const crearPago = async (req, res) => {
    try {
        const { idservicio , nombre, total, pendiente, concepto, pagado, fecha, observaciones, activo } = req.body;

        
        const nuevoPago = await PagoServicios.create({ idservicio , nombre, total, pendiente, concepto, pagado, fecha, observaciones, activo });

        res.status(201).json({ nuevoPago });
    } catch (error) {
        console.error('Error en crearPago:', error);
        res.status(400).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const actualizarPago = async (req, res) => {
    const { idpago } = req.params;
    const { nombre, total, pendiente, concepto, pagado, fecha, observaciones, activo } = req.body;

    try{
        const pago = await PagoServicios.findByPk(idpago);

        if (!pago) {
            return res.status(404).json({ message: 'Pago no encontrado.' });
        }

        await pago.update({ nombre, total, pendiente, concepto, pagado, fecha, observaciones, activo });

        res.status(200).json( { message: 'Pago actualizado con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error interno del servidor', error: error.message});
    }
};

const eliminarPago = async (req, res) => {
    const { idpago } = req.params;

    try {
        await PagoServicios.destroy({
            where: { idpago: idpago}
        });

        res.status(200).json({ message: 'Pago eliminado definitivamente con éxito.'});
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor', error: error.message});
    }
};

module.exports = {
    MostrarPagos, MostrarPagosActivos, toggleActivoPago, crearPago, actualizarPago, eliminarPago
}