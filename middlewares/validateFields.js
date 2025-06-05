const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

/**
 * Middleware para validar los campos de una petición
 * Procesa los errores generados por express-validator
 */
const validateFields = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        // Obtener la ruta actual para personalizar mensajes según el endpoint
        const path = req.path;
        const method = req.method;
        console.log(`Validación fallida en ruta: ${method} ${path}`);
        console.log('Cuerpo de la solicitud:', req.body);
        console.log('Errores de validación:', errors.array());
        
        // Lista de errores formateados
        const formattedErrors = errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            type: error.type,
            value: error.value
        }));
        
        // Si es la ruta para crear administradores, podemos personalizar el mensaje
        if (path.includes('/createAdmin')) {
            // Verificar qué campos están faltando para dar instrucciones específicas
            const missingFields = formattedErrors.map(error => error.field);
            
            let missingFieldsMessage = '';
            if (missingFields.length > 0) {
                missingFieldsMessage = `Campos faltantes o inválidos: ${missingFields.join(', ')}`;
            }
            
            return res.status(400).json({
                success: false,
                message: 'Error en la validación de campos para registro de administrador',
                detail: missingFieldsMessage,
                errors: formattedErrors,
                expectedFields: [
                    'ced_usu', 'nom_usu1', 'nom_usu2', 'ape_usu1', 'ape_usu2',
                    'fec_nac_usu', 'num_tel_usu', 'pas_usu', 'id_car_per', 'cor_cue'
                ]
            });
        } else if (path.includes('/createUser')) {
            return res.status(400).json({
                success: false,
                message: 'Error en la validación de campos para registro de usuario',
                errors: formattedErrors,
                expectedFields: [
                    'email', 'password', 'nombre', 'nombre2', 'apellido', 'apellido2'
                ]
            });
        } else if (path.includes('/login')) {
            return res.status(400).json({
                success: false,
                message: 'Error en la validación de campos para inicio de sesión',
                errors: formattedErrors,
                expectedFields: ['email', 'password']
            });
        }
        
        // Formato general de respuesta de error
        return res.status(400).json({
            success: false,
            message: 'Error en la validación de campos',
            errors: formattedErrors,
            receivedBody: req.body
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