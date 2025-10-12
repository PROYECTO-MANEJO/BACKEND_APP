"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
class BaseController {
    /**
     * Ejecuta un caso de uso y maneja la respuesta HTTP
     */
    async execute(req, res, useCase) {
        try {
            const result = await useCase();
            this.ok(res, result);
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    /**
     * Respuesta exitosa (200)
     */
    ok(res, data) {
        if (data) {
            res.status(200).json({
                success: true,
                data,
            });
        }
        else {
            res.status(200).json({
                success: true,
            });
        }
    }
    /**
     * Respuesta de creación exitosa (201)
     */
    created(res, data) {
        if (data) {
            res.status(201).json({
                success: true,
                data,
            });
        }
        else {
            res.status(201).json({
                success: true,
            });
        }
    }
    /**
     * Respuesta sin contenido (204)
     */
    noContent(res) {
        res.status(204).send();
    }
    /**
     * Respuesta de error de cliente (400)
     */
    badRequest(res, message) {
        res.status(400).json({
            success: false,
            error: message,
        });
    }
    /**
     * Respuesta de no autorizado (401)
     */
    unauthorized(res, message = "No autorizado") {
        res.status(401).json({
            success: false,
            error: message,
        });
    }
    /**
     * Respuesta de prohibido (403)
     */
    forbidden(res, message = "Prohibido") {
        res.status(403).json({
            success: false,
            error: message,
        });
    }
    /**
     * Respuesta de no encontrado (404)
     */
    notFound(res, message = "No encontrado") {
        res.status(404).json({
            success: false,
            error: message,
        });
    }
    /**
     * Respuesta de conflicto (409)
     */
    conflict(res, message) {
        res.status(409).json({
            success: false,
            error: message,
        });
    }
    /**
     * Respuesta de error interno del servidor (500)
     */
    internalError(res, message = "Error interno del servidor") {
        res.status(500).json({
            success: false,
            error: message,
        });
    }
    /**
     * Manejo centralizado de errores
     */
    handleError(res, error) {
        console.error("Controller Error:", error);
        // Errores de dominio (reglas de negocio)
        if (error.name === "DomainError") {
            this.badRequest(res, error.message);
            return;
        }
        // Errores de validación
        if (error.name === "ValidationError") {
            this.badRequest(res, error.message);
            return;
        }
        // Errores de no encontrado
        if (error.name === "NotFoundError") {
            this.notFound(res, error.message);
            return;
        }
        // Errores de conflicto
        if (error.name === "ConflictError") {
            this.conflict(res, error.message);
            return;
        }
        // Errores de autorización
        if (error.name === "UnauthorizedError") {
            this.unauthorized(res, error.message);
            return;
        }
        // Errores de permisos
        if (error.name === "ForbiddenError") {
            this.forbidden(res, error.message);
            return;
        }
        // Error genérico del servidor
        this.internalError(res, "Ha ocurrido un error interno en el servidor");
    }
    /**
     * Extrae parámetros de paginación de la query string
     */
    getPaginationParams(req) {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 10));
        return { page, pageSize };
    }
    /**
     * Extrae el ID del usuario autenticado desde el middleware de autenticación
     */
    getUserId(req) {
        return req.userId;
    }
    /**
     * Extrae el rol del usuario autenticado desde el middleware de autenticación
     */
    getUserRole(req) {
        return req.userRole;
    }
}
exports.BaseController = BaseController;
//# sourceMappingURL=BaseController.js.map