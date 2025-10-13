import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
export interface AuthenticatedRequest extends Request {
    usuario?: {
        id_usu: string;
        rol: string;
        ced_usu: string;
    };
    uid?: string;
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
    /**
     * POST /api/inscripciones
     * Inscribir usuario a un evento con archivo (LEGACY)
     */
    enrollInEventWithFile(req: any, res: Response): Promise<void>;
    /**
     * POST /api/inscripcionesCursos
     * Inscribir usuario a un curso con archivo (LEGACY)
     */
    enrollInCourseWithFile(req: any, res: Response): Promise<void>;
    /**
     * GET /api/inscripciones/evento/comprobante/:inscripcionId
     * Obtener comprobante de pago de evento (LEGACY)
     */
    getEventPaymentReceipt(req: any, res: Response): Promise<void>;
    /**
     * GET /api/inscripcionesCursos/curso/comprobante/:inscripcionId
     * Obtener comprobante de pago de curso (LEGACY)
     */
    getCoursePaymentReceipt(req: any, res: Response): Promise<void>;
}
//# sourceMappingURL=InscriptionController.d.ts.map