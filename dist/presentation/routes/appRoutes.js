"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppRoutes = void 0;
const express_1 = require("express");
const userRoutes_1 = require("./userRoutes");
const authRoutes_1 = require("./authRoutes");
const passwordRecoveryRoutes_1 = require("./passwordRecoveryRoutes");
const verificationRoutes_1 = require("./verificationRoutes");
class AppRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.setupRoutes();
    }
    setupRoutes() {
        // Rutas de autenticación
        const authRoutes = new authRoutes_1.AuthRoutes();
        this.router.use("/auth", authRoutes.getRouter());
        // Rutas de usuarios
        const userRoutes = new userRoutes_1.UserRoutes();
        this.router.use("/users", userRoutes.getRouter());
        // Rutas de recuperación de contraseña
        const passwordRecoveryRoutes = new passwordRecoveryRoutes_1.PasswordRecoveryRoutes();
        this.router.use("/password-recovery", passwordRecoveryRoutes.getRouter());
        // Rutas de verificación de email
        const verificationRoutes = new verificationRoutes_1.VerificationRoutes();
        this.router.use("/verification", verificationRoutes.getRouter());
    }
    getRouter() {
        return this.router;
    }
}
exports.AppRoutes = AppRoutes;
//# sourceMappingURL=appRoutes.js.map