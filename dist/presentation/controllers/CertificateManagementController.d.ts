import { Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { AuthenticatedRequest } from "../middleware/adminMiddleware";
export declare class CertificateManagementController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * GET /api/admin/certificates/events/:eventId/participants
     * Obtener participantes aprobados de un evento para generar certificados
     */
    getEventApprovedParticipants(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/admin/certificates/courses/:courseId/participants
     * Obtener participantes aprobados de un curso para generar certificados
     */
    getCourseApprovedParticipants(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /api/admin/certificates/events/generate-massive
     * Generar certificados masivamente para un evento
     */
    generateMassiveEventCertificates(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /api/admin/certificates/courses/generate-massive
     * Generar certificados masivamente para un curso
     */
    generateMassiveCourseCertificates(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/admin/certificates/regenerate/:type/:participationId
     * Regenerar certificado individual (admin)
     */
    regenerateCertificate(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/admin/certificates/stats
     * Obtener estadísticas de certificados
     */
    getCertificateStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Generar PDF de certificado de evento
     */
    private generateEventCertificatePDF;
    /**
     * Generar PDF de certificado de curso
     */
    private generateCourseCertificatePDF;
}
//# sourceMappingURL=CertificateManagementController.d.ts.map