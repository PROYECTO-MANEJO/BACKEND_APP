import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
export interface AuthenticatedRequest extends Request {
    usuario?: {
        id_usu: string;
        rol: string;
        ced_usu: string;
    };
}
export declare class ParticipationController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * GET /api/participations/courses/:courseId
     * Obtener participaciones de un curso (para gestión de notas/asistencia)
     */
    getCourseParticipations(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/participations/events/:eventId
     * Obtener participaciones de un evento
     */
    getEventParticipations(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/participations/courses/:courseId/participants/:userId
     * Actualizar participación de un usuario en un curso
     */
    updateCourseParticipation(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/participations/events/:eventId/participants/:userId
     * Actualizar participación de un usuario en un evento
     */
    updateEventParticipation(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=ParticipationController.d.ts.map