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
export declare class InscriptionController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * POST /api/inscriptions/events
     * Inscribir usuario a un evento
     */
    enrollInEvent(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /api/inscriptions/courses
     * Inscribir usuario a un curso
     */
    enrollInCourse(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/inscriptions/my-events
     * Obtener inscripciones de eventos del usuario
     */
    getMyEventInscriptions(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/inscriptions/my-courses
     * Obtener inscripciones de cursos del usuario
     */
    getMyCourseInscriptions(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=InscriptionController.d.ts.map