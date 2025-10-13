import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
export interface AuthenticatedRequest extends Request {
    usuario?: {
        id_usu: string;
        rol: string;
        ced_usu: string;
        cuentas: Array<{
            cor_cue: string;
            rol_cue: string;
        }>;
    };
    uid?: string;
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
     * GET /api/change-requests (Admin only)
     * Obtener todas las solicitudes (solo administradores)
     */
    getAllChangeRequests(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/change-requests/:id/status (Admin only)
     * Actualizar estado de solicitud
     */
    updateChangeRequestStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/solicitudes-cambio/:id/editar
     * Actualizar solicitud (solo BORRADOR)
     */
    updateChangeRequest(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/solicitudes-cambio/:id/enviar
     * Enviar solicitud (BORRADOR → PENDIENTE)
     */
    submitChangeRequest(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/solicitudes-cambio/:id/cancelar
     * Cancelar solicitud (solo BORRADOR)
     */
    cancelChangeRequest(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/solicitudes-cambio/mis-estadisticas
     * Obtener estadísticas del usuario
     */
    getMyStatistics(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/solicitudes-cambio/admin/desarrolladores
     * Obtener lista de desarrolladores disponibles (Admin/Master only)
     */
    getDevelopers(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/solicitudes-cambio/admin/estadisticas
     * Obtener estadísticas generales del sistema (Admin/Master only)
     */
    getAdminStatistics(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/solicitudes-cambio/admin/solicitud/:id
     * Obtener una solicitud específica para admin/master
     */
    getChangeRequestById(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/solicitudes-cambio/admin/:id/aprobar
     * Aprobar una solicitud de cambio (EN_REVISION → APROBADA)
     */
    approveChangeRequest(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/solicitudes-cambio/admin/:id/rechazar
     * Rechazar una solicitud de cambio (EN_REVISION → RECHAZADA)
     */
    rejectChangeRequest(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/solicitudes-cambio/admin/:id/actualizar
     * Actualizar solicitud con campos de admin/master
     */
    updateChangeRequestMaster(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=ChangeRequestController.d.ts.map