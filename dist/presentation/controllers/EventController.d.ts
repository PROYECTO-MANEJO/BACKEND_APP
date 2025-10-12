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
}
//# sourceMappingURL=EventController.d.ts.map