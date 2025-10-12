"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
class UserRoutes {
    constructor(container) {
        this.router = (0, express_1.Router)();
        this.userController = new UserController_1.UserController(container);
        this.setupRoutes();
    }
    setupRoutes() {
        /**
         * GET /api/users
         * Obtener lista de usuarios (solo administradores)
         */
        this.router.get('/', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorize)('administrador', 'admin'), validationMiddleware_1.validatePagination, validationMiddleware_1.handleValidationErrors, this.userController.getUsers.bind(this.userController));
        /**
         * GET /api/users/:id
         * Obtener usuario por ID (solo el mismo usuario o administradores)
         */
        this.router.get('/:id', authMiddleware_1.authenticateToken, validationMiddleware_1.validateIdParam, validationMiddleware_1.handleValidationErrors, authMiddleware_1.authorizeOwnerOrAdmin, this.userController.getUserById.bind(this.userController));
        /**
         * POST /api/users
         * Crear nuevo usuario (solo administradores)
         */
        this.router.post('/', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorize)('administrador', 'admin'), validationMiddleware_1.validateUserCreation, validationMiddleware_1.handleValidationErrors, this.userController.createUser.bind(this.userController));
        /**
         * PUT /api/users/:id
         * Actualizar usuario (solo el mismo usuario o administradores)
         */
        this.router.put('/:id', authMiddleware_1.authenticateToken, validationMiddleware_1.validateIdParam, validationMiddleware_1.validateUserUpdate, validationMiddleware_1.handleValidationErrors, authMiddleware_1.authorizeOwnerOrAdmin, this.userController.updateUser.bind(this.userController));
        /**
         * DELETE /api/users/:id
         * Eliminar usuario (solo administradores)
         */
        this.router.delete('/:id', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorize)('administrador', 'admin'), validationMiddleware_1.validateIdParam, validationMiddleware_1.handleValidationErrors, this.userController.deleteUser.bind(this.userController));
    }
    getRouter() {
        return this.router;
    }
}
exports.UserRoutes = UserRoutes;
//# sourceMappingURL=userRoutes.js.map