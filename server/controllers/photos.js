const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now());
  }
});

const upload = multer({ storage: storage });

cloudinary.config({
  cloud_name: process.env.CLOUDY_NAME,
  api_key: process.env.CLOUDY_API_KEY,
  api_secret: process.env.CLOUDY_API_SECRET
});

const uploadToCloudinary = async (req, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      console.log('No se recibió ningún archivo.');
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });
    }

    console.log('Iniciando la carga a Cloudinary para el archivo:', file.originalname);

    const result = await cloudinary.uploader.upload(file.path);

    // Remove the file from local storage after uploading to Cloudinary
    fs.unlinkSync(file.path);
    
    if (result && result.secure_url) {
      console.log('Carga exitosa a Cloudinary. URL:', result.secure_url);
      res.status(200).json({ cloudinaryURL: result.secure_url });
    } else {
      console.error('Resultado inesperado de Cloudinary:', result);
      res.status(500).json({ error: 'Hubo un error al cargar la foto a Cloudinary.' });
    }
  } catch (error) {
    console.error('Error al intentar cargar la foto:', error);
    res.status(500).json({ error: 'Hubo un error al cargar la foto.' });
  }
};

module.exports = {
  uploadMiddleware: upload.single('photo'),
  uploadPhoto: uploadToCloudinary
};
