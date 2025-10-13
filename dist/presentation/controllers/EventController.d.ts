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
 * Event Controller - Presentation Layer
 *
 * ✅ SRP: Responsabilidad única - Manejo de HTTP requests/responses para eventos
 * - Delega validaciones a EventValidator
 * - Delega lógica de negocio a EventService
 * - Delega transformaciones a EventDTOTransformer
 */
export declare class EventController extends BaseController {
    private eventService;
    constructor(container: DIContainer);
    /**
     * GET /api/events
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    getEvents(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/events/:id
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    getEventById(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/events
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    createEvent(req: Request, res: Response): Promise<void>;
    /**
     * PUT /api/events/:id
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    updateEvent(req: Request, res: Response): Promise<void>;
    /**
     * DELETE /api/events/:id
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    deleteEvent(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/events/:id/close
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    closeEvent(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/eventos (Admin)
     * ✅ SRP: Solo maneja HTTP request/response para admin, delega todo lo demás
     */
    getEventosAdmin(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/events/available
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    getAvailableEvents(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/events/my-events
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    getMyEvents(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=EventController.d.ts.map