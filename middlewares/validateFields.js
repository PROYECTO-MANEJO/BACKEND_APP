const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

/**
 * Middleware para validar los campos de una petición
 * Procesa los errores generados por express-validator
 */
const validateFields = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }
    
    next();
};

/**
 * Middleware para validar el JWT
 */
const validateJWT = (req, res, next) => {
  // Leer el token del header
  const token = req.header('x-token') || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No hay token en la petición'
    });
  }

  try {
    // Verificar el token
    const { uid } = jwt.verify(token, process.env.SECRET_JWT_SEED);
    
    // Agregar el uid al request
    req.uid = uid;
    
    next();
  } catch (error) {
    console.error('Error en validateJWT:', error);
    return res.status(401).json({
      success: false,
      message: 'Token no válido'
    });
  }
};

module.exports = { validateFields, validateJWT };