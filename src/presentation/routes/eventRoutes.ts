import { Router } from 'express';
import { DIContainer } from '../../infrastructure/config/DIContainer';
import { EventController } from '../controllers/EventController';
import {
  authenticateToken,
  authorize,
  optionalAuth
} from '../middleware/authMiddleware';
import {
  handleValidationErrors,
  validateEventCreation,
  validatePagination,
  validateIdParam
} from '../middleware/validationMiddleware';

export class EventRoutes {
  private router: Router;
  private eventController: EventController;

  constructor(container: DIContainer) {
    this.router = Router();
    this.eventController = new EventController(container);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    /**
     * GET /api/events
     * Obtener lista de eventos (público con paginación)
     */
    this.router.get(
      '/',
      optionalAuth,
      validatePagination,
      handleValidationErrors,
      this.eventController.getEvents.bind(this.eventController)
    );

    /**
     * GET /api/events/upcoming
     * Obtener eventos próximos (público)
     */
    this.router.get(
      '/upcoming',
      optionalAuth,
      validatePagination,
      handleValidationErrors,
      this.eventController.getUpcomingEvents.bind(this.eventController)
    );

    /**
     * GET /api/events/my-events
     * Obtener mis eventos inscritos
     */
    this.router.get(
      '/my-events',
      authenticateToken,
      validatePagination,
      handleValidationErrors,
      this.eventController.getMyEvents.bind(this.eventController)
    );

    /**
     * GET /api/events/by-area/:area
     * Obtener eventos por área (público)
     */
    this.router.get(
      '/by-area/:area',
      optionalAuth,
      validatePagination,
      handleValidationErrors,
      this.eventController.getEventsByArea.bind(this.eventController)
    );

    /**
     * GET /api/events/:id
     * Obtener evento por ID (público)
     */
    this.router.get(
      '/:id',
      validateIdParam,
      handleValidationErrors,
      this.eventController.getEventById.bind(this.eventController)
    );

    /**
     * POST /api/events
     * Crear nuevo evento (solo organizadores y administradores)
     */
    this.router.post(
      '/',
      authenticateToken,
      authorize('organizador', 'administrador'),
      validateEventCreation,
      handleValidationErrors,
      this.eventController.createEvent.bind(this.eventController)
    );

    /**
     * PUT /api/events/:id
     * Actualizar evento (solo organizadores y administradores)
     */
    this.router.put(
      '/:id',
      authenticateToken,
      authorize('organizador', 'administrador'),
      validateIdParam,
      handleValidationErrors,
      this.eventController.updateEvent.bind(this.eventController)
    );

    /**
     * DELETE /api/events/:id
     * Eliminar evento (solo administradores)
     */
    this.router.delete(
      '/:id',
      authenticateToken,
      authorize('administrador'),
      validateIdParam,
      handleValidationErrors,
      this.eventController.deleteEvent.bind(this.eventController)
    );

    /**
     * POST /api/events/:id/enroll
     * Inscribirse a un evento
     */
    this.router.post(
      '/:id/enroll',
      authenticateToken,
      validateIdParam,
      handleValidationErrors,
      this.eventController.enrollToEvent.bind(this.eventController)
    );

    /**
     * GET /api/events/:id/enrollments
     * Obtener inscripciones de un evento (solo organizadores y administradores)
     */
    this.router.get(
      '/:id/enrollments',
      authenticateToken,
      authorize('organizador', 'administrador'),
      validateIdParam,
      validatePagination,
      handleValidationErrors,
      this.eventController.getEventEnrollments.bind(this.eventController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}