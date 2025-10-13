import { Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { AuthenticatedRequest } from "../middleware/adminMiddleware";
export declare class DocumentVerificationController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * GET /api/admin/documents/pending
     * Obtener usuarios con documentos pendientes de verificación (solo MASTER)
     */
    getPendingDocuments(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/admin/documents/download/:userId/:documentType
     * Descargar documento específico de un usuario (solo MASTER)
     */
    downloadUserDocument(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/admin/documents/approve/:userId/:documentType
     * Aprobar documento específico de un usuario (solo MASTER)
     */
    approveUserDocument(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/admin/documents/reject/:userId
     * Rechazar documentos de un usuario (solo MASTER)
     */
    rejectUserDocuments(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/admin/documents/stats
     * Obtener estadísticas de verificación de documentos
     */
    getDocumentStats(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=DocumentVerificationController.d.ts.map