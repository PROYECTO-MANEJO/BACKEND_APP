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
export declare class HomepageController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * GET /api/homepage/content
     * Obtener contenido de la página principal
     */
    getContent(req: Request, res: Response): Promise<void>;
    /**
     * PUT /api/homepage/content
     * Actualizar contenido de la página principal
     */
    updateContent(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /api/homepage/image/:imageType
     * Subir imagen específica
     */
    uploadImage(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/homepage/image/:imageType
     * Obtener imagen específica
     */
    getImage(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/homepage/public-content
     * Obtener eventos y cursos para usuarios NO autenticados (Homepage sin login)
     */
    getPublicContent(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/homepage/student-content
     * Obtener eventos y cursos para ESTUDIANTES (por carrera + públicos)
     */
    getStudentContent(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/homepage/external-content
     * Obtener eventos y cursos para USUARIOS EXTERNOS (solo públicos)
     */
    getExternalContent(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=HomepageController.d.ts.map