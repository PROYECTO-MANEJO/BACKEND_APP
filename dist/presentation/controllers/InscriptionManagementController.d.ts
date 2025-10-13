import { Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { AuthenticatedRequest } from "../middleware/adminMiddleware";
export declare class InscriptionManagementController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * GET /api/admin/inscriptions/events/pending
     * Obtener inscripciones de eventos pendientes de aprobación
     */
    getPendingEventInscriptions(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/admin/inscriptions/courses/pending
     * Obtener inscripciones de cursos pendientes de aprobación
     */
    getPendingCourseInscriptions(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/admin/inscriptions/events/:id/approve
     * Aprobar inscripción de evento
     */
    approveEventInscription(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/admin/inscriptions/courses/:id/approve
     * Aprobar inscripción de curso
     */
    approveCourseInscription(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/admin/inscriptions/events/:id/reject
     * Rechazar inscripción de evento
     */
    rejectEventInscription(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/admin/inscriptions/courses/:id/reject
     * Rechazar inscripción de curso
     */
    rejectCourseInscription(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/admin/inscriptions/events/:id/receipt
     * Descargar comprobante de pago de evento
     */
    downloadEventReceipt(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/admin/inscriptions/courses/:id/receipt
     * Descargar comprobante de pago de curso
     */
    downloadCourseReceipt(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/admin/inscriptions/stats
     * Obtener estadísticas de inscripciones
     */
    getInscriptionStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/administracion/cursos-eventos
     * Obtener todos los cursos y eventos administrables (que no han terminado)
     * Incluye estadísticas de inscripciones para cada uno
     */
    getCoursesAndEventsForManagement(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/administracion/evento/:idEvento
     * Obtener detalles completos de un evento con inscripciones
     */
    getEventDetailsForAdmin(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/administracion/curso/:idCurso
     * Obtener detalles completos de un curso con inscripciones
     */
    getCourseDetailsForAdmin(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=InscriptionManagementController.d.ts.map