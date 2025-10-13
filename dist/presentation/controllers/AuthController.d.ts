import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
export declare class AuthController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * POST /api/auth/login
     * User login - CLEAN ARCHITECTURE implementation
     */
    login(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/auth/register
     * Register new user - CLEAN ARCHITECTURE implementation
     */
    register(req: Request, res: Response): Promise<void>;
    /**
     * Simple implementations for other auth methods
     */
    logout(req: Request, res: Response): Promise<void>;
    getProfile(req: Request, res: Response): Promise<void>;
    updateProfile(req: Request, res: Response): Promise<void>;
    changePassword(req: Request, res: Response): Promise<void>;
    forgotPassword(req: Request, res: Response): Promise<void>;
    resetPassword(req: Request, res: Response): Promise<void>;
    verifyEmail(req: Request, res: Response): Promise<void>;
    resendVerification(req: Request, res: Response): Promise<void>;
    refreshToken(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/auth/createAdmin
     * Create new administrator (Master only)
     */
    createAdmin(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map