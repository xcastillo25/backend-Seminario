const configuracion = require('./configuracion');
const servicios = require('./servicios');
const clientes = require('./clientes');
const roles = require('./roles');
const lotes = require('./lotes')
const pagos = require('./pagos');
const historial_servicios = require('./historial-servicios.js');
const usuarios = require('./usuarios');
const login = require('./login');
const lecturas = require('./lecturas.js');
const historial_lecturas = require('./historial-lecturas.js');
const historial = require('./historial.js');
const empleados = require('./empleados.js');
const viewlecturas = require('./viewlecturas.js');
const viewservicios = require('./viewservicios.js');
const photos = require('./photos.js');

module.exports = {
    configuracion, servicios, clientes, pagos, historial_servicios, 
    lotes, roles, usuarios, login,lecturas, historial_lecturas, historial,
    empleados, viewlecturas, viewservicios
    ,viewservicios, photos
}


