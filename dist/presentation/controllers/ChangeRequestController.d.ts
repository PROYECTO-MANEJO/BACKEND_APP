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
export declare class ChangeRequestController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * POST /api/change-requests
     * Crear una nueva solicitud de cambio
     */
    createChangeRequest(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/change-requests/my-requests
     * Obtener solicitudes del usuario autenticado
     */
    getMyChangeRequests(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/change-requests/:id
     * Obtener solicitud por ID
     */
    getChangeRequestById(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/change-requests (Admin only)
     * Obtener todas las solicitudes (solo administradores)
     */
    getAllChangeRequests(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/change-requests/:id/status (Admin only)
     * Actualizar estado de solicitud
     */
    updateChangeRequestStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=ChangeRequestController.d.ts.map