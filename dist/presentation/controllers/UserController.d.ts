import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
export declare class UserController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * GET /api/users/profile
     * Get current user profile (based on JWT token)
     */
    getUserProfile(req: Request, res: Response): Promise<void>;
    /**
     * PUT /api/users/profile
     * Update current user profile
     */
    updateUserProfile(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/users
     * Get all users for admin (based on original getAllUsers function)
     */
    getAllUsers(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/users/admins
     * Get only administrators for master admin management
     */
    getAdmins(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=UserController.d.ts.map