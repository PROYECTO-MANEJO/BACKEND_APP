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
export declare class DeveloperController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * GET /api/developers
     * Obtener lista de desarrolladores disponibles
     */
    getAllDevelopers(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/developers/:developerId/assigned-requests
     * Obtener solicitudes asignadas a un desarrollador específico
     */
    getAssignedRequests(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/developers/requests/:requestId/status
     * Actualizar estado de solicitud (solo desarrollador asignado)
     */
    updateRequestStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/developers/workload-stats
     * Obtener estadísticas de carga de trabajo de desarrolladores
     */
    getWorkloadStats(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=DeveloperController.d.ts.map