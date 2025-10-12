import { Request, Response } from "express";
export interface AuthenticatedRequest extends Request {
    usuario?: {
        id_usu: string;
        rol: string;
        ced_usu: string;
    };
}
export declare class DeveloperController {
    private container;
    constructor();
    /**
     * GET /api/developers
     * Obtener lista de desarrolladores disponibles
     */
    getAllDevelopers(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/developers/:id
     * Obtener un desarrollador por ID
     */
    getDeveloperById(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/developers/available
     * Obtener desarrolladores disponibles para asignación
     */
    getAvailableDevelopers(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/developers/statistics
     * Obtener estadísticas de desarrolladores
     */
    getDeveloperStatistics(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/developers/workload
     * Obtener estadísticas detalladas de carga de trabajo
     */
    getWorkloadStatistics(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/developers/recommended/:requestType
     * Obtener desarrolladores recomendados para un tipo de solicitud
     */
    getRecommendedDevelopers(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/developers/:id/github
     * Actualizar credenciales de GitHub de un desarrollador
     */
    updateGithubCredentials(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=DeveloperController.d.ts.map