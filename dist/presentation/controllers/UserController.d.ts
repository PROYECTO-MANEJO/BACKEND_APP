import { Request, Response } from "express";
import { BaseController } from "./BaseController";
export declare class UserController extends BaseController {
    constructor();
    /**
     * GET /api/users
     * Obtener lista de usuarios con paginación
     */
    getUsers(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/users/:id
     * Obtener usuario por ID
     */
    getUserById(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/users
     * Crear nuevo usuario
     */
    createUser(req: Request, res: Response): Promise<void>;
    /**
     * PUT /api/users/:id
     * Actualizar usuario
     */
    updateUser(req: Request, res: Response): Promise<void>;
    /**
     * DELETE /api/users/:id
     * Eliminar usuario (soft delete)
     */
    deleteUser(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=UserController.d.ts.map