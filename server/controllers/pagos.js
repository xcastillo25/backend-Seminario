const { Pagos, Lecturas } = require('../models');

const MostrarPagos = async (req, res) => {
    try{
        const pagos = await Pagos.findAll();
        res.status(200).json({ pagos: pagos});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message});
    }
};

const MostrarPagosActivos = async (req, res) => {
    try{
        const pagos = await Pagos.findAll({
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
        const pago = await Pagos.findByPk(idpago);

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
    const { idlectura, mes, año, fecha, concepto, cuota, mora, exceso, monto_exceso, total } = req.body;

    try {
        // Crear el pago en tblpagos
        const nuevoPago = await Pagos.create({
            idlectura,
            mes,
            año,
            fecha,
            concepto,
            cuota,
            mora,
            exceso,
            monto_exceso,
            total,
            activo: true
        });

        // Buscar la lectura asociada
        const lectura = await Lecturas.findByPk(idlectura);
        if (lectura) {
            // Actualizar la lectura con los valores pagados
            await lectura.update({
                lectura_pagada: cuota > 0 ? true : lectura.lectura_pagada,
                mora_pagada: mora > 0 ? true : lectura.mora_pagada,
                exceso_pagado: exceso > 0 ? true : lectura.exceso_pagado,
                // Actualizamos los montos acumulados en la lectura
                monto_mora: lectura.monto_mora - mora,  // Resta el monto pagado
                cuota: lectura.cuota - cuota,  // Resta la cuota pagada
                monto_exceso: lectura.monto_exceso - exceso,  // Resta el exceso pagado
                monto_acumulado: lectura.monto_acumulado - total,  // Actualiza el monto acumulado total
                suma_total: lectura.suma_total - total  // Actualiza la suma total
            });
        }

        res.status(201).json({ nuevoPago });
    } catch (error) {
        console.error('Error en crearPago:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};



const actualizarPago = async (req, res) => {
    const { idpago } = req.params;
    const { idservicio , mes, año, fecha, concepto, consumo, mora, exceso, monto_exceso, total, recibo, activo } = req.body;

    try{
        const pago = await Pagos.findByPk(idpago);

        if (!pago) {
            return res.status(404).json({ message: 'Pago no encontrado.' });
        }

        await pago.update({ idservicio , mes, año, fecha, concepto, consumo, mora, exceso, monto_exceso, total, recibo, activo });

        res.status(200).json( { message: 'Pago actualizado con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error interno del servidor', error: error.message});
    }
};

const eliminarPago = async (req, res) => {
    const { idpago } = req.params;

    try {
        await Pagos.destroy({
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