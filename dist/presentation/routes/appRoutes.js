"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppRoutes = void 0;
const express_1 = require("express");
const userRoutes_1 = require("./userRoutes");
const authRoutes_1 = require("./authRoutes");
const courseRoutes_1 = require("./courseRoutes");
const eventRoutes_1 = require("./eventRoutes");
const certificateRoutes_1 = require("./certificateRoutes");
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
        // Rutas de cursos
        const courseRoutes = new courseRoutes_1.CourseRoutes();
        this.router.use("/courses", courseRoutes.getRouter());
        // Rutas de eventos
        const eventRoutes = new eventRoutes_1.EventRoutes();
        this.router.use("/events", eventRoutes.getRouter());
        // Rutas de certificados
        const certificateRoutes = new certificateRoutes_1.CertificateRoutes();
        this.router.use("/certificates", certificateRoutes.getRouter());
        // Ruta de salud del sistema
        this.router.get("/health", (req, res) => {
            res.status(200).json({
                success: true,
                message: "API funcionando correctamente",
                timestamp: new Date().toISOString(),
                version: "1.0.0",
            });
        });
        // Ruta raíz de la API
        this.router.get("/", (req, res) => {
            res.status(200).json({
                success: true,
                message: "API Sistema de Gestión Académica",
                version: "1.0.0",
                endpoints: {
                    auth: "/api/auth",
                    users: "/api/users",
                    courses: "/api/courses",
                    events: "/api/events",
                    certificates: "/api/certificates",
                    health: "/api/health",
                },
            });
        });
    }
    getRouter() {
        return this.router;
    }
}
exports.AppRoutes = AppRoutes;
//# sourceMappingURL=appRoutes.js.map