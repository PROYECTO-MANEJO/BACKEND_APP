import { Request, Response } from 'express';
import { DIContainer } from '../../infrastructure/DIContainer';
interface AuthenticatedRequest extends Request {
    usuario?: {
        id_usu: string;
    };
    uid?: string;
    userRole?: string;
}
export declare class AdminController {
    private container;
    constructor(container: DIContainer);
    /**
     * GET /api/admin/dashboard
     * Obtener estadísticas del dashboard administrativo
     */
    getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/admin/recent-activity
     * Obtener actividad reciente para el dashboard
     */
    getRecentActivity(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/admin/pending-approvals
     * Obtener elementos pendientes de aprobación
     */
    getPendingApprovals(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=AdminController.d.ts.map