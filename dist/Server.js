"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
// Import DIContainer for dependency injection
const DIContainer_1 = require("./infrastructure/DIContainer");
// Import controllers
const AuthController_1 = require("./presentation/controllers/AuthController");
const UserController_1 = require("./presentation/controllers/UserController");
const CourseController_1 = require("./presentation/controllers/CourseController");
const EventController_1 = require("./presentation/controllers/EventController");
const CertificateController_1 = require("./presentation/controllers/CertificateController");
// Importar middlewares
const securityMiddleware_1 = require("./presentation/middleware/securityMiddleware");
const jwtMiddleware_1 = require("./presentation/middleware/jwtMiddleware");
/**
 * Clase principal del servidor Express con Clean Architecture
 */
class Server {
    constructor(port = 3000) {
        this.port = port;
        this.app = (0, express_1.default)();
        // Initialize dependency injection container
        this.container = DIContainer_1.DIContainer.getInstance();
        // Initialize controllers with dependency injection
        this.authController = new AuthController_1.AuthController(this.container);
        this.userController = new UserController_1.UserController(this.container);
        this.courseController = new CourseController_1.CourseController(this.container);
        this.eventController = new EventController_1.EventController(this.container);
        this.certificateController = new CertificateController_1.CertificateController(this.container);
        this.setupMiddlewares();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    /**
     * Configurar middlewares globales
     */
    setupMiddlewares() {
        // Middlewares básicos
        this.app.use(express_1.default.json({ limit: "10mb" }));
        this.app.use(express_1.default.urlencoded({ extended: true }));
        // CORS básico
        this.app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
            if (req.method === "OPTIONS") {
                res.sendStatus(200);
            }
            else {
                next();
            }
        });
        // Request logging simple
        this.app.use((req, res, next) => {
            console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
            next();
        });
    }
    /**
     * Configurar rutas de la aplicación
     */
    setupRoutes() {
        // Health check endpoint
        this.app.get("/health", securityMiddleware_1.healthCheck);
        this.app.get("/api/health", securityMiddleware_1.healthCheck);
        // Crear rutas manualmente (sin DIContainer)
        this.setupAuthRoutes();
        this.setupUserRoutes();
        this.setupCourseRoutes();
        this.setupEventRoutes();
        this.setupCertificateRoutes();
        // Ruta raíz para verificar que el servidor está funcionando
        this.app.get("/", (req, res) => {
            res.json({
                message: "Backend API con Clean Architecture - Funcionando correctamente",
                version: "1.0.0",
                timestamp: new Date().toISOString(),
                endpoints: {
                    health: "/health",
                    auth: "/api/auth",
                    users: "/api/users",
                    courses: "/api/courses",
                    events: "/api/events",
                    certificates: "/api/certificates",
                },
            });
        });
        // Ruta raíz de la API
        this.app.get("/api", (req, res) => {
            res.json({
                success: true,
                message: "API Sistema de Gestión Académica - Clean Architecture",
                version: "1.0.0",
                timestamp: new Date().toISOString(),
                endpoints: {
                    health: "/health",
                    auth: "/api/auth",
                    users: "/api/users",
                    courses: "/api/courses",
                    events: "/api/events",
                    certificates: "/api/certificates",
                },
                features: [
                    "✅ Clean Architecture Implementation",
                    "✅ PostgreSQL Database Connected",
                    "✅ JWT Authentication",
                    "✅ CRUD Operations for Users, Courses, Events, Certificates",
                    "✅ Input Validation & Sanitization",
                    "✅ Error Handling & Logging"
                ]
            });
        });
    }
    /**
     * Configurar rutas de autenticación
     */
    setupAuthRoutes() {
        this.app.post("/api/auth/login", this.authController.login.bind(this.authController));
        this.app.post("/api/auth/register", this.authController.register.bind(this.authController));
        this.app.post("/api/auth/logout", this.authController.logout.bind(this.authController));
        this.app.get("/api/auth/profile", this.authController.getProfile.bind(this.authController));
        this.app.put("/api/auth/profile", this.authController.updateProfile.bind(this.authController));
        this.app.post("/api/auth/change-password", this.authController.changePassword.bind(this.authController));
        this.app.post("/api/auth/forgot-password", this.authController.forgotPassword.bind(this.authController));
        this.app.post("/api/auth/reset-password", this.authController.resetPassword.bind(this.authController));
        this.app.post("/api/auth/verify-email", this.authController.verifyEmail.bind(this.authController));
        this.app.post("/api/auth/resend-verification", this.authController.resendVerification.bind(this.authController));
        this.app.post("/api/auth/refresh-token", this.authController.refreshToken.bind(this.authController));
    }
    /**
     * Configurar rutas de usuarios
     */
    setupUserRoutes() {
        this.app.get("/api/users", this.userController.getAllUsers.bind(this.userController));
        this.app.get("/api/users/profile", jwtMiddleware_1.validateJWT, this.userController.getUserProfile.bind(this.userController));
        this.app.put("/api/users/profile", jwtMiddleware_1.validateJWT, this.userController.updateUserProfile.bind(this.userController));
    }
    /**
     * Configurar rutas de cursos
     */
    setupCourseRoutes() {
        this.app.get("/api/courses", this.courseController.getCourses.bind(this.courseController));
        this.app.get("/api/courses/:id", this.courseController.getCourseById.bind(this.courseController));
        this.app.post("/api/courses", this.courseController.createCourse.bind(this.courseController));
    }
    /**
     * Configurar rutas de eventos
     */
    setupEventRoutes() {
        this.app.get("/api/events", this.eventController.getEvents.bind(this.eventController));
        this.app.get("/api/events/:id", this.eventController.getEventById.bind(this.eventController));
        this.app.post("/api/events", this.eventController.createEvent.bind(this.eventController));
    }
    /**
     * Configurar rutas de certificados
     */
    setupCertificateRoutes() {
        // GET /api/certificates/my-certificates - Obtener certificados del usuario
        this.app.get("/api/certificates/my-certificates", jwtMiddleware_1.validateJWT, // Requiere autenticación
        this.certificateController.getUserCertificates.bind(this.certificateController));
        // GET /api/certificates/download/:tipo/:idParticipacion - Descargar certificado
        this.app.get("/api/certificates/download/:tipo/:idParticipacion", jwtMiddleware_1.validateJWT, // Requiere autenticación
        this.certificateController.downloadCertificate.bind(this.certificateController));
    }
    /**
     * Configurar manejo de errores
     */
    setupErrorHandling() {
        // Handler para rutas no encontradas (404)
        this.app.use(securityMiddleware_1.notFoundHandler);
        // Handler global de errores
        this.app.use(securityMiddleware_1.globalErrorHandler);
    }
    /**
     * Iniciar el servidor
     */
    async start() {
        try {
            // El DIContainer se inicializa automáticamente al ser creado
            return new Promise((resolve, reject) => {
                const server = this.app.listen(this.port, () => {
                    console.log("🚀 ========================================");
                    console.log(`🚀 Servidor iniciado exitosamente`);
                    console.log(`🚀 Puerto: ${this.port}`);
                    console.log(`🚀 Ambiente: ${process.env.NODE_ENV || "development"}`);
                    console.log(`🚀 Health Check: http://localhost:${this.port}/health`);
                    console.log(`🚀 API Base: http://localhost:${this.port}/api`);
                    console.log("🚀 ========================================");
                    console.log("🏗️  Clean Architecture Structure:");
                    console.log("   📁 Presentation Layer: Controllers, Routes, Middlewares");
                    console.log("   📁 Application Layer: Use Cases (Mock Implementation)");
                    console.log("   📁 Domain Layer: Entities, Repositories (Interfaces)");
                    console.log("   📁 Infrastructure Layer: Database, External Services");
                    console.log("🚀 ========================================");
                    resolve();
                });
                server.on('error', (error) => {
                    console.error("❌ Error al iniciar el servidor:", error);
                    reject(error);
                });
            });
        }
        catch (error) {
            console.error("❌ Error al iniciar el servidor:", error);
            process.exit(1);
        }
    }
    /**
     * Detener el servidor gracefully
     */
    async stop() {
        console.log("⏹️  Deteniendo servidor...");
        // Aquí puedes agregar lógica para cerrar conexiones de base de datos, etc.
        process.exit(0);
    }
    /**
     * Obtener la aplicación Express (útil para testing)
     */
    getApp() {
        return this.app;
    }
    /**
     * Obtener los controladores (reemplaza el contenedor por ahora)
     */
    getControllers() {
        return {
            auth: this.authController,
            user: this.userController,
            course: this.courseController,
            event: this.eventController,
            certificate: this.certificateController,
        };
    }
}
exports.Server = Server;
// Manejo de señales del sistema para shutdown graceful
process.on("SIGTERM", async () => {
    console.log("📡 SIGTERM recibido, iniciando shutdown graceful...");
    process.exit(0);
});
process.on("SIGINT", async () => {
    console.log("📡 SIGINT recibido, iniciando shutdown graceful...");
    process.exit(0);
});
// Manejo de errores no capturados
process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});
process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
    process.exit(1);
});
//# sourceMappingURL=Server.js.map