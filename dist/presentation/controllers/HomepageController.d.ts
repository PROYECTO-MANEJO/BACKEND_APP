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
    private homepageRepository;
    private homepageService;
    constructor(container: DIContainer);
    /**
     * GET /api/homepage/content
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    getContent(req: Request, res: Response): Promise<void>;
    /**
     * PUT /api/homepage/content
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    updateContent(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /api/homepage/image/:imageType
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    uploadImage(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/homepage/image/:imageType
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    getImage(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/homepage/public-content
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    getPublicContent(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/homepage/student-content
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    getStudentContent(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/homepage/external-content
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    getExternalContent(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=HomepageController.d.ts.map