const { Lecturas, Servicios, Lotes } = require('../models');

// Obtener todas las lecturas
const obtenerTodasLasLecturas = async (req, res) => {
    try {
        const lecturas = await Lecturas.findAll({
            include: [
                {
                    model: Servicios,
                    as: 'servicios',
                    attributes: ['no_contador'],
                    include: [
                        {
                            model: Lotes,
                            as: 'lotes',
                            attributes: ['manzana','lote']
                        }
                    ]
                }
            ]
        });

        res.status(200).json({
            Lecturas: lecturas.map(lectura => ({
                idlectura: lectura.idlectura,
                lectura: lectura.lectura,
                fecha: lectura.fecha,
                mes: lectura.mes,
                año: lectura.año,
                url_foto: lectura.url_foto,
                numero_contador: lectura.servicios.no_contador,
                lote: `${lectura.servicios.lotes.manzana}${lectura.servicios.lotes.lote}`
            }))
        });
    } catch (error) {
        console.error('Error al obtener todas las lecturas:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

module.exports = {
    obtenerTodasLasLecturas
};
