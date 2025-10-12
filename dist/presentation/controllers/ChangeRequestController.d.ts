import { Request, Response } from "express";
export interface AuthenticatedRequest extends Request {
    usuario?: {
        id_usu: string;
        rol: string;
        ced_usu: string;
    };
}
export declare class ChangeRequestController {
    private container;
    constructor();
    /**
     * POST /api/solicitudes-cambio
     * Crear una nueva solicitud de cambio
     */
    createChangeRequest(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/solicitudes-cambio/:id
     * Obtener una solicitud de cambio por ID
     */
    getChangeRequestById(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/solicitudes-cambio/mis-solicitudes
     * Obtener las solicitudes del usuario autenticado
     */
    getMyChangeRequests(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/solicitudes-cambio
     * Obtener todas las solicitudes con filtros (solo admin/master)
     */
    getAllChangeRequests(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/solicitudes-cambio/:id/estado
     * Actualizar el estado de una solicitud
     */
    updateChangeRequestStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/solicitudes-cambio/:id/asignar-desarrollador
     * Asignar un desarrollador a una solicitud
     */
    assignDeveloper(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/solicitudes-cambio/estadisticas
     * Obtener estadísticas de solicitudes de cambio
     */
    getStatistics(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=ChangeRequestController.d.ts.map