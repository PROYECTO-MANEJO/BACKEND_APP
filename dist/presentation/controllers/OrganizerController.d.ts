import { Request, Response } from 'express';
import { DIContainer } from '../../infrastructure/DIContainer';
interface AuthenticatedRequest extends Request {
    usuario?: {
        id_usu: string;
    };
    uid?: string;
    userRole?: string;
}
export declare class OrganizerController {
    private container;
    constructor(container: DIContainer);
    /**
     * GET /api/organizadores
     * Obtener todos los organizadores
     */
    getOrganizadores(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /api/organizadores
     * Crear nuevo organizador (Admin only)
     */
    createOrganizador(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=OrganizerController.d.ts.map