import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
export declare class PasswordRecoveryController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * POST /api/password-recovery/forgot
     * Solicitar recuperación de contraseña
     */
    forgotPassword(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/password-recovery/reset
     * Restablecer la contraseña
     */
    resetPassword(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/password-recovery/verify-token
     * Verificar la validez del token
     */
    verifyResetToken(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=PasswordRecoveryController.d.ts.map