const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware para validar el JWT (con soporte para query parameters)
 */
const validateJWT = async (req, res, next) => {
  console.log('🔍 Middleware validateJWT ejecutándose...');
  
  // Leer el token del header o query parameter (para iframes de PDF)
  const token = req.header('x-token') || 
                req.header('Authorization')?.replace('Bearer ', '') ||
                req.query.token;
  
  console.log('📋 Headers recibidos:', {
    'x-token': req.header('x-token'),
    'Authorization': req.header('Authorization'),
    'query-token': req.query.token ? `${req.query.token.substring(0, 20)}...` : 'undefined',
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
    
    // Buscar el usuario en la base de datos
    const usuario = await prisma.usuario.findUnique({
      where: { id_usu: payload.id },
      include: {
        cuentas: {
          select: {
            cor_cue: true,
            rol_cue: true
          }
        }
      }
    });

    if (!usuario) {
      console.log('❌ Usuario no encontrado en la base de datos');
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Agregar el uid, usuario y rol al request
    console.log("el ID ES"+payload.id)
    req.uid = payload.id;
    req.usuario = usuario;
    req.userId = payload.id; // Alias para compatibilidad
    req.userRole = usuario.cuentas[0]?.rol_cue || null; // Agregar rol del usuario
    console.log('👤 UID agregado al request:', req.uid);
    console.log('👤 Usuario agregado al request:', usuario.nom_usu1, usuario.ape_usu1);
    console.log('👤 Rol del usuario:', req.userRole);
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
        // El usuario ya viene con las cuentas incluidas desde validateJWT
        const cuentas = req.usuario.cuentas;

        // Verificar si tiene cuenta y si su rol es ADMINISTRADOR o MASTER
        if (!cuentas || cuentas.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'El usuario no tiene cuenta asociada'
            });
        }

        const cuenta = cuentas[0]; // Tomar la primera cuenta
        if (cuenta.rol_cue !== 'ADMINISTRADOR' && cuenta.rol_cue !== 'MASTER') {
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
            // El usuario ya viene con las cuentas incluidas desde validateJWT
            const cuentas = req.usuario.cuentas;

            // Verificar si tiene cuenta y si su rol está entre los permitidos
            if (!cuentas || cuentas.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'El usuario no tiene cuenta asociada'
                });
            }

            const cuenta = cuentas[0]; // Tomar la primera cuenta
            if (!roles.includes(cuenta.rol_cue)) {
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

// Middleware para validar que el usuario sea desarrollador
const validateDeveloper = async (req, res, next) => {
    // Verificar que exista un usuario en la request (validado por validateJWT)
    if (!req.usuario) {
        return res.status(500).json({
            success: false,
            message: 'Se quiere verificar el rol sin validar el token primero'
        });
    }

    try {
        // El usuario ya viene con las cuentas incluidas desde validateJWT
        const cuentas = req.usuario.cuentas;

        // Verificar si tiene cuenta y si su rol es DESARROLLADOR
        if (!cuentas || cuentas.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'El usuario no tiene cuenta asociada'
            });
        }

        const cuenta = cuentas[0]; // Tomar la primera cuenta
        if (cuenta.rol_cue !== 'DESARROLLADOR' && cuenta.rol_cue !== 'MASTER') {
            return res.status(403).json({
                success: false,
                message: 'El usuario no tiene permisos de desarrollador'
            });
        }

        // Agregar el userId al request para uso en los controladores
        req.userId = req.uid;

        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar el rol de desarrollador'
        });
    }
};

// Middleware para validar que el usuario sea MASTER o ADMINISTRADOR
const validateMaster = async (req, res, next) => {
    // Verificar que exista un usuario en la request (validado por validateJWT)
    if (!req.usuario) {
        return res.status(500).json({
            success: false,
            message: 'Se quiere verificar el rol sin validar el token primero'
        });
    }

    try {
        // El usuario ya viene con las cuentas incluidas desde validateJWT
        const cuentas = req.usuario.cuentas;

        // Verificar si tiene cuenta y si su rol es MASTER o ADMINISTRADOR
        if (!cuentas || cuentas.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'El usuario no tiene cuenta asociada'
            });
        }

        const cuenta = cuentas[0]; // Tomar la primera cuenta
        if (cuenta.rol_cue !== 'MASTER' && cuenta.rol_cue !== 'ADMINISTRADOR') {
            return res.status(403).json({
                success: false,
                message: 'El usuario no tiene permisos de administrador master'
            });
        }

        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar el rol de master'
        });
    }
};

module.exports = {
    validateJWT,
    validateAdmin,
    validateDeveloper,
    validateRoles,
    validateMaster
};
