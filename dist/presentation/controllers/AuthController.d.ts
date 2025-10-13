import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
/**
 * Auth Controller - Presentation Layer
 *
 * ✅ SRP: Responsabilidad única - Manejo de HTTP requests/responses para autenticación
 * - Delega validaciones a AuthValidator
 * - Delega lógica de negocio a AuthService
 * - Delega transformaciones a AuthDTOTransformer
 */
export declare class AuthController extends BaseController {
    private authService;
    private container;
    constructor(container: DIContainer);
    /**
     * POST /api/auth/login
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    login(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/auth/register
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
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
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    createAdmin(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map