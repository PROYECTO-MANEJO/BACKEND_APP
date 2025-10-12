"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const authMiddleware_1 = require("../middleware/authMiddleware");
class AuthRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.authController = new AuthController_1.AuthController();
        this.setupRoutes();
    }
    setupRoutes() {
        /**
         * POST /api/auth/login
         * Iniciar sesión
         */
        this.router.post("/login", validationMiddleware_1.validateLogin, validationMiddleware_1.handleValidationErrors, this.authController.login.bind(this.authController));
        /**
         * POST /api/auth/register
         * Registrar nuevo usuario
         */
        this.router.post("/register", 
        // TODO: Agregar validación cuando esté implementada
        this.authController.register.bind(this.authController));
        /**
         * POST /api/auth/logout
         * Cerrar sesión
         */
        this.router.post("/logout", authMiddleware_1.authenticateToken, this.authController.logout.bind(this.authController));
        /**
         * GET /api/auth/profile
         * Obtener perfil del usuario autenticado
         */
        this.router.get("/profile", authMiddleware_1.authenticateToken, this.authController.getProfile.bind(this.authController));
        /**
         * POST /api/auth/change-password
         * Cambiar contraseña
         */
        this.router.post("/change-password", authMiddleware_1.authenticateToken, validationMiddleware_1.validateChangePassword, validationMiddleware_1.handleValidationErrors, this.authController.changePassword.bind(this.authController));
        /**
         * POST /api/auth/forgot-password
         * Solicitar restablecimiento de contraseña
         */
        this.router.post("/forgot-password", 
        // TODO: Agregar validación
        this.authController.forgotPassword.bind(this.authController));
        /**
         * POST /api/auth/reset-password
         * Confirmar restablecimiento de contraseña
         */
        this.router.post("/reset-password", 
        // TODO: Agregar validación
        this.authController.resetPassword.bind(this.authController));
    }
    getRouter() {
        return this.router;
    }
}
exports.AuthRoutes = AuthRoutes;
//# sourceMappingURL=authRoutes.js.map