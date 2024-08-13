const lotesController = require('../controllers').lotes;

module.exports = (app) => {
    app.get('/api/lote', lotesController.mostrarLotes);
    app.get('/api/lote/activo', lotesController.mostrarLotesActivos);
    app.post('/api/lote', lotesController.crearLote);
    app.put('/api/lote/:idlote', lotesController.actualizarLote);
    app.delete('/api/lote/:idlote', lotesController.eliminarLote);
    app.patch('/api/lote/:idlote/toggle', lotesController.toggleActivoLote);
};
