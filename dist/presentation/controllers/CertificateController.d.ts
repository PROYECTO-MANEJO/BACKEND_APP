import { Request, Response } from "express";
import { BaseController } from "./BaseController";
/**
 * Controlador para gestión de certificados
 * Maneja todas las operaciones relacionadas con certificados
 */
export declare class CertificateController extends BaseController {
    constructor();
    /**
     * GET /api/certificates
     * Obtener lista de certificados con filtros
     */
    getCertificates(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/certificates/:id
     * Obtener certificado por ID
     */
    getCertificateById(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/certificates/generate
     * Generar nuevo certificado
     */
    generateCertificate(req: Request, res: Response): Promise<void>;
    /**
     * PUT /api/certificates/:id/approve
     * Aprobar certificado
     */
    approveCertificate(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/certificates/:id/download
     * Descargar certificado en PDF
     */
    downloadCertificate(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/certificates/my-certificates
     * Obtener certificados del usuario autenticado
     */
    getUserCertificates(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/certificates/statistics
     * Obtener estadísticas de certificados
     */
    getCertificateStatistics(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/certificates/pending
     * Obtener certificados pendientes de aprobación
     */
    getPendingCertificates(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/certificates/bulk-approve
     * Aprobar certificados en lote
     */
    bulkApproveCertificates(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=CertificateController.d.ts.map