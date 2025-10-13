import { Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { AuthenticatedRequest } from "../middleware/studentMiddleware";
export declare class StudentDocumentController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * POST /api/student/documents/upload
     * Subir documentos de estudiante (cédula y/o matrícula)
     */
    uploadStudentDocuments(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/student/documents/status
     * Obtener estado de verificación de documentos del estudiante
     */
    getDocumentStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/student/documents/download/:type
     * Descargar documento específico (cedula o matricula)
     */
    downloadDocument(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/student/documents/update/:type
     * Actualizar documento específico (cedula o matricula)
     */
    updateDocument(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/student/documents/history
     * Obtener historial de verificaciones de documentos
     */
    getVerificationHistory(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/student/documents/requirements
     * Obtener requisitos específicos para estudiantes
     */
    getDocumentRequirements(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=StudentDocumentController.d.ts.map