export interface AuthenticatedRequest extends Request {
    usuario?: {
        id_usu: string;
        rol: string;
        ced_usu: string;
    };
    uid?: string;
}
import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
/**
 * Controlador para gestión de eventos
 * Maneja todas las operaciones CRUD y funcionalidades relacionadas con eventos
 */
export declare class EventController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * GET /api/events
     * Get all events (based on original obtenerEventos function)
     */
    getEvents(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/events/:id
     * Get event by ID (based on original obtenerEventoPorId function)
     */
    getEventById(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/events
     * Create new event (based on original crearEvento function)
     */
    createEvent(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/eventos (Legacy route for frontend compatibility)
     * Get all events with admin details
     */
    getEventosAdmin(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/eventos/:id
     * Update existing event (Admin only)
     */
    updateEvent(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * DELETE /api/eventos/:id
     * Delete event (Admin only)
     */
    deleteEvent(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/eventos/:id/cerrar
     * Close event (Admin only)
     */
    closeEvent(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=EventController.d.ts.map