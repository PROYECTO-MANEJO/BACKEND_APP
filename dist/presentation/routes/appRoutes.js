"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppRoutes = void 0;
const express_1 = require("express");
const userRoutes_1 = require("./userRoutes");
const authRoutes_1 = require("./authRoutes");
const passwordRecoveryRoutes_1 = require("./passwordRecoveryRoutes");
const verificationRoutes_1 = require("./verificationRoutes");
const changeRequestRoutes_1 = require("./changeRequestRoutes");
const developerRoutes_1 = require("./developerRoutes");
const inscriptionRoutes_1 = require("./inscriptionRoutes");
const participationRoutes_1 = require("./participationRoutes");
const homepageRoutes_1 = require("./homepageRoutes");
const careerRoutes_1 = require("./careerRoutes");
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
        // Rutas de solicitudes de cambio
        const changeRequestRoutes = new changeRequestRoutes_1.ChangeRequestRoutes();
        this.router.use("/change-requests", changeRequestRoutes.getRouter());
        // Rutas de desarrolladores
        const developerRoutes = new developerRoutes_1.DeveloperRoutes();
        this.router.use("/developers", developerRoutes.getRouter());
        // Rutas de inscripciones
        const inscriptionRoutes = new inscriptionRoutes_1.InscriptionRoutes();
        this.router.use("/inscriptions", inscriptionRoutes.getRouter());
        // Rutas de participaciones
        const participationRoutes = new participationRoutes_1.ParticipationRoutes();
        this.router.use("/participations", participationRoutes.getRouter());
        // Rutas de página principal
        this.router.use("/homepage", homepageRoutes_1.homepageRoutes);
        // Rutas de carreras
        const careerRoutes = new careerRoutes_1.CareerRoutes();
        this.router.use("/careers", careerRoutes.getRouter());
    }
    getRouter() {
        return this.router;
    }
}
exports.AppRoutes = AppRoutes;
//# sourceMappingURL=appRoutes.js.map