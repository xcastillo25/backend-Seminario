const { Lotes } = require('../models');

const mostrarLotes = async (req, res) => {
    try {
        const lotes = await Lotes.findAll();
        res.status(200).json({ lotes });
    } catch (error) {
        console.error('Error en mostrarLotes:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};


const mostrarLotesActivos = async (req, res) => {
    try {
        const lotes = await Lotes.findAll({
            where: {
                activo: true
            }
        });
        res.status(200).json({ lotes });
    } catch (error) {
        console.error('Error en mostrarLotesActivos:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const toggleActivoLote = async (req, res) => {
    const { idlote } = req.params;

    try {
        const lote = await Lotes.findByPk(idlote);
        if (!lote) {
            return res.status(404).json({ message: 'Lote no Encontrado. ' });
        }
        lote.activo = !lote.activo;

        await lote.save();

        res.status(200).json({ message: 'Estado de lote actualizado con exito' });
    }catch(error){
        console.error(' Error en toggleActivoLote', error);
        res.status(500).json({message: 'Error interno del Servidor', error: error.message});
    }
};

const crearLote = async (req, res) => {
    try {
        const { manzana, lote, observaciones } = req.body;

        // Verificar si ya existe un lote con la misma manzana y número de lote
        const loteExistente = await Lotes.findOne({
            where: {
                manzana: manzana,
                lote: lote
            }
        });

        if (loteExistente) {
            return res.status(400).json({ message: 'Ya existe un lote con la misma manzana y número de lote.' });
        }

        // Crear el nuevo lote si no hay duplicados
        const nuevoLote = await Lotes.create({ manzana, lote, observaciones });

        res.status(201).json({ nuevoLote });
    } catch (error) {
        console.error('Error en crearLote:', error);
        res.status(400).json({ message: 'Error al crear el Lote', error: error.message });
    }
};

const actualizarLote = async (req, res) => {
    const { idlote } = req.params;
    const { manzana, lote: numeroLote, observaciones } = req.body;

    try {
        const loteEncontrado = await Lotes.findByPk(idlote);

        if (!loteEncontrado) {
            return res.status(404).json({ message: 'Lote no encontrado.' });
        }

        await loteEncontrado.update({ manzana, lote: numeroLote, observaciones  });

        res.status(200).json({ message: 'Lote actualizado con éxito.' });
    } catch (error) {
        console.error('Error en actualizarLote:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};


const eliminarLote = async (req, res) => {
    const { idlote } = req.params;

    try {
        await Lotes.destroy({
            where: { idlote: idlote }
        });

        res.status(200).json({ message: 'Lote eliminado definitivamente con éxito.' });
    } catch (error) {
        console.error('Error en eliminarLote:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

module.exports = {
    mostrarLotes,
    mostrarLotesActivos,
    crearLote,
    actualizarLote,
    eliminarLote,
    toggleActivoLote
};
