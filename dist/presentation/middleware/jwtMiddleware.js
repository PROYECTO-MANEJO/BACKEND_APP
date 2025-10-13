"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRoles = exports.validateJWT = void 0;
const tslib_1 = require("tslib");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const validateJWT = async (req, res, next) => {
    // Debug: Log todos los headers para troubleshooting
    console.log("🔍 Headers recibidos:", {
        authorization: req.header("authorization"),
        Authorization: req.header("Authorization"),
        "x-token": req.header("x-token"),
        "todos los headers": req.headers,
    });
    const token = req.header("Authorization")?.replace("Bearer ", "") ||
        req.header("x-token");
    console.log("🎫 Token extraído:", token ? `${token.substring(0, 20)}...` : "NO ENCONTRADO");
    if (!token) {
        console.log("❌ NO HAY TOKEN - Rechazando petición");
        res.status(401).json({
            success: false,
            message: "No hay token en la petición",
        });
        return;
    }
    try {
        // Debug: Log del token y SECRET_KEY
        console.log("🔐 Verificando token refactorizado...");
        console.log("🔑 SECRET_KEY existe:", !!process.env.SECRET_KEY);
        console.log("📋 Token recibido:", token ? `${token.substring(0, 20)}...` : "undefined");
        // Verificar el token usando SECRET_KEY (compatibilidad con legacy)
        const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        console.log("✅ Token verificado exitosamente. Payload:", decoded);
        // Buscar el usuario en la base de datos (igual que el middleware legacy)
        const usuario = await prisma.usuario.findUnique({
            where: { id_usu: decoded.id },
            include: {
                cuentas: {
                    select: {
                        cor_cue: true,
                        rol_cue: true,
                    },
                },
            },
        });
        if (!usuario) {
            res.status(401).json({
                success: false,
                message: "Usuario no encontrado",
            });
            return;
        }
        // Adjuntar tanto uid como usuario al request (compatibilidad)
        req.uid = decoded.id;
        req.usuario = usuario;
        req.userRole = usuario.cuentas[0]?.rol_cue || null;
        next();
    }
    catch (error) {
        console.error("❌ Error al verificar JWT refactorizado:", error);
        res.status(401).json({
            success: false,
            message: "Token no válido",
        });
        return;
    }
};
exports.validateJWT = validateJWT;
/**
 * Middleware para validar roles específicos
 * Debe usarse después de validateJWT
 */
const validateRoles = (...roles) => {
    return async (req, res, next) => {
        // Verificar que exista un usuario en la request (validado por validateJWT)
        const authReq = req; // Cast para acceder a propiedades añadidas por validateJWT
        if (!authReq.usuario) {
            res.status(500).json({
                success: false,
                message: 'Se quiere verificar el rol sin validar el token primero'
            });
            return;
        }
        try {
            // El usuario ya viene con las cuentas incluidas desde validateJWT
            const cuentas = authReq.usuario.cuentas;
            // Verificar si tiene cuenta y si su rol está entre los permitidos
            if (!cuentas || cuentas.length === 0) {
                res.status(403).json({
                    success: false,
                    message: 'El usuario no tiene cuenta asociada'
                });
                return;
            }
            const cuenta = cuentas[0]; // Tomar la primera cuenta
            if (!roles.includes(cuenta.rol_cue)) {
                res.status(403).json({
                    success: false,
                    message: `No tienes permisos para esta acción`
                });
                return;
            }
            console.log(`✅ Usuario autorizado con rol: ${cuenta.rol_cue}`);
            next();
        }
        catch (error) {
            console.error('Error en validateRoles:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
            return;
        }
    };
};
exports.validateRoles = validateRoles;
//# sourceMappingURL=jwtMiddleware.js.map