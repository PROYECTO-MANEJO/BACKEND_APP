"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeOwnerOrAdmin = exports.optionalAuth = exports.authorize = exports.authenticateToken = void 0;
const tslib_1 = require("tslib");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
/**
 * Middleware de autenticación JWT
 * Verifica el token JWT y adjunta la información del usuario al request
 */
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Token de acceso requerido'
            });
            return;
        }
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        // Agregar información del usuario al request
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        req.userEmail = decoded.email;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                success: false,
                error: 'Token expirado'
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                error: 'Token inválido'
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.authenticateToken = authenticateToken;
/**
 * Middleware de autorización por rol
 * Verifica que el usuario tenga uno de los roles permitidos
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            const userRole = req.userRole;
            if (!userRole) {
                res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado'
                });
                return;
            }
            if (!allowedRoles.includes(userRole)) {
                res.status(403).json({
                    success: false,
                    error: 'No tienes permisos para acceder a este recurso'
                });
                return;
            }
            next();
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    };
};
exports.authorize = authorize;
/**
 * Middleware opcional de autenticación
 * No falla si no hay token, pero adjunta la información si está disponible
 */
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            req.userId = decoded.userId;
            req.userRole = decoded.role;
            req.userEmail = decoded.email;
        }
        next();
    }
    catch (error) {
        // En caso de error, continúa sin autenticación
        next();
    }
};
exports.optionalAuth = optionalAuth;
/**
 * Middleware para verificar si el usuario puede acceder a sus propios recursos
 * o si es administrador
 */
const authorizeOwnerOrAdmin = (req, res, next) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const requestedUserId = parseInt(req.params.userId || req.params.id);
        // Los administradores pueden acceder a cualquier recurso
        if (userRole === 'administrador' || userRole === 'admin') {
            next();
            return;
        }
        // Los usuarios solo pueden acceder a sus propios recursos
        if (userId === requestedUserId) {
            next();
            return;
        }
        res.status(403).json({
            success: false,
            error: 'No tienes permisos para acceder a este recurso'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.authorizeOwnerOrAdmin = authorizeOwnerOrAdmin;
//# sourceMappingURL=authMiddleware.js.map