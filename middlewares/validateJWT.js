const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware para validar el JWT
 */
const validateJWT = (req, res, next) => {
  console.log('🔍 Middleware validateJWT ejecutándose...');
  
  // Leer el token del header
  const token = req.header('x-token') || req.header('Authorization')?.replace('Bearer ', '');
  
  console.log('📋 Headers recibidos:', {
    'x-token': req.header('x-token'),
    'Authorization': req.header('Authorization'),
    'token extraído': token ? `${token.substring(0, 20)}...` : 'undefined'
  });

  if (!token) {
    console.log('❌ No se encontró token en la petición');
    return res.status(401).json({
      success: false,
      message: 'No hay token en la petición'
    });
  }

  try {
    // Verificar el token
    console.log('🔐 Verificando token...');
    console.log('🔑 SECRET_JWT_SEED existe:', !!process.env.SECRET_KEY);
    
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    console.log('✅ Token verificado exitosamente. Payload:', payload);
    
    // Agregar el uid al request
    console.log("el ID ES"+payload.id)
    req.uid = payload.id;
    console.log('👤 UID agregado al request:', req.uid);
    console.log('📊 Tipo de UID:', typeof req.uid);
    
    next();
  } catch (error) {
    console.error('❌ Error al verificar JWT:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token no válido',
      error: error.message
    });
  }
};

// Middleware para validar que el usuario sea administrador
const validateAdmin = async (req, res, next) => {
    // Verificar que exista un usuario en la request (validado por validateJWT)
    if (!req.usuario) {
        return res.status(500).json({
            success: false,
            message: 'Se quiere verificar el rol sin validar el token primero'
        });
    }

    try {
        // Buscar la cuenta del usuario para verificar su rol
        const cuenta = await prisma.cuenta.findFirst({
            where: {
                id_usu_per: req.usuario.id_usu
            }
        });

        // Verificar si tiene cuenta y si su rol es ADMINISTRADOR
        if (!cuenta || cuenta.rol_cue !== 'ADMINISTRADOR') {
            return res.status(403).json({
                success: false,
                message: 'El usuario no tiene permisos de administrador'
            });
        }

        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar el rol de administrador'
        });
    }
};

// Middleware para validar roles específicos
const validateRoles = (...roles) => {
    return async (req, res, next) => {
        // Verificar que exista un usuario en la request (validado por validateJWT)
        if (!req.usuario) {
            return res.status(500).json({
                success: false,
                message: 'Se quiere verificar el rol sin validar el token primero'
            });
        }

        try {
            // Buscar la cuenta del usuario para verificar su rol
            const cuenta = await prisma.cuenta.findFirst({
                where: {
                    id_usu_per: req.usuario.id_usu
                }
            });

            // Verificar si tiene cuenta y si su rol está entre los permitidos
            if (!cuenta || !roles.includes(cuenta.rol_cue)) {
                return res.status(403).json({
                    success: false,
                    message: `El usuario no tiene ninguno de los roles requeridos: ${roles.join(', ')}`
                });
            }

            next();
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Error al verificar los roles del usuario'
            });
        }
    };
};

module.exports = {
    validateJWT,
    validateAdmin,
    validateRoles
};
