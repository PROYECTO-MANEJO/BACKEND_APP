import { Request, Response } from "express";
import { DIContainer } from "../../infrastructure/DIContainer";
interface AuthenticatedRequest extends Request {
    usuario?: {
        id_usu: string;
    };
    uid?: string;
    userRole?: string;
}
export declare class OrganizerController {
    private container;
    private organizerRepository;
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
    /**
     * GET /api/organizadores/:cedula
     * Obtener organizador por cédula
     */
    getOrganizadorByCedula(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/organizadores/:cedula
     * Actualizar organizador (Admin only)
     */
    updateOrganizador(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * DELETE /api/organizadores/:cedula
     * Eliminar organizador (Admin only)
     */
    deleteOrganizador(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=OrganizerController.d.ts.map