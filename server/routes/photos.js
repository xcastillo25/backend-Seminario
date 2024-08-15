module.exports = (app) => {
    const photosController = require('../controllers').photos;
    const uploadMiddleware = photosController.uploadMiddleware;

    app.post('/api/photo-upload', uploadMiddleware, photosController.uploadPhoto);
};
