const loginController = require('../controllers').login;

module.exports = (app) => {
    app.post('/api/login', loginController.login);
    app.post('/api/recuperarPassword', loginController.recuperarPassword);
};