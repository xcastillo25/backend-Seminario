require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && 'body' in err && err.status === 413) {
        res.status(413).send({ error: 'PayloadTooLargeError', message: 'El tamaño de la carga útil de la solicitud es demasiado grande.' });
    } else {
        next();
    }
});

// Configurar CORS
const allowedOrigins = [
    //'https://geoproyectossa.netlify.app',
    'http://localhost:4200'
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Authorization', 'X-API-KEY', 'Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Access-Control-Allow-Request-Method']
}));

// ESPACIO PARA LAS SOLICITUDES
app.get('/', (req, res) => {

    res.status(200).send({ message: 'Bienvenido a Proyecto Lomas De Salamá' });

});
//

require('./server/routes/configuracion')(app);
require('./server/routes/servicios')(app);
require('./server/routes/personas')(app);
require('./server/routes/roles')(app);
require('./server/routes/lotes')(app);
require('./server/routes/pagos')(app);
require('./server/routes/historial-servicios')(app);
require('./server/routes/lecturas')(app);
require('./server/routes/usuarios')(app);
require('./server/routes/login')(app);

app.get('*', (req, res) => {
    res.status(200).send({ message: 'Bienvenido' });
});

app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.send();
});

module.exports = app;
