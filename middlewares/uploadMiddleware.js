const multer = require('multer');

// ✅ ALMACENAMIENTO EN MEMORIA (no en disco)
const storage = multer.memoryStorage();

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
  storage: storage, // ✅ MEMORIA, no disco
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo (más grande porque va a BD)
  }
});

// Middleware para manejar errores de multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 10MB permitido.'
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