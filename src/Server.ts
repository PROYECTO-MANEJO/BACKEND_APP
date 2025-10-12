import express, { Application } from "express";
// Import DIContainer for dependency injection
import { DIContainer } from "./infrastructure/DIContainer";
// Import controllers
import { AuthController } from "./presentation/controllers/AuthController";
import { UserController } from "./presentation/controllers/UserController";
import { CourseController } from "./presentation/controllers/CourseController";
import { EventController } from "./presentation/controllers/EventController";
import { CertificateController } from "./presentation/controllers/CertificateController";

// Importar rutas
import { AuthRoutes } from "./presentation/routes/authRoutes";
import { UserRoutes } from "./presentation/routes/userRoutes";
import { CourseRoutes } from "./presentation/routes/courseRoutes";
import { EventRoutes } from "./presentation/routes/eventRoutes";
import { CertificateRoutes } from "./presentation/routes/certificateRoutes";

// Importar middlewares
import {
  notFoundHandler,
  globalErrorHandler,
  healthCheck,
} from "./presentation/middleware/securityMiddleware";
import { validateJWT } from "./presentation/middleware/jwtMiddleware";

/**
 * Clase principal del servidor Express con Clean Architecture
 */
export class Server {
  private app: Application;
  private port: number;
  private container: DIContainer;

  // Controllers
  private authController: AuthController;
  private userController: UserController;
  private courseController: CourseController;
  private eventController: EventController;
  private certificateController: CertificateController;

  constructor(port: number = 3000) {
    this.port = port;
    this.app = express();
    
    // Initialize dependency injection container
    this.container = DIContainer.getInstance();

    // Initialize controllers with dependency injection
    this.authController = new AuthController(this.container);
    this.userController = new UserController(this.container);
    this.courseController = new CourseController(); // TODO: Add DI later
    this.eventController = new EventController(); // TODO: Add DI later
    this.certificateController = new CertificateController(); // TODO: Add DI later

    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Configurar middlewares globales
   */
  private setupMiddlewares(): void {
    // Middlewares básicos
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));

