"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const express_1 = __importDefault(require("express"));
const DIContainer_1 = require("./infrastructure/config/DIContainer");
// Importar rutas
const authRoutes_1 = require("./presentation/routes/authRoutes");
const userRoutes_1 = require("./presentation/routes/userRoutes");
const courseRoutes_1 = require("./presentation/routes/courseRoutes");
const eventRoutes_1 = require("./presentation/routes/eventRoutes");
const certificateRoutes_1 = require("./presentation/routes/certificateRoutes");
// Importar middlewares
const securityMiddleware_1 = require("./presentation/middleware/securityMiddleware");
/**
 * Clase principal del servidor Express con Clean Architecture
 */
class Server {
    constructor(port = 3000) {
        this.port = port;
        this.app = (0, express_1.default)();
        this.container = DIContainer_1.DIContainer.getInstance();
        this.setupMiddlewares();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    /**
     * Configurar middlewares globales
     */
    setupMiddlewares() {
        // Middlewares de parsing
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true }));
        // Middlewares de seguridad
        const securityMiddlewares = (0, securityMiddleware_1.setupSecurityMiddlewares)();
        securityMiddlewares.forEach(middleware => {
            this.app.use(middleware);
        });
    }
    /**
     * Configurar rutas de la aplicación
     */
    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', securityMiddleware_1.healthCheck);
        this.app.get('/api/health', securityMiddleware_1.healthCheck);
        // Rutas principales de la API
        const authRoutes = new authRoutes_1.AuthRoutes(this.container);
        const userRoutes = new userRoutes_1.UserRoutes(this.container);
        const courseRoutes = new courseRoutes_1.CourseRoutes(this.container);
        const eventRoutes = new eventRoutes_1.EventRoutes(this.container);
        const certificateRoutes = new certificateRoutes_1.CertificateRoutes(this.container);
        // Registrar rutas con prefijo /api
        this.app.use('/api/auth', authRoutes.getRouter());
        this.app.use('/api/users', userRoutes.getRouter());
        this.app.use('/api/courses', courseRoutes.getRouter());
        this.app.use('/api/events', eventRoutes.getRouter());
        this.app.use('/api/certificates', certificateRoutes.getRouter());
        // Ruta raíz para verificar que el servidor está funcionando
        this.app.get('/', (req, res) => {
            res.json({
                message: 'Backend API con Clean Architecture - Funcionando correctamente',
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                endpoints: {
                    health: '/health',
                    auth: '/api/auth',
                    users: '/api/users',
                    courses: '/api/courses',
                    events: '/api/events',
                    certificates: '/api/certificates'
                }
            });
        });
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
            this.app.listen(this.port, () => {
                console.log('🚀 ========================================');
                console.log(`🚀 Servidor iniciado exitosamente`);
                console.log(`🚀 Puerto: ${this.port}`);
                console.log(`🚀 Ambiente: ${process.env.NODE_ENV || 'development'}`);
                console.log(`🚀 Health Check: http://localhost:${this.port}/health`);
                console.log(`🚀 API Base: http://localhost:${this.port}/api`);
                console.log('🚀 ========================================');
                console.log('🏗️  Clean Architecture Structure:');
                console.log('   📁 Presentation Layer: Controllers, Routes, Middlewares');
                console.log('   📁 Application Layer: Use Cases (Mock Implementation)');
                console.log('   📁 Domain Layer: Entities, Repositories (Interfaces)');
                console.log('   📁 Infrastructure Layer: Database, External Services');
                console.log('🚀 ========================================');
            });
        }
        catch (error) {
            console.error('❌ Error al iniciar el servidor:', error);
            process.exit(1);
        }
    }
    /**
     * Detener el servidor gracefully
     */
    async stop() {
        console.log('⏹️  Deteniendo servidor...');
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
     * Obtener el contenedor de dependencias
     */
    getContainer() {
        return this.container;
    }
}
exports.Server = Server;
// Manejo de señales del sistema para shutdown graceful
process.on('SIGTERM', async () => {
    console.log('📡 SIGTERM recibido, iniciando shutdown graceful...');
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('📡 SIGINT recibido, iniciando shutdown graceful...');
    process.exit(0);
});
// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});
