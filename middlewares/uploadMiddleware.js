const multer = require('multer');

// Configuración de almacenamiento en memoria
const storage = multer.memoryStorage();

// Función para filtrar archivos PDF
const fileFilter = (req, file, cb) => {
  console.log('🔍 Validando archivo:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  // Solo permitir archivos PDF
  if (file.mimetype === 'application/pdf') {
    console.log('✅ Archivo PDF válido');
    cb(null, true);
  } else {
    console.log('❌ Archivo no es PDF, rechazado');
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
    files: 1, // Solo un archivo
    fields: 10 // Máximo 10 campos
  }
});

// Middleware para manejar un solo archivo PDF
const uploadComprobante = (req, res, next) => {
  console.log('📁 Iniciando procesamiento de archivo...');
  console.log('Headers recibidos:', {
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length']
  });

  const uploadSingle = upload.single('comprobante_pago');
  
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error('❌ Error en multer:', {
        message: err.message,
        code: err.code,
        field: err.field
      });
      
      if (err instanceof multer.MulterError) {
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.status(400).json({
              message: 'El archivo es demasiado grande. Máximo 10MB.'
            });
          case 'LIMIT_FILE_COUNT':
            return res.status(400).json({
              message: 'Solo se permite un archivo.'
            });
          case 'LIMIT_UNEXPECTED_FILE':
            return res.status(400).json({
              message: 'Campo de archivo no esperado.'
            });
          default:
            return res.status(400).json({
              message: `Error de archivo: ${err.message}`
            });
        }
      } else {
        return res.status(400).json({
          message: err.message || 'Error al procesar el archivo'
        });
      }
    }

    // Log del resultado del procesamiento
    if (req.file) {
      console.log('✅ Archivo procesado exitosamente:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        buffer: !!req.file.buffer
      });
    } else {
      console.log('ℹ️ No se recibió archivo en esta petición');
    }

    console.log('📦 Body recibido:', req.body);
    next();
  });
};

module.exports = {
  uploadComprobante
};