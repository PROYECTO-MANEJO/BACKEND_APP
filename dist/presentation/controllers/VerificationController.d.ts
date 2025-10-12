import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
export declare class VerificationController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * POST /api/verification/send
     * Enviar token de verificación por email
     */
    sendVerification(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/verification/verify
     * Verificar email con token
     */
    verifyEmail(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/verification/resend
     * Reenviar token de verificación
     */
    resendVerification(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=VerificationController.d.ts.map