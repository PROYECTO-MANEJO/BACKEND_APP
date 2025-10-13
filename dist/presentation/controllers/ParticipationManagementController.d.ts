import { Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { AuthenticatedRequest } from "../middleware/adminMiddleware";
export declare class ParticipationManagementController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * GET /api/admin/participations/events/:eventId/inscriptions
     * Obtener inscripciones de un evento para registrar participación
     */
    getEventInscriptionsForParticipation(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/admin/participations/courses/:courseId/inscriptions
     * Obtener inscripciones de un curso para registrar participación
     */
    getCourseInscriptionsForParticipation(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /api/admin/participations/events/:eventId/register
     * Registrar participación en evento (solo asistencia)
     */
    registerEventParticipation(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /api/admin/participations/courses/:courseId/register
     * Registrar participación en curso (asistencia y calificación)
     */
    registerCourseParticipation(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/admin/participations/events/:eventId/stats
     * Obtener estadísticas de participación de un evento
     */
    getEventParticipationStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/admin/participations/courses/:courseId/stats
     * Obtener estadísticas de participación de un curso
     */
    getCourseParticipationStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/admin/participations/general-stats
     * Obtener estadísticas generales de participaciones
     */
    getGeneralParticipationStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/participaciones/cursos/:idCurso
     * Obtener participaciones de un curso específico
     */
    getCourseParticipations(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/participaciones/cursos/:idCurso/inscripcion/:idInscripcion
     * Actualizar participación de curso (nota y asistencia)
     */
    updateCourseParticipation(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/participaciones/eventos/:idEvento
     * Obtener participaciones de un evento específico
     */
    getEventParticipations(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/participaciones/eventos/:idEvento/inscripcion/:idInscripcion
     * Actualizar participación de evento (solo asistencia)
     */
    updateEventParticipation(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=ParticipationManagementController.d.ts.map