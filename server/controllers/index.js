const configuracion = require('./configuracion');
const servicios = require('./servicios');
const personas = require('./personas');
const roles = require('./roles');
const lotes = require('./lotes')
const pagos = require('./pagos');
const historial_servicios = require('./historial-servicios.js');

module.exports = {
    configuracion, servicios, personas, pagos, historial_servicios, lotes, roles 
}


