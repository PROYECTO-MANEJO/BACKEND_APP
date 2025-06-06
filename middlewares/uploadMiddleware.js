const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorios si no existen
const createDirectories = () => {
  const uploadsDir = 'uploads';
  const cedulasDir = path.join(uploadsDir, 'cedulas');
  const matriculasDir = path.join(uploadsDir, 'matriculas');

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
  if (!fs.existsSync(cedulasDir)) {
    fs.mkdirSync(cedulasDir);
  }
  if (!fs.existsSync(matriculasDir)) {
    fs.mkdirSync(matriculasDir);
  }
};

createDirectories();

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';
    
    if (file.fieldname === 'cedula_pdf') {
      folder += 'cedulas/';
    } else if (file.fieldname === 'matricula_pdf') {
      folder += 'matriculas/';
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: userId_tipo_timestamp.pdf
    const userId = req.uid;
    const tipo = file.fieldname === 'cedula_pdf' ? 'cedula' : 'matricula';
    const timestamp = Date.now();
    const filename = `${userId}_${tipo}_${timestamp}.pdf`;
    cb(null, filename);
  }
});

// Filtros para archivos
const fileFilter = (req, file, cb) => {
  // Solo permitir PDFs
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  }
});

// Middleware para manejar errores de multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 5MB permitido.'
      });
    }
  }
  
  if (error.message === 'Solo se permiten archivos PDF') {
    return res.status(400).json({
      success: false,
      message: 'Solo se permiten archivos PDF'
    });
  }
  
  next(error);
};

module.exports = {
  upload,
  handleMulterError
};