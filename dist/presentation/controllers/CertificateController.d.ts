import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
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
    getUserCertificates(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/certificates/download/:tipo/:idParticipacion
     * Descargar certificado en PDF
     */
    downloadCertificate(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=CertificateController.d.ts.map