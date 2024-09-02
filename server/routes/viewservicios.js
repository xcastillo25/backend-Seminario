const viewServicesController = require('../controllers').viewservicios;

module.exports = (app) => {
    app.get('/api/view-servicios', viewServicesController.mostrarViewServices);
    app.get('/api/view-servicios-activos', viewServicesController.mostrarViewServicesActivos);
};
