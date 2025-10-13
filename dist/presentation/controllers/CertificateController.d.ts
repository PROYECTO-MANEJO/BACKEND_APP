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
/**
 * Controlador para gestión de certificados
 * Maneja todas las operaciones relacionadas con certificados
 */
export declare class CertificateController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * GET /api/certificates/my-certificates
     * Obtener certificados del usuario autenticado
     */
    getUserCertificates(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/certificates/download/:tipo/:idParticipacion
     * Descargar certificado en PDF
     */
    downloadCertificate(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/certificates/participaciones-terminadas
     * Obtener participaciones terminadas (para generar certificados)
     */
    getCompletedParticipations(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /api/certificates/generar-evento/:idParticipacion
     * Generar certificado de evento por ID de participación
     */
    generateEventCertificate(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /api/certificates/generar-curso/:idParticipacion
     * Generar certificado de curso por ID de participación
     */
    generateCourseCertificate(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Generar PDF del certificado de evento
     */
    private generateEventCertificatePDF;
    /**
     * Generar PDF del certificado de curso
     */
    private generateCourseCertificatePDF;
}
//# sourceMappingURL=CertificateController.d.ts.map