    // CORS básico
    this.app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      
      if (req.method === "OPTIONS") {
        res.sendStatus(200);
      } else {
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
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get("/health", healthCheck);
    this.app.get("/api/health", healthCheck);

    // Crear rutas manualmente (sin DIContainer)
    this.setupAuthRoutes();
    this.setupUserRoutes();
    this.setupCourseRoutes();
    this.setupEventRoutes();
    this.setupCertificateRoutes();

    // Ruta raíz para verificar que el servidor está funcionando
    this.app.get("/", (req, res) => {
      res.json({
        message:
          "Backend API con Clean Architecture - Funcionando correctamente",
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
  private setupAuthRoutes(): void {
    this.app.post(
      "/api/auth/login",
      this.authController.login.bind(this.authController)
    );
    this.app.post(
      "/api/auth/register",
      this.authController.register.bind(this.authController)
    );
    this.app.post(
      "/api/auth/logout",
      this.authController.logout.bind(this.authController)
    );
    this.app.get(
      "/api/auth/profile",
      this.authController.getProfile.bind(this.authController)
    );
    this.app.put(
      "/api/auth/profile",
      this.authController.updateProfile.bind(this.authController)
    );
    this.app.post(
      "/api/auth/change-password",
      this.authController.changePassword.bind(this.authController)
    );
    this.app.post(
      "/api/auth/forgot-password",
      this.authController.forgotPassword.bind(this.authController)
    );
    this.app.post(
      "/api/auth/reset-password",
      this.authController.resetPassword.bind(this.authController)
    );
    this.app.post(
      "/api/auth/verify-email",
      this.authController.verifyEmail.bind(this.authController)
    );
    this.app.post(
      "/api/auth/resend-verification",
      this.authController.resendVerification.bind(this.authController)
    );
    this.app.post(
      "/api/auth/refresh-token",
      this.authController.refreshToken.bind(this.authController)
    );
  }

  /**
   * Configurar rutas de usuarios
   */
  private setupUserRoutes(): void {
    this.app.get(
      "/api/users",
      this.userController.getAllUsers.bind(this.userController)
    );
    this.app.get(
      "/api/users/profile",
      validateJWT,
      this.userController.getUserProfile.bind(this.userController)
    );
    this.app.put(
      "/api/users/profile",
      validateJWT,
      this.userController.updateUserProfile.bind(this.userController)
    );
  }

  /**
   * Configurar rutas de cursos
   */
  private setupCourseRoutes(): void {
    this.app.get(
      "/api/courses",
      this.courseController.getCourses.bind(this.courseController)
    );
    this.app.get(
      "/api/courses/:id",
      this.courseController.getCourseById.bind(this.courseController)
    );
    this.app.post(
      "/api/courses",
      this.courseController.createCourse.bind(this.courseController)
    );
    this.app.put(
      "/api/courses/:id",
      this.courseController.updateCourse.bind(this.courseController)
    );
    this.app.delete(
      "/api/courses/:id",
      this.courseController.deleteCourse.bind(this.courseController)
    );
    this.app.post(
      "/api/courses/:id/enroll",
      this.courseController.enrollToCourse.bind(this.courseController)
    );
    this.app.get(
      "/api/courses/:id/enrollments",
      this.courseController.getCourseEnrollments.bind(this.courseController)
    );
    this.app.get(
      "/api/courses/available",
      this.courseController.getAvailableCourses.bind(this.courseController)
    );
    this.app.get(
      "/api/courses/my-courses",
      this.courseController.getUserCourses.bind(this.courseController)
    );
  }

  /**
   * Configurar rutas de eventos
   */
  private setupEventRoutes(): void {
    this.app.get(
      "/api/events",
      this.eventController.getEvents.bind(this.eventController)
    );
    this.app.get(
      "/api/events/:id",
      this.eventController.getEventById.bind(this.eventController)
    );
    this.app.post(
      "/api/events",
      this.eventController.createEvent.bind(this.eventController)
    );
    this.app.put(
      "/api/events/:id",
      this.eventController.updateEvent.bind(this.eventController)
    );
    this.app.delete(
      "/api/events/:id",
      this.eventController.deleteEvent.bind(this.eventController)
    );
    this.app.post(
      "/api/events/:id/enroll",
      this.eventController.enrollToEvent.bind(this.eventController)
    );
    this.app.get(
      "/api/events/:id/enrollments",
      this.eventController.getEventEnrollments.bind(this.eventController)
    );
    this.app.get(
      "/api/events/upcoming",
      this.eventController.getUpcomingEvents.bind(this.eventController)
    );
    this.app.get(
      "/api/events/my-events",
      this.eventController.getUserEvents.bind(this.eventController)
    );
    this.app.get(
      "/api/events/by-area/:area",
      this.eventController.getEventsByArea.bind(this.eventController)
    );
  }

  /**
   * Configurar rutas de certificados
   */
  private setupCertificateRoutes(): void {
    this.app.get(
      "/api/certificates",
      this.certificateController.getCertificates.bind(
        this.certificateController
      )
    );
    this.app.get(
      "/api/certificates/:id",
      this.certificateController.getCertificateById.bind(
        this.certificateController
      )
    );
    this.app.post(
      "/api/certificates/generate",
      this.certificateController.generateCertificate.bind(
        this.certificateController
      )
    );
    this.app.put(
      "/api/certificates/:id/approve",
      this.certificateController.approveCertificate.bind(
        this.certificateController
      )
    );
    this.app.get(
      "/api/certificates/:id/download",
      this.certificateController.downloadCertificate.bind(
        this.certificateController
      )
    );
    this.app.get(
      "/api/certificates/my-certificates",
      this.certificateController.getUserCertificates.bind(
        this.certificateController
      )
    );
    this.app.get(
      "/api/certificates/statistics",
      this.certificateController.getCertificateStatistics.bind(
        this.certificateController
      )
    );
    this.app.get(
      "/api/certificates/pending",
      this.certificateController.getPendingCertificates.bind(
        this.certificateController
      )
    );
    this.app.post(
      "/api/certificates/bulk-approve",
      this.certificateController.bulkApproveCertificates.bind(
        this.certificateController
      )
    );
  }

  /**
   * Configurar manejo de errores
   */
  private setupErrorHandling(): void {
    // Handler para rutas no encontradas (404)
    this.app.use(notFoundHandler);

    // Handler global de errores
    this.app.use(globalErrorHandler);
  }

  /**
   * Iniciar el servidor
   */
  public async start(): Promise<void> {
    try {
      // El DIContainer se inicializa automáticamente al ser creado

      return new Promise<void>((resolve, reject) => {
        const server = this.app.listen(this.port, () => {
          console.log("🚀 ========================================");
          console.log(`🚀 Servidor iniciado exitosamente`);
          console.log(`🚀 Puerto: ${this.port}`);
          console.log(`🚀 Ambiente: ${process.env.NODE_ENV || "development"}`);
          console.log(`🚀 Health Check: http://localhost:${this.port}/health`);
          console.log(`🚀 API Base: http://localhost:${this.port}/api`);
          console.log("🚀 ========================================");
          console.log("🏗️  Clean Architecture Structure:");
          console.log(
            "   📁 Presentation Layer: Controllers, Routes, Middlewares"
          );
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
    } catch (error) {
      console.error("❌ Error al iniciar el servidor:", error);
      process.exit(1);
    }
  }

  /**
   * Detener el servidor gracefully
   */
  public async stop(): Promise<void> {
    console.log("⏹️  Deteniendo servidor...");
    // Aquí puedes agregar lógica para cerrar conexiones de base de datos, etc.
    process.exit(0);
  }

  /**
   * Obtener la aplicación Express (útil para testing)
   */
  public getApp(): Application {
    return this.app;
  }

  /**
   * Obtener los controladores (reemplaza el contenedor por ahora)
   */
  public getControllers() {
    return {
      auth: this.authController,
      user: this.userController,
      course: this.courseController,
      event: this.eventController,
      certificate: this.certificateController,
    };
  }
}

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
