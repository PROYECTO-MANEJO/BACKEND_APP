import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
export interface AuthenticatedRequest extends Request {
    usuario?: {
        id_usu: string;
        rol: string;
        ced_usu: string;
    };
}
export declare class CareerController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * GET /api/careers
     * Obtener todas las carreras
     */
    getAllCareers(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/careers/:id
     * Obtener una carrera por ID
     */
    getCareerById(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/careers
     * Crear una nueva carrera
     */
    createCareer(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/careers/:id
     * Actualizar una carrera
     */
    updateCareer(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * DELETE /api/careers/:id
     * Eliminar una carrera
     */
    deleteCareer(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/careers/:id/stats
     * Obtener estadísticas de una carrera (usuarios, eventos, cursos)
     */
    getCareerStats(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=CareerController.d.ts.map