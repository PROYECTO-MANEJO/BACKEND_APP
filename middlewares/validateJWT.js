const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware para validar el token de cualquier usuario (admin o normal)
const validateJWT = async (req, res, next) => {
    // Obtener el token del header
    const token = req.header('x-token');

    // Verificar si el token existe
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No hay token en la petición'
        });
    }

    try {
        // Verificar el token
        const { id } = jwt.verify(token, process.env.SECRET_KEY);
        
        // Buscar el usuario en la base de datos
        const usuario = await prisma.usuario.findUnique({
            where: { id_usu: id },
            include: {
                cuentas: true
            }
        });

        // Verificar si el usuario existe
        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Token no válido - usuario no existe'
            });
        }

        // Guardar el usuario en la request
        req.usuario = usuario;
        
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({
            success: false,
            message: 'Token no válido'
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
