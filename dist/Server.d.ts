import { Application } from "express";
import { AuthController } from "./presentation/controllers/AuthController";
import { UserController } from "./presentation/controllers/UserController";
import { CourseController } from "./presentation/controllers/CourseController";
import { EventController } from "./presentation/controllers/EventController";
import { CertificateController } from "./presentation/controllers/CertificateController";
import { AdminController } from "./presentation/controllers/AdminController";
/**
 * Clase principal del servidor Express con Clean Architecture
 */
export declare class Server {
    private app;
    private port;
    private container;
    private authController;
    private userController;
    private courseController;
    private eventController;
    private certificateController;
    private homepageController;
    private changeRequestController;
    private inscriptionController;
    private adminController;
    private categoryController;
    private organizerController;
    private careerController;
    private userManagementController;
    private documentVerificationController;
    private inscriptionManagementController;
    private participationManagementController;
    private certificateManagementController;
    private reportsController;
    private studentDocumentController;
    private studentContentController;
    constructor(port?: number);
    /**
     * Configurar middlewares globales
     */
    private setupMiddlewares;
    /**
     * Configurar rutas de la aplicación
     */
    private setupRoutes;
    /**
     * Configurar rutas de autenticación
     */
    private setupAuthRoutes;
    /**
     * Configurar rutas de usuarios
     */
    private setupUserRoutes;
    /**
     * Configurar rutas de cursos
     */
    private setupCourseRoutes;
    /**
     * Configurar rutas de eventos
     */
    private setupEventRoutes;
    /**
     * Configurar rutas de certificados
     */
    private setupCertificateRoutes;
    /**
     * Configurar rutas de inscripciones
     */
    private setupInscriptionRoutes;
    /**
     * Configurar rutas de homepage (página principal)
     */
    private setupHomepageRoutes;
    /**
     * Configurar rutas de solicitudes de cambio
     */
    private setupChangeRequestRoutes;
    /**
     * Configurar manejo de errores
     */
    private setupErrorHandling;
    /**
     * Iniciar el servidor
     */
    start(): Promise<void>;
    /**
     * Detener el servidor gracefully
     */
    stop(): Promise<void>;
    /**
     * Configurar rutas administrativas
     */
    private setupAdminRoutes;
    /**
     * Configurar rutas de gestión de usuarios (Admin)
     */
    private setupUserManagementRoutes;
    /**
     * Configurar rutas de gestión de inscripciones (Admin)
     */
    private setupInscriptionManagementRoutes;
    /**
     * Configurar rutas de gestión de participaciones (Admin)
     */
    private setupParticipationManagementRoutes;
    /**
     * Configurar rutas de gestión de certificados (Admin)
     */
    private setupCertificateManagementRoutes;
    /**
     * Obtener la aplicación Express (útil para testing)
     */
    getApp(): Application;
    /**
     * Obtener los controladores (reemplaza el contenedor por ahora)
     */
    getControllers(): {
        auth: AuthController;
        user: UserController;
        course: CourseController;
        event: EventController;
        certificate: CertificateController;
        admin: AdminController;
    };
    /**
     * Configurar rutas de reportes y estadísticas (Admin)
     */
    private setupReportsRoutes;
    /**
     * Configurar rutas específicas para estudiantes
     */
    private setupStudentRoutes;
}
//# sourceMappingURL=Server.d.ts.map