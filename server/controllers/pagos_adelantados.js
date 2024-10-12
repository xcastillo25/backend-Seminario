const { Pagos_Adelantados, Servicios, Configuracion } = require('../models');

const agregarPagoAdelantado = async (req, res) => {
    try {
        const { idservicio, mes, año, fecha, concepto, descuento } = req.body;

        // Validar que se proporcionen los datos necesarios
        if (!idservicio || !mes || !año || !fecha || !concepto) {
            return res.status(400).json({ message: 'Todos los campos son requeridos.' });
        }

        // Buscar el servicio y obtener la configuración (para la cuota)
        const servicio = await Servicios.findByPk(idservicio, {
            include: [{ model: Configuracion, as: 'configuracion' }]
        });

        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        const cuota = parseFloat(servicio.configuracion.cuota);

        // Crear el nuevo pago adelantado con los valores de mora, exceso y total en cero
        const nuevoPagoAdelantado = await Pagos_Adelantados.create({
            idservicio,
            mes,
            año,
            fecha,
            concepto,
            cuota,
            mora: 0,            // Mora en cero
            exceso: 0,          // Exceso en cero
            monto_exceso: 0,    // Monto del exceso en cero
            total: cuota,       // El total será la cuota, ya que no hay mora ni exceso
            descuento,
            activo: true        // Activo por defecto
        });

        res.status(201).json({ message: 'Pago adelantado agregado exitosamente.', nuevoPagoAdelantado });
    } catch (error) {
        console.error('Error en agregarPagoAdelantado:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const mostrarPagosAdelantadosPorServicio = async (req, res) => {
    const { idservicio } = req.params;

    try {
        // Buscar los pagos adelantados que correspondan al id_servicio proporcionado
        const pagosAdelantados = await Pagos_Adelantados.findAll({
            where: { idservicio },
            order: [['fecha', 'DESC']]  // Ordenar por la fecha en orden descendente (más recientes primero)
        });

        // Si no hay pagos adelantados, devolver un array vacío
        res.status(200).json({ pagosAdelantados: pagosAdelantados.length ? pagosAdelantados : [] });

    } catch (error) {
        console.error('Error al mostrar pagos adelantados:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};


module.exports = {
    agregarPagoAdelantado, mostrarPagosAdelantadosPorServicio
};
