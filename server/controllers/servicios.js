const { Servicios, Clientes, Lotes, Configuracion } = require('../models');
const { Sequelize } = require('sequelize');

const mostrarServicios = async (req, res) => {
    try {
        const servicios = await Servicios.findAll({
            include: [
                {
                    model: Configuracion,
                    as: 'configuracion',
                    attributes: ['servicio']
                },
                {
                    model: Clientes,
                    as: 'clientes',
                    attributes: ['nombre', 'apellidos', 'cui', 'nit', 'telefono']
                },
                {
                    model: Lotes,
                    as: 'lotes',
                    attributes: [
                        [Sequelize.literal("CONCAT(manzana, lote)"), 'ubicacion']
                    ]
                }
            ]
        });
        res.status(200).json({ Servicios: servicios });
    } catch (error) {
        console.error('Error en mostrar los Servicios:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const mostrarServiciosAlt = async (req, res) => {
    try {
        const servicios = await Servicios.findAll({
            include: [
                {
                    model: Configuracion,
                    as: 'configuracion',
                    attributes: ['servicio','cuota_instalacion','cuota_conexion']
                },
                {
                    model: Clientes,
                    as: 'clientes',
                    attributes: ['nombre', 'apellidos']
                },
                {
                    model: Lotes,
                    as: 'lotes',
                    attributes: ['manzana', 'lote']
                }
            ]
        });

        // Mapeamos los servicios para modificar la estructura de la respuesta
        const serviciosModificados = servicios.map(servicio => {
            return {
                idservicio: servicio.idservicio,
                idconfiguracion: servicio.idconfiguracion,
                idlote: servicio.idlote,
                idcliente: servicio.idcliente,
                no_titulo: servicio.no_titulo,
                no_contador: servicio.no_contador,
                estatus_contador: servicio.estatus_contador,
                createdAt: servicio.createdAt,
                updatedAt: servicio.updatedAt,
                servicio: servicio.configuracion.servicio,
                nombrecliente: `${servicio.clientes.nombre} ${servicio.clientes.apellidos}`,
                loteubicacion: `${servicio.lotes.manzana}${servicio.lotes.lote}`,
                cuota_conexion: servicio.configuracion.cuota_conexion,
                cuota_instalacion: servicio.configuracion.cuota_instalacion,
                mes_inicio_lectura: servicio.mes_inicio_lectura, 
                anio_inicio_lectura: servicio.anio_inicio_lectura,
                activo: servicio.activo 
            };
        });

        res.status(200).json({ servicios: serviciosModificados });
    } catch (error) {
        console.error('Error en mostrar los Servicios:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const mostrarServiciosPagos = async (req, res) => {
    try {
        const servicios = await Servicios.findAll({
            include: [
                {
                    model: Clientes,
                    as: 'clientes',
                    attributes: ['nombre', 'apellidos', 'cui', 'nit', 'telefono']
                },
                {
                    model: Lotes,
                    as: 'lotes',
                    attributes: [
                        [Sequelize.literal("CONCAT(manzana, lote)"), 'ubicacion']
                    ]
                }
            ]
        });
        res.status(200).json({ servicios });
    } catch (error) {
        console.error('Error en mostrar los Servicios:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const mostrarServiciosActivos = async (req, res) => {
    try {
        const servicios = await Servicios.findAll({
            where: {
                activo: true
            },
            include: [
                {
                    model: Clientes,
                    as: 'clientes',
                    attributes: ['nombre', 'apellidos', 'cui', 'nit', 'telefono']
                },
                {
                    model: Lotes,
                    as: 'clientes',
                    attributes: [
                        [Sequelize.literal("CONCAT(manzana, lote)"), 'ubicacion']
                    ]
                }
            ]
        });
        res.status(200).json({ servicios });
    } catch (error) {
        console.error('Error en mostrarServicios:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const toggleActivoServicio = async (req, res) => {
    const { idservicio } = req.params;

    try {
        const servicio = await Servicios.findByPk(idservicio);

        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        servicio.activo = !servicio.activo;

        await servicio.save();

        res.status(200).json({ message: 'Estado del servicio actualizado con éxito.', servicio });
    } catch (error) {
        console.error('Error al cambiar el estado del servicio:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const crearServicio = async (req, res) => {
    try {
        const { 
            idconfiguracion, 
            idlote, 
            idcliente, 
            no_titulo, 
            no_contador, 
            estatus_contador,
            mes_inicio_lectura, // Nuevo campo añadido
            anio_inicio_lectura // Nuevo campo añadido
        } = req.body;

        console.log('Datos recibidos para crear servicio:', req.body);

        const servicioExistente = await Servicios.findOne({
            where: { idlote: idlote }
        });

        if (servicioExistente) {
            return res.status(400).json({ message: 'Ya existe un servicio asociado a este lote.' });
        }

        const nuevoServicio = await Servicios.create({ 
            idconfiguracion, 
            idlote, 
            idcliente, 
            no_titulo, 
            no_contador, 
            estatus_contador,
            mes_inicio_lectura, // Nuevo campo añadido
            anio_inicio_lectura // Nuevo campo añadido
        });

        res.status(201).json({ nuevoServicio });
    } catch (error) {
        console.error('Error en crear un Servicio:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const actualizarServicio = async (req, res) => {
    const { idservicio } = req.params;
    const { 
        idconfiguracion, 
        idlote, 
        idcliente, 
        no_titulo, 
        no_contador, 
        estatus_contador,
        mes_inicio_lectura, // Nuevo campo añadido
        anio_inicio_lectura // Nuevo campo añadido
    } = req.body;

    try {
        const servicio = await Servicios.findByPk(idservicio);

        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        await servicio.update({ 
            idconfiguracion, 
            idlote, 
            idcliente, 
            no_titulo, 
            no_contador, 
            estatus_contador,
            mes_inicio_lectura, // Nuevo campo añadido
            anio_inicio_lectura // Nuevo campo añadido
        });

        res.status(200).json({ message: 'Servicio actualizado con éxito.' });
    } catch (error) {
        console.error('Error en actualizar el Servicio:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const eliminarServicio = async (req, res) => {
    const { idservicio } = req.params;

    try {
        await Servicios.destroy({
            where: { idservicio: idservicio }
        });

        res.status(200).json({ message: 'Servicio eliminado definitivamente con éxito.' });
    } catch (error) {
        console.error('Error en eliminar el Servicio:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

module.exports = {
    mostrarServicios,
    mostrarServiciosAlt,
    mostrarServiciosActivos,
    crearServicio,
    actualizarServicio,
    eliminarServicio,
    toggleActivoServicio,
    mostrarServiciosPagos
};
