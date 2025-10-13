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
const HomepageController_1 = require("./presentation/controllers/HomepageController");
const ChangeRequestController_1 = require("./presentation/controllers/ChangeRequestController");
const InscriptionController_1 = require("./presentation/controllers/InscriptionController");
const AdminController_1 = require("./presentation/controllers/AdminController");
const CategoryController_1 = require("./presentation/controllers/CategoryController");
const OrganizerController_1 = require("./presentation/controllers/OrganizerController");
const CareerController_1 = require("./presentation/controllers/CareerController");
const UserManagementController_1 = require("./presentation/controllers/UserManagementController");
const DocumentVerificationController_1 = require("./presentation/controllers/DocumentVerificationController");
const InscriptionManagementController_1 = require("./presentation/controllers/InscriptionManagementController");
const ParticipationManagementController_1 = require("./presentation/controllers/ParticipationManagementController");
const CertificateManagementController_1 = require("./presentation/controllers/CertificateManagementController");
const ReportsController_1 = require("./presentation/controllers/ReportsController");
const StudentDocumentController_1 = require("./presentation/controllers/StudentDocumentController");
const StudentContentController_1 = require("./presentation/controllers/StudentContentController");
// Importar middlewares
const securityMiddleware_1 = require("./presentation/middleware/securityMiddleware");
const jwtMiddleware_1 = require("./presentation/middleware/jwtMiddleware");
const middleware_1 = require("./presentation/middleware");
const multer_1 = tslib_1.__importDefault(require("multer"));
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
        this.homepageController = new HomepageController_1.HomepageController(this.container);
        this.changeRequestController = new ChangeRequestController_1.ChangeRequestController(this.container);
        this.inscriptionController = new InscriptionController_1.InscriptionController(this.container);
        this.adminController = new AdminController_1.AdminController(this.container);
        this.categoryController = new CategoryController_1.CategoryController(this.container);
        this.organizerController = new OrganizerController_1.OrganizerController(this.container);
        this.careerController = new CareerController_1.CareerController(this.container);
        this.userManagementController = new UserManagementController_1.UserManagementController(this.container);
        this.documentVerificationController = new DocumentVerificationController_1.DocumentVerificationController(this.container);
        this.inscriptionManagementController = new InscriptionManagementController_1.InscriptionManagementController(this.container);
        this.participationManagementController = new ParticipationManagementController_1.ParticipationManagementController(this.container);
        this.certificateManagementController = new CertificateManagementController_1.CertificateManagementController(this.container);
        this.reportsController = new ReportsController_1.ReportsController(this.container);
        this.studentDocumentController = new StudentDocumentController_1.StudentDocumentController(this.container);
        this.studentContentController = new StudentContentController_1.StudentContentController(this.container);
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
        this.setupInscriptionRoutes();
        this.setupHomepageRoutes();
        this.setupChangeRequestRoutes();
        this.setupAdminRoutes();
        this.setupUserManagementRoutes();
        this.setupInscriptionManagementRoutes();
        this.setupParticipationManagementRoutes();
        this.setupCertificateManagementRoutes();
        this.setupReportsRoutes();
        this.setupStudentRoutes();
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
        this.app.post("/api/auth/createAdmin", jwtMiddleware_1.validateJWT, // Requiere autenticación
        (0, jwtMiddleware_1.validateRoles)('MASTER'), // Solo MASTER puede crear administradores
        this.authController.createAdmin.bind(this.authController));
    }
    /**
     * Configurar rutas de usuarios
     */
    setupUserRoutes() {
        this.app.get("/api/users", this.userController.getAllUsers.bind(this.userController));
        this.app.get("/api/users/profile", jwtMiddleware_1.validateJWT, this.userController.getUserProfile.bind(this.userController));
        this.app.put("/api/users/profile", jwtMiddleware_1.validateJWT, this.userController.updateUserProfile.bind(this.userController));
        this.app.get("/api/users/admins", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('MASTER'), // Solo MASTER puede ver la lista de administradores
        this.userController.getAdmins.bind(this.userController));
    }
    /**
     * Configurar rutas de cursos
     */
    setupCourseRoutes() {
        // RUTAS PÚBLICAS DE CURSOS
        this.app.get("/api/courses", this.courseController.getCourses.bind(this.courseController));
        this.app.get("/api/courses/:id", this.courseController.getCourseById.bind(this.courseController));
        // RUTAS ADMINISTRATIVAS DE CURSOS (requieren JWT)
        this.app.get("/api/cursos", jwtMiddleware_1.validateJWT, this.courseController.getCursosAdmin.bind(this.courseController));
        this.app.post("/api/cursos", jwtMiddleware_1.validateJWT, this.courseController.createCourse.bind(this.courseController));
        this.app.put("/api/cursos/:id", jwtMiddleware_1.validateJWT, this.courseController.updateCourse.bind(this.courseController));
        this.app.delete("/api/cursos/:id", jwtMiddleware_1.validateJWT, this.courseController.deleteCourse.bind(this.courseController));
        this.app.put("/api/cursos/:id/cerrar", jwtMiddleware_1.validateJWT, this.courseController.closeCourse.bind(this.courseController));
        // RUTAS DE CATEGORÍAS
        this.app.get("/api/categorias", this.categoryController.getCategorias.bind(this.categoryController));
        this.app.post("/api/categorias", jwtMiddleware_1.validateJWT, this.categoryController.createCategoria.bind(this.categoryController));
        // RUTAS DE ORGANIZADORES
        this.app.get("/api/organizadores", this.organizerController.getOrganizadores.bind(this.organizerController));
        this.app.post("/api/organizadores", jwtMiddleware_1.validateJWT, this.organizerController.createOrganizador.bind(this.organizerController));
        // RUTAS DE CARRERAS
        this.app.get("/api/carreras", this.careerController.getAllCareers.bind(this.careerController));
        this.app.post("/api/carreras", jwtMiddleware_1.validateJWT, this.careerController.createCareer.bind(this.careerController));
        // LEGACY ROUTES FOR COMPATIBILITY
        this.app.post("/api/courses", this.courseController.createCourse.bind(this.courseController));
    }
    /**
     * Configurar rutas de eventos
     */
    setupEventRoutes() {
        // RUTAS PÚBLICAS DE EVENTOS
        this.app.get("/api/events", this.eventController.getEvents.bind(this.eventController));
        this.app.get("/api/events/:id", this.eventController.getEventById.bind(this.eventController));
        // RUTAS ADMINISTRATIVAS DE EVENTOS (requieren JWT)
        this.app.get("/api/eventos", jwtMiddleware_1.validateJWT, this.eventController.getEventosAdmin.bind(this.eventController));
        this.app.post("/api/eventos", jwtMiddleware_1.validateJWT, this.eventController.createEvent.bind(this.eventController));
        this.app.put("/api/eventos/:id", jwtMiddleware_1.validateJWT, this.eventController.updateEvent.bind(this.eventController));
        this.app.delete("/api/eventos/:id", jwtMiddleware_1.validateJWT, this.eventController.deleteEvent.bind(this.eventController));
        this.app.put("/api/eventos/:id/cerrar", jwtMiddleware_1.validateJWT, this.eventController.closeEvent.bind(this.eventController));
        // LEGACY ROUTES FOR COMPATIBILITY
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
        // GET /api/certificates/participaciones-terminadas - Obtener participaciones terminadas
        this.app.get("/api/certificates/participaciones-terminadas", jwtMiddleware_1.validateJWT, this.certificateController.getCompletedParticipations.bind(this.certificateController));
        // POST /api/certificates/generar-evento/:idParticipacion - Generar certificado de evento
        this.app.post("/api/certificates/generar-evento/:idParticipacion", jwtMiddleware_1.validateJWT, this.certificateController.generateEventCertificate.bind(this.certificateController));
        // POST /api/certificates/generar-curso/:idParticipacion - Generar certificado de curso
        this.app.post("/api/certificates/generar-curso/:idParticipacion", jwtMiddleware_1.validateJWT, this.certificateController.generateCourseCertificate.bind(this.certificateController));
        // RUTAS LEGACY PARA COMPATIBILIDAD
        // GET /api/certificados/mis-certificados
        this.app.get("/api/certificados/mis-certificados", jwtMiddleware_1.validateJWT, this.certificateController.getUserCertificates.bind(this.certificateController));
        // GET /api/certificados/descargar/:tipo/:idParticipacion
        this.app.get("/api/certificados/descargar/:tipo/:idParticipacion", jwtMiddleware_1.validateJWT, this.certificateController.downloadCertificate.bind(this.certificateController));
    }
    /**
     * Configurar rutas de inscripciones
     */
    setupInscriptionRoutes() {
        // RUTAS REFACTORIZADAS
        this.app.post("/api/inscriptions/events", jwtMiddleware_1.validateJWT, this.inscriptionController.enrollInEvent.bind(this.inscriptionController));
        this.app.post("/api/inscriptions/courses", jwtMiddleware_1.validateJWT, this.inscriptionController.enrollInCourse.bind(this.inscriptionController));
        this.app.get("/api/inscriptions/my-events", jwtMiddleware_1.validateJWT, this.inscriptionController.getMyEventInscriptions.bind(this.inscriptionController));
        this.app.get("/api/inscriptions/my-courses", jwtMiddleware_1.validateJWT, this.inscriptionController.getMyCourseInscriptions.bind(this.inscriptionController));
        // RUTAS LEGACY PARA COMPATIBILIDAD CON FRONTEND
        // Configurar multer para subida de archivos
        const multer = require('multer');
        const path = require('path');
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, 'uploads/comprobantes/');
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, 'comprobante-' + uniqueSuffix + path.extname(file.originalname));
            }
        });
        const uploadReceipt = multer({
            storage: storage,
            limits: {
                fileSize: 5 * 1024 * 1024 // 5MB máximo
            },
            fileFilter: (req, file, cb) => {
                // Permitir archivos PDF e imágenes
                if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
                    cb(null, true);
                }
                else {
                    cb(new Error('Solo se permiten archivos PDF e imágenes'), false);
                }
            }
        });
        // Inscripción a evento con archivo
        this.app.post("/api/inscripciones", jwtMiddleware_1.validateJWT, uploadReceipt.single('comprobantePago'), this.inscriptionController.enrollInEventWithFile.bind(this.inscriptionController));
        // Inscripción a curso con archivo
        this.app.post("/api/inscripcionesCursos", jwtMiddleware_1.validateJWT, uploadReceipt.single('comprobantePago'), this.inscriptionController.enrollInCourseWithFile.bind(this.inscriptionController));
        // Visualizar comprobante de pago de evento
        this.app.get("/api/inscripciones/evento/comprobante/:inscripcionId", jwtMiddleware_1.validateJWT, this.inscriptionController.getEventPaymentReceipt.bind(this.inscriptionController));
        // Visualizar comprobante de pago de curso
        this.app.get("/api/inscripcionesCursos/curso/comprobante/:inscripcionId", jwtMiddleware_1.validateJWT, this.inscriptionController.getCoursePaymentReceipt.bind(this.inscriptionController));
    }
    /**
     * Configurar rutas de homepage (página principal)
     */
    setupHomepageRoutes() {
        // Configuración de multer para imágenes
        const storage = multer_1.default.memoryStorage();
        const upload = (0, multer_1.default)({
            storage: storage,
            limits: {
                fileSize: 5 * 1024 * 1024 // 5MB máximo
            },
            fileFilter: (req, file, cb) => {
                // Verificar que sea una imagen
                if (file.mimetype.startsWith('image/')) {
                    cb(null, true);
                }
                else {
                    cb(new Error('Solo se permiten archivos de imagen'), false);
                }
            }
        });
        // RUTAS REFACTORIZADAS (NUEVAS)
        // GET /api/homepage/content - Obtener contenido
        this.app.get("/api/homepage/content", this.homepageController.getContent.bind(this.homepageController));
        // PUT /api/homepage/content - Actualizar contenido
        this.app.put("/api/homepage/content", jwtMiddleware_1.validateJWT, this.homepageController.updateContent.bind(this.homepageController));
        // POST /api/homepage/image/:imageType - Subir imagen
        this.app.post("/api/homepage/image/:imageType", jwtMiddleware_1.validateJWT, upload.single('imagen'), this.homepageController.uploadImage.bind(this.homepageController));
        // GET /api/homepage/image/:imageType - Obtener imagen
        this.app.get("/api/homepage/image/:imageType", this.homepageController.getImage.bind(this.homepageController));
        // GET /api/homepage/external-content - Para usuarios externos (solo públicos)
        this.app.get("/api/homepage/external-content", this.homepageController.getExternalContent.bind(this.homepageController));
        // RUTAS LEGACY (COMPATIBILIDAD CON FRONTEND)
        // GET /api/pagina-principal/contenido
        this.app.get("/api/pagina-principal/contenido", this.homepageController.getContent.bind(this.homepageController));
        // PUT /api/pagina-principal/contenido
        this.app.put("/api/pagina-principal/contenido", jwtMiddleware_1.validateJWT, this.homepageController.updateContent.bind(this.homepageController));
        // POST /api/pagina-principal/imagen/:tipoImagen
        this.app.post("/api/pagina-principal/imagen/:tipoImagen", jwtMiddleware_1.validateJWT, upload.single('imagen'), this.homepageController.uploadImage.bind(this.homepageController));
        // GET /api/pagina-principal/imagen/:tipoImagen
        this.app.get("/api/pagina-principal/imagen/:tipoImagen", this.homepageController.getImage.bind(this.homepageController));
        // GET /api/pagina-principal/eventos-cursos-disponibles (para usuarios normales)
        this.app.get("/api/pagina-principal/eventos-cursos-disponibles", this.homepageController.getExternalContent.bind(this.homepageController));
        // GET /api/pagina-principal/eventos-cursos-publicos (para usuarios no autenticados)
        this.app.get("/api/pagina-principal/eventos-cursos-publicos", this.homepageController.getPublicContent.bind(this.homepageController));
        // GET /api/pagina-principal/eventos-cursos-carrera (para estudiantes)
        this.app.get("/api/pagina-principal/eventos-cursos-carrera", jwtMiddleware_1.validateJWT, this.homepageController.getStudentContent.bind(this.homepageController));
    }
    /**
     * Configurar rutas de solicitudes de cambio
     */
    setupChangeRequestRoutes() {
        // RUTAS REFACTORIZADAS (NUEVAS)
        // POST /api/change-requests - Crear solicitud
        this.app.post("/api/change-requests", jwtMiddleware_1.validateJWT, this.changeRequestController.createChangeRequest.bind(this.changeRequestController));
        // GET /api/change-requests/my-requests - Mis solicitudes
        this.app.get("/api/change-requests/my-requests", jwtMiddleware_1.validateJWT, this.changeRequestController.getMyChangeRequests.bind(this.changeRequestController));
        // GET /api/change-requests/:id - Obtener solicitud por ID
        this.app.get("/api/change-requests/:id", jwtMiddleware_1.validateJWT, this.changeRequestController.getChangeRequestById.bind(this.changeRequestController));
        // RUTAS LEGACY (COMPATIBILIDAD CON FRONTEND)
        // POST /api/solicitudes-cambio/solicitud-nueva
        this.app.post("/api/solicitudes-cambio/solicitud-nueva", jwtMiddleware_1.validateJWT, this.changeRequestController.createChangeRequest.bind(this.changeRequestController));
        // GET /api/solicitudes-cambio/mis-solicitudes
        this.app.get("/api/solicitudes-cambio/mis-solicitudes", jwtMiddleware_1.validateJWT, this.changeRequestController.getMyChangeRequests.bind(this.changeRequestController));
        // GET /api/solicitudes-cambio/mis-solicitudes/:id
        this.app.get("/api/solicitudes-cambio/mis-solicitudes/:id", jwtMiddleware_1.validateJWT, this.changeRequestController.getChangeRequestById.bind(this.changeRequestController));
        // PUT /api/solicitudes-cambio/:id/editar
        this.app.put("/api/solicitudes-cambio/:id/editar", jwtMiddleware_1.validateJWT, this.changeRequestController.updateChangeRequest.bind(this.changeRequestController));
        // PUT /api/solicitudes-cambio/:id/enviar
        this.app.put("/api/solicitudes-cambio/:id/enviar", jwtMiddleware_1.validateJWT, this.changeRequestController.submitChangeRequest.bind(this.changeRequestController));
        // PUT /api/solicitudes-cambio/:id/cancelar
        this.app.put("/api/solicitudes-cambio/:id/cancelar", jwtMiddleware_1.validateJWT, this.changeRequestController.cancelChangeRequest.bind(this.changeRequestController));
        // GET /api/solicitudes-cambio/mis-estadisticas
        this.app.get("/api/solicitudes-cambio/mis-estadisticas", jwtMiddleware_1.validateJWT, this.changeRequestController.getMyStatistics.bind(this.changeRequestController));
        // RUTAS DE ADMINISTRACIÓN (ADMIN/MASTER)
        // GET /api/solicitudes-cambio/admin/todas
        this.app.get("/api/solicitudes-cambio/admin/todas", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.changeRequestController.getAllChangeRequests.bind(this.changeRequestController));
        // GET /api/solicitudes-cambio/admin/desarrolladores  
        this.app.get("/api/solicitudes-cambio/admin/desarrolladores", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.changeRequestController.getDevelopers.bind(this.changeRequestController));
        // GET /api/solicitudes-cambio/admin/estadisticas
        this.app.get("/api/solicitudes-cambio/admin/estadisticas", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.changeRequestController.getAdminStatistics.bind(this.changeRequestController));
        // GET /api/solicitudes-cambio/admin/solicitud/:id - Obtener solicitud específica
        this.app.get("/api/solicitudes-cambio/admin/solicitud/:id", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.changeRequestController.getChangeRequestById.bind(this.changeRequestController));
        // PUT /api/solicitudes-cambio/admin/:id/aprobar - Aprobar solicitud
        this.app.put("/api/solicitudes-cambio/admin/:id/aprobar", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.changeRequestController.approveChangeRequest.bind(this.changeRequestController));
        // PUT /api/solicitudes-cambio/admin/:id/rechazar - Rechazar solicitud
        this.app.put("/api/solicitudes-cambio/admin/:id/rechazar", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.changeRequestController.rejectChangeRequest.bind(this.changeRequestController));
        // PUT /api/solicitudes-cambio/admin/:id/actualizar - Actualizar solicitud
        this.app.put("/api/solicitudes-cambio/admin/:id/actualizar", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.changeRequestController.updateChangeRequestMaster.bind(this.changeRequestController));
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
     * Configurar rutas administrativas
     */
    setupAdminRoutes() {
        // RUTAS ADMINISTRATIVAS - Requieren autenticación y permisos de admin
        // GET /api/admin/dashboard - Estadísticas del dashboard
        this.app.get("/api/admin/dashboard", jwtMiddleware_1.validateJWT, this.adminController.getDashboardStats.bind(this.adminController));
        // GET /api/admin/recent-activity - Actividad reciente
        this.app.get("/api/admin/recent-activity", jwtMiddleware_1.validateJWT, this.adminController.getRecentActivity.bind(this.adminController));
        // GET /api/admin/pending-approvals - Elementos pendientes de aprobación
        this.app.get("/api/admin/pending-approvals", jwtMiddleware_1.validateJWT, this.adminController.getPendingApprovals.bind(this.adminController));
    }
    /**
     * Configurar rutas de gestión de usuarios (Admin)
     */
    setupUserManagementRoutes() {
        // RUTAS DE GESTIÓN DE USUARIOS - Solo MASTER
        // GET /api/admin/users - Listar todos los usuarios con filtros
        this.app.get("/api/admin/users", jwtMiddleware_1.validateJWT, this.userManagementController.getAllUsers.bind(this.userManagementController));
        // GET /api/admin/users/stats - Estadísticas de usuarios
        this.app.get("/api/admin/users/stats", jwtMiddleware_1.validateJWT, this.userManagementController.getUserStats.bind(this.userManagementController));
        // GET /api/admin/users/:cedula - Obtener usuario específico
        this.app.get("/api/admin/users/:cedula", jwtMiddleware_1.validateJWT, this.userManagementController.getUserByCedula.bind(this.userManagementController));
        // POST /api/admin/users - Crear nuevo usuario (solo MASTER)
        this.app.post("/api/admin/users", jwtMiddleware_1.validateJWT, this.userManagementController.createUser.bind(this.userManagementController));
        // PUT /api/admin/users/:cedula - Actualizar usuario (solo MASTER)
        this.app.put("/api/admin/users/:cedula", jwtMiddleware_1.validateJWT, this.userManagementController.updateUser.bind(this.userManagementController));
        // DELETE /api/admin/users/:cedula - Eliminar usuario (solo MASTER)
        this.app.delete("/api/admin/users/:cedula", jwtMiddleware_1.validateJWT, this.userManagementController.deleteUser.bind(this.userManagementController));
        // RUTAS DE VERIFICACIÓN DE DOCUMENTOS - Solo MASTER
        // GET /api/admin/documents/pending - Usuarios con documentos pendientes
        this.app.get("/api/admin/documents/pending", jwtMiddleware_1.validateJWT, this.documentVerificationController.getPendingDocuments.bind(this.documentVerificationController));
        // GET /api/admin/documents/stats - Estadísticas de documentos
        this.app.get("/api/admin/documents/stats", jwtMiddleware_1.validateJWT, this.documentVerificationController.getDocumentStats.bind(this.documentVerificationController));
        // GET /api/admin/documents/download/:userId/:documentType - Descargar documento
        this.app.get("/api/admin/documents/download/:userId/:documentType", jwtMiddleware_1.validateJWT, this.documentVerificationController.downloadUserDocument.bind(this.documentVerificationController));
        // PUT /api/admin/documents/approve/:userId/:documentType - Aprobar documento
        this.app.put("/api/admin/documents/approve/:userId/:documentType", jwtMiddleware_1.validateJWT, this.documentVerificationController.approveUserDocument.bind(this.documentVerificationController));
        // PUT /api/admin/documents/reject/:userId - Rechazar documentos
        this.app.put("/api/admin/documents/reject/:userId", jwtMiddleware_1.validateJWT, this.documentVerificationController.rejectUserDocuments.bind(this.documentVerificationController));
    }
    /**
     * Configurar rutas de gestión de inscripciones (Admin)
     */
    setupInscriptionManagementRoutes() {
        // RUTAS DE GESTIÓN DE INSCRIPCIONES - Requieren JWT y permisos admin
        // GET /api/administracion/cursos-eventos - Obtener cursos y eventos administrables
        this.app.get("/api/administracion/cursos-eventos", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.inscriptionManagementController.getCoursesAndEventsForManagement.bind(this.inscriptionManagementController));
        // GET /api/administracion/evento/:idEvento - Detalles de evento para admin
        this.app.get("/api/administracion/evento/:idEvento", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.inscriptionManagementController.getEventDetailsForAdmin.bind(this.inscriptionManagementController));
        // GET /api/administracion/curso/:idCurso - Detalles de curso para admin
        this.app.get("/api/administracion/curso/:idCurso", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.inscriptionManagementController.getCourseDetailsForAdmin.bind(this.inscriptionManagementController));
        // GET /api/admin/inscriptions/events/pending - Inscripciones de eventos pendientes
        this.app.get("/api/admin/inscriptions/events/pending", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.inscriptionManagementController.getPendingEventInscriptions.bind(this.inscriptionManagementController));
        // GET /api/admin/inscriptions/courses/pending - Inscripciones de cursos pendientes
        this.app.get("/api/admin/inscriptions/courses/pending", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.inscriptionManagementController.getPendingCourseInscriptions.bind(this.inscriptionManagementController));
        // PUT /api/admin/inscriptions/events/:id/approve - Aprobar inscripción de evento
        this.app.put("/api/admin/inscriptions/events/:id/approve", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.inscriptionManagementController.approveEventInscription.bind(this.inscriptionManagementController));
        // PUT /api/admin/inscriptions/courses/:id/approve - Aprobar inscripción de curso
        this.app.put("/api/admin/inscriptions/courses/:id/approve", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.inscriptionManagementController.approveCourseInscription.bind(this.inscriptionManagementController));
        // PUT /api/admin/inscriptions/events/:id/reject - Rechazar inscripción de evento
        this.app.put("/api/admin/inscriptions/events/:id/reject", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.inscriptionManagementController.rejectEventInscription.bind(this.inscriptionManagementController));
        // PUT /api/admin/inscriptions/courses/:id/reject - Rechazar inscripción de curso
        this.app.put("/api/admin/inscriptions/courses/:id/reject", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.inscriptionManagementController.rejectCourseInscription.bind(this.inscriptionManagementController));
        // GET /api/admin/inscriptions/events/:id/receipt - Descargar comprobante de evento
        this.app.get("/api/admin/inscriptions/events/:id/receipt", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.inscriptionManagementController.downloadEventReceipt.bind(this.inscriptionManagementController));
        // GET /api/admin/inscriptions/courses/:id/receipt - Descargar comprobante de curso
        this.app.get("/api/admin/inscriptions/courses/:id/receipt", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.inscriptionManagementController.downloadCourseReceipt.bind(this.inscriptionManagementController));
        // GET /api/admin/inscriptions/stats - Estadísticas de inscripciones
        this.app.get("/api/admin/inscriptions/stats", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.inscriptionManagementController.getInscriptionStats.bind(this.inscriptionManagementController));
        // RUTAS LEGACY PARA COMPATIBILIDAD
        // PUT /api/administracion/evento/inscripcion/:idInscripcion/aprobar - Legacy route
        this.app.put("/api/administracion/evento/inscripcion/:idInscripcion/aprobar", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.inscriptionManagementController.approveEventInscription.bind(this.inscriptionManagementController));
        // PUT /api/administracion/evento/inscripcion/:idInscripcion/rechazar - Legacy route
        this.app.put("/api/administracion/evento/inscripcion/:idInscripcion/rechazar", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.inscriptionManagementController.rejectEventInscription.bind(this.inscriptionManagementController));
        // PUT /api/administracion/curso/inscripcion/:idInscripcion/aprobar - Legacy route
        this.app.put("/api/administracion/curso/inscripcion/:idInscripcion/aprobar", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.inscriptionManagementController.approveCourseInscription.bind(this.inscriptionManagementController));
        // PUT /api/administracion/curso/inscripcion/:idInscripcion/rechazar - Legacy route
        this.app.put("/api/administracion/curso/inscripcion/:idInscripcion/rechazar", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.inscriptionManagementController.rejectCourseInscription.bind(this.inscriptionManagementController));
        // PUT /inscripciones/evento/aprobar-inscripcion/:id - Legacy route
        this.app.put("/api/inscripciones/evento/aprobar-inscripcion/:id", jwtMiddleware_1.validateJWT, this.inscriptionManagementController.approveEventInscription.bind(this.inscriptionManagementController));
        // PUT /inscripciones-cursos/aprobar-inscripcion/:id - Legacy route
        this.app.put("/api/inscripciones-cursos/aprobar-inscripcion/:id", jwtMiddleware_1.validateJWT, this.inscriptionManagementController.approveCourseInscription.bind(this.inscriptionManagementController));
    }
    /**
     * Configurar rutas de gestión de participaciones (Admin)
     */
    setupParticipationManagementRoutes() {
        // RUTAS DE GESTIÓN DE PARTICIPACIONES - Requieren JWT y permisos admin
        // GET /api/participaciones/cursos/:idCurso - Obtener participaciones de curso
        this.app.get("/api/participaciones/cursos/:idCurso", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.participationManagementController.getCourseParticipations.bind(this.participationManagementController));
        // PUT /api/participaciones/cursos/:idCurso/inscripcion/:idInscripcion - Actualizar participación de curso
        this.app.put("/api/participaciones/cursos/:idCurso/inscripcion/:idInscripcion", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.participationManagementController.updateCourseParticipation.bind(this.participationManagementController));
        // GET /api/participaciones/eventos/:idEvento - Obtener participaciones de evento
        this.app.get("/api/participaciones/eventos/:idEvento", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.participationManagementController.getEventParticipations.bind(this.participationManagementController));
        // PUT /api/participaciones/eventos/:idEvento/inscripcion/:idInscripcion - Actualizar participación de evento
        this.app.put("/api/participaciones/eventos/:idEvento/inscripcion/:idInscripcion", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.participationManagementController.updateEventParticipation.bind(this.participationManagementController));
        // GET /api/admin/participations/events/:eventId/inscriptions - Inscripciones para participación
        this.app.get("/api/admin/participations/events/:eventId/inscriptions", jwtMiddleware_1.validateJWT, this.participationManagementController.getEventInscriptionsForParticipation.bind(this.participationManagementController));
        // GET /api/admin/participations/courses/:courseId/inscriptions - Inscripciones para participación
        this.app.get("/api/admin/participations/courses/:courseId/inscriptions", jwtMiddleware_1.validateJWT, this.participationManagementController.getCourseInscriptionsForParticipation.bind(this.participationManagementController));
        // POST /api/admin/participations/events/:eventId/register - Registrar participación en evento
        this.app.post("/api/admin/participations/events/:eventId/register", jwtMiddleware_1.validateJWT, this.participationManagementController.registerEventParticipation.bind(this.participationManagementController));
        // POST /api/admin/participations/courses/:courseId/register - Registrar participación en curso
        this.app.post("/api/admin/participations/courses/:courseId/register", jwtMiddleware_1.validateJWT, this.participationManagementController.registerCourseParticipation.bind(this.participationManagementController));
        // PUT /api/admin/participations/events/:participationId - Actualizar participación de evento
        this.app.put("/api/admin/participations/events/:participationId", jwtMiddleware_1.validateJWT, this.participationManagementController.updateEventParticipation.bind(this.participationManagementController));
        // GET /api/admin/participations/events/:eventId/stats - Estadísticas de evento
        this.app.get("/api/admin/participations/events/:eventId/stats", jwtMiddleware_1.validateJWT, this.participationManagementController.getEventParticipationStats.bind(this.participationManagementController));
        // GET /api/admin/participations/courses/:courseId/stats - Estadísticas de curso
        this.app.get("/api/admin/participations/courses/:courseId/stats", jwtMiddleware_1.validateJWT, this.participationManagementController.getCourseParticipationStats.bind(this.participationManagementController));
        // GET /api/admin/participations/general-stats - Estadísticas generales
        this.app.get("/api/admin/participations/general-stats", jwtMiddleware_1.validateJWT, this.participationManagementController.getGeneralParticipationStats.bind(this.participationManagementController));
        // RUTAS LEGACY PARA COMPATIBILIDAD
        // POST /administracion/registrar-participacion-evento/:eventId - Legacy route
        this.app.post("/api/administracion/registrar-participacion-evento/:eventId", jwtMiddleware_1.validateJWT, this.participationManagementController.registerEventParticipation.bind(this.participationManagementController));
        // POST /administracion/registrar-participacion-curso/:courseId - Legacy route
        this.app.post("/api/administracion/registrar-participacion-curso/:courseId", jwtMiddleware_1.validateJWT, this.participationManagementController.registerCourseParticipation.bind(this.participationManagementController));
    }
    /**
     * Configurar rutas de gestión de certificados (Admin)
     */
    setupCertificateManagementRoutes() {
        // RUTAS DE GESTIÓN DE CERTIFICADOS - Requieren JWT y permisos admin
        // GET /api/admin/certificates/events/:eventId/participants - Participantes aprobados de evento
        this.app.get("/api/admin/certificates/events/:eventId/participants", jwtMiddleware_1.validateJWT, this.certificateManagementController.getEventApprovedParticipants.bind(this.certificateManagementController));
        // GET /api/admin/certificates/courses/:courseId/participants - Participantes aprobados de curso
        this.app.get("/api/admin/certificates/courses/:courseId/participants", jwtMiddleware_1.validateJWT, this.certificateManagementController.getCourseApprovedParticipants.bind(this.certificateManagementController));
        // POST /api/admin/certificates/events/generate-massive - Generación masiva eventos
        this.app.post("/api/admin/certificates/events/generate-massive", jwtMiddleware_1.validateJWT, this.certificateManagementController.generateMassiveEventCertificates.bind(this.certificateManagementController));
        // POST /api/admin/certificates/courses/generate-massive - Generación masiva cursos
        this.app.post("/api/admin/certificates/courses/generate-massive", jwtMiddleware_1.validateJWT, this.certificateManagementController.generateMassiveCourseCertificates.bind(this.certificateManagementController));
        // PUT /api/admin/certificates/regenerate/:type/:participationId - Regenerar certificado
        this.app.put("/api/admin/certificates/regenerate/:type/:participationId", jwtMiddleware_1.validateJWT, this.certificateManagementController.regenerateCertificate.bind(this.certificateManagementController));
        // GET /api/admin/certificates/stats - Estadísticas de certificados
        this.app.get("/api/admin/certificates/stats", jwtMiddleware_1.validateJWT, this.certificateManagementController.getCertificateStats.bind(this.certificateManagementController));
        // RUTAS LEGACY PARA COMPATIBILIDAD
        // PUT /certificados/regenerar/:tipo/:idParticipacion - Legacy route
        this.app.put("/api/certificados/regenerar/:tipo/:idParticipacion", jwtMiddleware_1.validateJWT, this.certificateManagementController.regenerateCertificate.bind(this.certificateManagementController));
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
            admin: this.adminController,
        };
    }
    /**
     * Configurar rutas de reportes y estadísticas (Admin)
     */
    setupReportsRoutes() {
        // RUTAS DE GENERACIÓN DE REPORTES - Requieren JWT y permisos admin
        // POST /api/admin/reports/financial/generate - Generar reporte financiero
        this.app.post("/api/admin/reports/financial/generate", jwtMiddleware_1.validateJWT, this.reportsController.generateFinancialReport.bind(this.reportsController));
        // POST /api/admin/reports/users/generate - Generar reporte de usuarios
        this.app.post("/api/admin/reports/users/generate", jwtMiddleware_1.validateJWT, this.reportsController.generateUsersReport.bind(this.reportsController));
        // POST /api/admin/reports/events/generate - Generar reporte de eventos
        this.app.post("/api/admin/reports/events/generate", jwtMiddleware_1.validateJWT, this.reportsController.generateEventsReport.bind(this.reportsController));
        // POST /api/admin/reports/courses/generate - Generar reporte de cursos
        this.app.post("/api/admin/reports/courses/generate", jwtMiddleware_1.validateJWT, this.reportsController.generateCoursesReport.bind(this.reportsController));
        // POST /api/admin/reports/change-requests/status/generate - Reporte solicitudes por estado (MASTER only)
        this.app.post("/api/admin/reports/change-requests/status/generate", jwtMiddleware_1.validateJWT, this.reportsController.generateChangeRequestsStatusReport.bind(this.reportsController));
        // POST /api/admin/reports/change-requests/developers/generate - Reporte solicitudes por desarrollador (MASTER only)
        this.app.post("/api/admin/reports/change-requests/developers/generate", jwtMiddleware_1.validateJWT, this.reportsController.generateChangeRequestsDevelopersReport.bind(this.reportsController));
        // POST /api/admin/reports/change-requests/summary/generate - Reporte ejecutivo solicitudes (MASTER only)
        this.app.post("/api/admin/reports/change-requests/summary/generate", jwtMiddleware_1.validateJWT, this.reportsController.generateChangeRequestsSummaryReport.bind(this.reportsController));
        // GET /api/admin/reports - Listar reportes por tipo
        this.app.get("/api/admin/reports", jwtMiddleware_1.validateJWT, this.reportsController.getReports.bind(this.reportsController));
        // GET /api/admin/reports/:id/download - Descargar reporte por ID
        this.app.get("/api/admin/reports/:id/download", jwtMiddleware_1.validateJWT, this.reportsController.downloadReport.bind(this.reportsController));
        // GET /api/admin/reports/stats - Estadísticas de reportes
        this.app.get("/api/admin/reports/stats", jwtMiddleware_1.validateJWT, this.reportsController.getReportStats.bind(this.reportsController));
        // RUTAS LEGACY PARA COMPATIBILIDAD
        // POST /api/reportes/finanzas/pdf - Legacy route
        this.app.post("/api/reportes/finanzas/pdf", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.reportsController.generateFinancialReport.bind(this.reportsController));
        // POST /api/reportes/usuarios/pdf - Legacy route
        this.app.post("/api/reportes/usuarios/pdf", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.reportsController.generateUsersReport.bind(this.reportsController));
        // POST /api/reportes/eventos/pdf - Legacy route
        this.app.post("/api/reportes/eventos/pdf", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.reportsController.generateEventsReport.bind(this.reportsController));
        // POST /api/reportes/cursos/pdf - Legacy route
        this.app.post("/api/reportes/cursos/pdf", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.reportsController.generateCoursesReport.bind(this.reportsController));
        // POST /api/reportes/solicitudes/estado/pdf - Legacy route (MASTER only)
        this.app.post("/api/reportes/solicitudes/estado/pdf", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('MASTER'), this.reportsController.generateChangeRequestsStatusReport.bind(this.reportsController));
        // POST /api/reportes/solicitudes/desarrollador/pdf - Legacy route (MASTER only)
        this.app.post("/api/reportes/solicitudes/desarrollador/pdf", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('MASTER'), this.reportsController.generateChangeRequestsDevelopersReport.bind(this.reportsController));
        // POST /api/reportes/solicitudes/resumen/pdf - Legacy route (MASTER only)
        this.app.post("/api/reportes/solicitudes/resumen/pdf", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('MASTER'), this.reportsController.generateChangeRequestsSummaryReport.bind(this.reportsController));
        // GET /api/reportes - Legacy route para listar reportes
        this.app.get("/api/reportes", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.reportsController.getReports.bind(this.reportsController));
        // GET /api/reportes/download/:id - Legacy route para descargar
        this.app.get("/api/reportes/download/:id", jwtMiddleware_1.validateJWT, (0, jwtMiddleware_1.validateRoles)('ADMINISTRADOR', 'MASTER'), this.reportsController.downloadReport.bind(this.reportsController));
    }
    /**
     * Configurar rutas específicas para estudiantes
     */
    setupStudentRoutes() {
        // Configurar multer para subida de comprobantes de pago
        const multer = require('multer');
        const path = require('path');
        const receiptStorage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, 'uploads/comprobantes/');
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, 'comprobante-estudiante-' + uniqueSuffix + path.extname(file.originalname));
            }
        });
        const uploadReceipt = multer({
            storage: receiptStorage,
            limits: {
                fileSize: 5 * 1024 * 1024 // 5MB máximo
            },
            fileFilter: (req, file, cb) => {
                // Permitir archivos PDF e imágenes
                if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
                    cb(null, true);
                }
                else {
                    cb(new Error('Tipo de archivo no permitido. Solo PDF e imágenes.'), false);
                }
            }
        });
        // Configuración de multer para subida de documentos
        const documentStorage = multer.memoryStorage();
        const upload = multer({
            storage: documentStorage,
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB máximo
            },
            fileFilter: (req, file, cb) => {
                // Solo permitir PDFs
                if (file.mimetype === 'application/pdf') {
                    cb(null, true);
                }
                else {
                    cb(new Error('Solo se permiten archivos PDF'));
                }
            }
        });
        // RUTAS DE GESTIÓN DE DOCUMENTOS ESTUDIANTILES - Requieren JWT y rol ESTUDIANTE
        // POST /api/student/documents/upload - Subir documentos (cédula y matrícula)
        this.app.post("/api/student/documents/upload", jwtMiddleware_1.validateJWT, upload.fields([
            { name: 'cedula', maxCount: 1 },
            { name: 'matricula', maxCount: 1 }
        ]), this.studentDocumentController.uploadStudentDocuments.bind(this.studentDocumentController));
        // GET /api/student/documents/status - Estado de verificación de documentos
        this.app.get("/api/student/documents/status", jwtMiddleware_1.validateJWT, this.studentDocumentController.getDocumentStatus.bind(this.studentDocumentController));
        // GET /api/student/documents/download/:type - Descargar documento específico
        this.app.get("/api/student/documents/download/:type", jwtMiddleware_1.validateJWT, this.studentDocumentController.downloadDocument.bind(this.studentDocumentController));
        // PUT /api/student/documents/update/:type - Actualizar documento específico
        this.app.put("/api/student/documents/update/:type", jwtMiddleware_1.validateJWT, upload.single('document'), this.studentDocumentController.updateDocument.bind(this.studentDocumentController));
        // GET /api/student/documents/history - Historial de verificaciones
        this.app.get("/api/student/documents/history", jwtMiddleware_1.validateJWT, this.studentDocumentController.getVerificationHistory.bind(this.studentDocumentController));
        // GET /api/student/documents/requirements - Requisitos para estudiantes
        this.app.get("/api/student/documents/requirements", jwtMiddleware_1.validateJWT, this.studentDocumentController.getDocumentRequirements.bind(this.studentDocumentController));
        // RUTAS DE CONTENIDO PARA ESTUDIANTES - Solo funcionalidades básicas originales
        // GET /api/student/events/available - Eventos disponibles para estudiantes
        this.app.get("/api/student/events/available", jwtMiddleware_1.validateJWT, this.studentContentController.getAvailableEvents.bind(this.studentContentController));
        // GET /api/student/courses/available - Cursos disponibles para estudiantes
        this.app.get("/api/student/courses/available", jwtMiddleware_1.validateJWT, this.studentContentController.getAvailableCourses.bind(this.studentContentController));
        // RUTAS LEGACY PARA COMPATIBILIDAD CON FRONTEND EXISTENTE
        // POST /api/estudiante/documentos/subir - Legacy route
        this.app.post("/api/estudiante/documentos/subir", jwtMiddleware_1.validateJWT, upload.fields([
            { name: 'cedula', maxCount: 1 },
            { name: 'matricula', maxCount: 1 }
        ]), this.studentDocumentController.uploadStudentDocuments.bind(this.studentDocumentController));
        // GET /api/estudiante/documentos/estado - Legacy route
        this.app.get("/api/estudiante/documentos/estado", jwtMiddleware_1.validateJWT, this.studentDocumentController.getDocumentStatus.bind(this.studentDocumentController));
        // GET /api/estudiante/documentos/descargar/:tipo - Legacy route
        this.app.get("/api/estudiante/documentos/descargar/:tipo", jwtMiddleware_1.validateJWT, this.studentDocumentController.downloadDocument.bind(this.studentDocumentController));
        // PUT /api/estudiante/documentos/actualizar/:tipo - Legacy route
        this.app.put("/api/estudiante/documentos/actualizar/:tipo", jwtMiddleware_1.validateJWT, upload.single('document'), this.studentDocumentController.updateDocument.bind(this.studentDocumentController));
        // GET /api/estudiante/documentos/historial - Legacy route
        this.app.get("/api/estudiante/documentos/historial", jwtMiddleware_1.validateJWT, this.studentDocumentController.getVerificationHistory.bind(this.studentDocumentController));
        // GET /api/estudiante/requisitos - Legacy route
        this.app.get("/api/estudiante/requisitos", jwtMiddleware_1.validateJWT, this.studentDocumentController.getDocumentRequirements.bind(this.studentDocumentController));
        // RUTAS LEGACY DE CONTENIDO PARA ESTUDIANTES
        // GET /api/estudiante/eventos/disponibles - Legacy route
        this.app.get("/api/estudiante/eventos/disponibles", jwtMiddleware_1.validateJWT, this.studentContentController.getAvailableEvents.bind(this.studentContentController));
        // GET /api/estudiante/cursos/disponibles - Legacy route
        this.app.get("/api/estudiante/cursos/disponibles", jwtMiddleware_1.validateJWT, this.studentContentController.getAvailableCourses.bind(this.studentContentController));
        // RUTAS DE INSCRIPCIONES PARA ESTUDIANTES - Reutilizando InscriptionController existente
        // POST /api/student/inscriptions/events - Inscripción a eventos (con validación de documentos)
        this.app.post("/api/student/inscriptions/events", jwtMiddleware_1.validateJWT, middleware_1.requireVerifiedDocuments, // Middleware específico para estudiantes
        this.inscriptionController.enrollInEvent.bind(this.inscriptionController));
        // POST /api/student/inscriptions/courses - Inscripción a cursos (con validación de documentos)
        this.app.post("/api/student/inscriptions/courses", jwtMiddleware_1.validateJWT, middleware_1.requireVerifiedDocuments, // Middleware específico para estudiantes
        this.inscriptionController.enrollInCourse.bind(this.inscriptionController));
        // POST /api/student/inscriptions/events-with-file - Inscripción a eventos con comprobante
        this.app.post("/api/student/inscriptions/events-with-file", jwtMiddleware_1.validateJWT, middleware_1.requireVerifiedDocuments, uploadReceipt.single('comprobante'), this.inscriptionController.enrollInEventWithFile.bind(this.inscriptionController));
        // POST /api/student/inscriptions/courses-with-file - Inscripción a cursos con comprobante
        this.app.post("/api/student/inscriptions/courses-with-file", jwtMiddleware_1.validateJWT, middleware_1.requireVerifiedDocuments, uploadReceipt.single('comprobante'), this.inscriptionController.enrollInCourseWithFile.bind(this.inscriptionController));
        // GET /api/student/inscriptions/my-events - Mis inscripciones a eventos
        this.app.get("/api/student/inscriptions/my-events", jwtMiddleware_1.validateJWT, this.inscriptionController.getMyEventInscriptions.bind(this.inscriptionController));
        // GET /api/student/inscriptions/my-courses - Mis inscripciones a cursos
        this.app.get("/api/student/inscriptions/my-courses", jwtMiddleware_1.validateJWT, this.inscriptionController.getMyCourseInscriptions.bind(this.inscriptionController));
        // RUTAS LEGACY DE INSCRIPCIONES PARA ESTUDIANTES
        // POST /api/estudiante/inscripciones/eventos - Legacy route
        this.app.post("/api/estudiante/inscripciones/eventos", jwtMiddleware_1.validateJWT, middleware_1.requireVerifiedDocuments, this.inscriptionController.enrollInEvent.bind(this.inscriptionController));
        // POST /api/estudiante/inscripciones/cursos - Legacy route
        this.app.post("/api/estudiante/inscripciones/cursos", jwtMiddleware_1.validateJWT, middleware_1.requireVerifiedDocuments, this.inscriptionController.enrollInCourse.bind(this.inscriptionController));
        // POST /api/estudiante/inscripciones/eventos-con-archivo - Legacy route
        this.app.post("/api/estudiante/inscripciones/eventos-con-archivo", jwtMiddleware_1.validateJWT, middleware_1.requireVerifiedDocuments, uploadReceipt.single('comprobante'), this.inscriptionController.enrollInEventWithFile.bind(this.inscriptionController));
        // POST /api/estudiante/inscripciones/cursos-con-archivo - Legacy route
        this.app.post("/api/estudiante/inscripciones/cursos-con-archivo", jwtMiddleware_1.validateJWT, middleware_1.requireVerifiedDocuments, uploadReceipt.single('comprobante'), this.inscriptionController.enrollInCourseWithFile.bind(this.inscriptionController));
        // GET /api/estudiante/inscripciones/mis-eventos - Legacy route
        this.app.get("/api/estudiante/inscripciones/mis-eventos", jwtMiddleware_1.validateJWT, this.inscriptionController.getMyEventInscriptions.bind(this.inscriptionController));
        // GET /api/estudiante/inscripciones/mis-cursos - Legacy route
        this.app.get("/api/estudiante/inscripciones/mis-cursos", jwtMiddleware_1.validateJWT, this.inscriptionController.getMyCourseInscriptions.bind(this.inscriptionController));
        // RUTAS DE CERTIFICADOS PARA ESTUDIANTES - Reutilizando CertificateController existente
        // GET /api/student/certificates/my-certificates - Mis certificados
        this.app.get("/api/student/certificates/my-certificates", jwtMiddleware_1.validateJWT, // Solo requiere autenticación, no documentos verificados
        this.certificateController.getUserCertificates.bind(this.certificateController));
        // GET /api/student/certificates/download/:tipo/:idParticipacion - Descargar certificado
        this.app.get("/api/student/certificates/download/:tipo/:idParticipacion", jwtMiddleware_1.validateJWT, this.certificateController.downloadCertificate.bind(this.certificateController));
        // GET /api/student/certificates/completed-participations - Participaciones terminadas
        this.app.get("/api/student/certificates/completed-participations", jwtMiddleware_1.validateJWT, this.certificateController.getCompletedParticipations.bind(this.certificateController));
        // POST /api/student/certificates/generate-event/:idParticipacion - Generar certificado de evento
        this.app.post("/api/student/certificates/generate-event/:idParticipacion", jwtMiddleware_1.validateJWT, this.certificateController.generateEventCertificate.bind(this.certificateController));
        // POST /api/student/certificates/generate-course/:idParticipacion - Generar certificado de curso
        this.app.post("/api/student/certificates/generate-course/:idParticipacion", jwtMiddleware_1.validateJWT, this.certificateController.generateCourseCertificate.bind(this.certificateController));
        // RUTAS LEGACY DE CERTIFICADOS PARA ESTUDIANTES
        // GET /api/estudiante/certificados/mis-certificados - Legacy route
        this.app.get("/api/estudiante/certificados/mis-certificados", jwtMiddleware_1.validateJWT, this.certificateController.getUserCertificates.bind(this.certificateController));
        // GET /api/estudiante/certificados/descargar/:tipo/:idParticipacion - Legacy route
        this.app.get("/api/estudiante/certificados/descargar/:tipo/:idParticipacion", jwtMiddleware_1.validateJWT, this.certificateController.downloadCertificate.bind(this.certificateController));
        // GET /api/estudiante/certificados/participaciones-terminadas - Legacy route
        this.app.get("/api/estudiante/certificados/participaciones-terminadas", jwtMiddleware_1.validateJWT, this.certificateController.getCompletedParticipations.bind(this.certificateController));
        // POST /api/estudiante/certificados/generar-evento/:idParticipacion - Legacy route
        this.app.post("/api/estudiante/certificados/generar-evento/:idParticipacion", jwtMiddleware_1.validateJWT, this.certificateController.generateEventCertificate.bind(this.certificateController));
        // POST /api/estudiante/certificados/generar-curso/:idParticipacion - Legacy route
        this.app.post("/api/estudiante/certificados/generar-curso/:idParticipacion", jwtMiddleware_1.validateJWT, this.certificateController.generateCourseCertificate.bind(this.certificateController));
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