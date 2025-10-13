"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireMaster = exports.requireAdmin = void 0;
/**
 * Middleware para verificar que el usuario sea administrador o master
 * Debe usarse después del middleware de JWT (validateJWT)
 */
const requireAdmin = (req, res, next) => {
    try {
        const usuario_id = req.usuario?.id_usu || req.uid;
        if (!usuario_id) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
            return;
        }
        // Verificar rol del usuario en la base de datos
        const prisma = req.prisma || require('../../infrastructure/database/prismaClient').default;
        prisma.usuario.findUnique({
            where: { id_usu: usuario_id },
            include: {
                cuentas: {
                    select: { rol_cue: true }
                }
            }
        }).then((usuario) => {
            if (!usuario) {
                res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
                return;
            }
            const roles = usuario.cuentas.map((cuenta) => cuenta.rol_cue);
            const esAdmin = roles.includes('ADMINISTRADOR') || roles.includes('MASTER');
            if (!esAdmin) {
                res.status(403).json({
                    success: false,
                    message: 'Acceso denegado. Se requieren permisos de administrador.'
                });
                return;
            }
            // Agregar información del rol al request para uso posterior
            req.userRole = roles.includes('MASTER') ? 'MASTER' : 'ADMINISTRADOR';
            next();
        }).catch((error) => {
            console.error('[requireAdmin] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        });
    }
    catch (error) {
        console.error('[requireAdmin] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
exports.requireAdmin = requireAdmin;
/**
 * Middleware para verificar que el usuario sea MASTER
 * Debe usarse después del middleware de JWT (validateJWT)
 */
const requireMaster = (req, res, next) => {
    try {
        const usuario_id = req.usuario?.id_usu || req.uid;
        if (!usuario_id) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
            return;
        }
        // Verificar rol del usuario en la base de datos
        const prisma = req.prisma || require('../../infrastructure/database/prismaClient').default;
        prisma.usuario.findUnique({
            where: { id_usu: usuario_id },
            include: {
                cuentas: {
                    select: { rol_cue: true }
                }
            }
        }).then((usuario) => {
            if (!usuario) {
                res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
                return;
            }
            const roles = usuario.cuentas.map((cuenta) => cuenta.rol_cue);
            const esMaster = roles.includes('MASTER');
            if (!esMaster) {
                res.status(403).json({
                    success: false,
                    message: 'Acceso denegado. Se requieren permisos de MASTER.'
                });
                return;
            }
            // Agregar información del rol al request
            req.userRole = 'MASTER';
            next();
        }).catch((error) => {
            console.error('[requireMaster] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        });
    }
    catch (error) {
        console.error('[requireMaster] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
exports.requireMaster = requireMaster;
//# sourceMappingURL=adminMiddleware.js.map