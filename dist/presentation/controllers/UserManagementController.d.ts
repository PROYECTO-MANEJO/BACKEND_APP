import { Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { AuthenticatedRequest } from "../middleware/adminMiddleware";
export declare class UserManagementController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * GET /api/admin/users
     * Obtener todos los usuarios con paginación y filtros
     */
    getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/admin/users/:cedula
     * Obtener usuario específico por cédula
     */
    getUserByCedula(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /api/admin/users
     * Crear nuevo usuario (solo MASTER)
     */
    createUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/admin/users/:cedula
     * Actualizar usuario existente (solo MASTER)
     */
    updateUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * DELETE /api/admin/users/:cedula
     * Eliminar usuario (soft delete - solo MASTER)
     */
    deleteUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/admin/users/stats
     * Obtener estadísticas de usuarios
     */
    getUserStats(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=UserManagementController.d.ts.map