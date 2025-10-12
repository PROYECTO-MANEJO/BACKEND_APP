import { Application } from "express";
import { AuthController } from "./presentation/controllers/AuthController";
import { UserController } from "./presentation/controllers/UserController";
import { CourseController } from "./presentation/controllers/CourseController";
import { EventController } from "./presentation/controllers/EventController";
import { CertificateController } from "./presentation/controllers/CertificateController";
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
    };
}
//# sourceMappingURL=Server.d.ts.map