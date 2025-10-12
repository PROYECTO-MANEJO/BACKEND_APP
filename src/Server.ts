import express, { Application } from "express";
// Import DIContainer for dependency injection
import { DIContainer } from "./infrastructure/DIContainer";
// Import controllers
import { AuthController } from "./presentation/controllers/AuthController";
import { UserController } from "./presentation/controllers/UserController";
import { CourseController } from "./presentation/controllers/CourseController";
import { EventController } from "./presentation/controllers/EventController";
import { CertificateController } from "./presentation/controllers/CertificateController";
import { HomepageController } from "./presentation/controllers/HomepageController";

// Importar rutas
import { AuthRoutes } from "./presentation/routes/authRoutes";
import { UserRoutes } from "./presentation/routes/userRoutes";

// Importar middlewares
import {
  notFoundHandler,
  globalErrorHandler,
  healthCheck,
} from "./presentation/middleware/securityMiddleware";
import { validateJWT } from "./presentation/middleware/jwtMiddleware";
import multer from "multer";

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
  private homepageController: HomepageController;

  constructor(port: number = 3000) {
    this.port = port;
    this.app = express();
    
    // Initialize dependency injection container
    this.container = DIContainer.getInstance();

    // Initialize controllers with dependency injection
    this.authController = new AuthController(this.container);
    this.userController = new UserController(this.container);
    this.courseController = new CourseController(this.container);
    this.eventController = new EventController(this.container);
    this.certificateController = new CertificateController(this.container);
    this.homepageController = new HomepageController(this.container);

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
    this.setupHomepageRoutes();

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
  }

  /**
   * Configurar rutas de certificados
   */
  private setupCertificateRoutes(): void {
    // GET /api/certificates/my-certificates - Obtener certificados del usuario
    this.app.get(
      "/api/certificates/my-certificates",
      validateJWT, // Requiere autenticación
      this.certificateController.getUserCertificates.bind(this.certificateController)
    );

    // GET /api/certificates/download/:tipo/:idParticipacion - Descargar certificado
    this.app.get(
      "/api/certificates/download/:tipo/:idParticipacion",
      validateJWT, // Requiere autenticación
      this.certificateController.downloadCertificate.bind(this.certificateController)
    );
  }

  /**
   * Configurar rutas de homepage (página principal)
   */
  private setupHomepageRoutes(): void {
    // Configuración de multer para imágenes
    const storage = multer.memoryStorage();
    const upload = multer({
      storage: storage,
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
      },
      fileFilter: (req, file, cb) => {
        // Verificar que sea una imagen
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten archivos de imagen') as any, false);
        }
      }
    });

    // RUTAS REFACTORIZADAS (NUEVAS)
    // GET /api/homepage/content - Obtener contenido
    this.app.get(
      "/api/homepage/content",
      this.homepageController.getContent.bind(this.homepageController)
    );

    // PUT /api/homepage/content - Actualizar contenido
    this.app.put(
      "/api/homepage/content",
      validateJWT,
      this.homepageController.updateContent.bind(this.homepageController)
    );

    // POST /api/homepage/image/:imageType - Subir imagen
    this.app.post(
      "/api/homepage/image/:imageType",
      validateJWT,
      upload.single('imagen'),
      this.homepageController.uploadImage.bind(this.homepageController)
    );

    // GET /api/homepage/image/:imageType - Obtener imagen
    this.app.get(
      "/api/homepage/image/:imageType",
      this.homepageController.getImage.bind(this.homepageController)
    );

    // GET /api/homepage/external-content - Para usuarios externos (solo públicos)
    this.app.get(
      "/api/homepage/external-content",
      this.homepageController.getExternalContent.bind(this.homepageController)
    );

    // RUTAS LEGACY (COMPATIBILIDAD CON FRONTEND)
    // GET /api/pagina-principal/contenido
    this.app.get(
      "/api/pagina-principal/contenido",
      this.homepageController.getContent.bind(this.homepageController)
    );

    // PUT /api/pagina-principal/contenido
    this.app.put(
      "/api/pagina-principal/contenido",
      validateJWT,
      this.homepageController.updateContent.bind(this.homepageController)
    );

    // POST /api/pagina-principal/imagen/:tipoImagen
    this.app.post(
      "/api/pagina-principal/imagen/:tipoImagen",
      validateJWT,
      upload.single('imagen'),
      this.homepageController.uploadImage.bind(this.homepageController)
    );

    // GET /api/pagina-principal/imagen/:tipoImagen
    this.app.get(
      "/api/pagina-principal/imagen/:tipoImagen",
      this.homepageController.getImage.bind(this.homepageController)
    );

    // GET /api/pagina-principal/eventos-cursos-disponibles (para usuarios normales)
    this.app.get(
      "/api/pagina-principal/eventos-cursos-disponibles",
      this.homepageController.getExternalContent.bind(this.homepageController)
    );

    // GET /api/pagina-principal/eventos-cursos-publicos (para usuarios no autenticados)
    this.app.get(
      "/api/pagina-principal/eventos-cursos-publicos",
      this.homepageController.getPublicContent.bind(this.homepageController)
    );

    // GET /api/pagina-principal/eventos-cursos-carrera (para estudiantes)
    this.app.get(
      "/api/pagina-principal/eventos-cursos-carrera",
      validateJWT,
      this.homepageController.getStudentContent.bind(this.homepageController)
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
