import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { DIContainer } from '../../infrastructure/config/DIContainer';
/**
 * Controlador para gestión de eventos
 * Maneja todas las operaciones CRUD y funcionalidades relacionadas con eventos
 */
export declare class EventController extends BaseController {
    constructor(container: DIContainer);
    /**
     * GET /api/events
     * Obtener lista de eventos con filtros
     */
    getEvents(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/events/:id
     * Obtener evento por ID
     */
    getEventById(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/events
     * Crear nuevo evento
     */
    createEvent(req: Request, res: Response): Promise<void>;
    /**
     * PUT /api/events/:id
     * Actualizar evento
     */
    updateEvent(req: Request, res: Response): Promise<void>;
    /**
     * DELETE /api/events/:id
     * Eliminar evento
     */
    deleteEvent(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/events/:id/enroll
     * Inscribirse a un evento
     */
    enrollToEvent(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/events/:id/enrollments
     * Obtener inscripciones de un evento (solo para administradores/organizadores)
     */
    getEventEnrollments(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/events/upcoming
     * Obtener eventos próximos
     */
    getUpcomingEvents(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/events/my-events
     * Obtener eventos del usuario autenticado
     */
    getUserEvents(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/events/by-area
     * Obtener eventos por área
     */
    getEventsByArea(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=EventController.d.ts.map