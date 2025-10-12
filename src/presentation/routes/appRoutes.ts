import { Router } from 'express';
import { DIContainer } from '../../infrastructure/config/DIContainer';
import { UserRoutes } from './userRoutes';
import { AuthRoutes } from './authRoutes';
import { CourseRoutes } from './courseRoutes';
import { EventRoutes } from './eventRoutes';
import { CertificateRoutes } from './certificateRoutes';

export class AppRoutes {
  private router: Router;
  private container: DIContainer;

  constructor(container: DIContainer) {
    this.router = Router();
    this.container = container;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Rutas de autenticación
    const authRoutes = new AuthRoutes(this.container);
    this.router.use('/auth', authRoutes.getRouter());

    // Rutas de usuarios
    const userRoutes = new UserRoutes(this.container);
    this.router.use('/users', userRoutes.getRouter());

    // Rutas de cursos
    const courseRoutes = new CourseRoutes(this.container);
    this.router.use('/courses', courseRoutes.getRouter());

    // Rutas de eventos
    const eventRoutes = new EventRoutes(this.container);
    this.router.use('/events', eventRoutes.getRouter());

    // Rutas de certificados
    const certificateRoutes = new CertificateRoutes(this.container);
    this.router.use('/certificates', certificateRoutes.getRouter());

    // Ruta de salud del sistema
    this.router.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // Ruta raíz de la API
    this.router.get('/', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'API Sistema de Gestión Académica',
        version: '1.0.0',
        endpoints: {
          auth: '/api/auth',
          users: '/api/users',
          courses: '/api/courses',
          events: '/api/events',
          certificates: '/api/certificates',
          health: '/api/health'
        }
      });
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}