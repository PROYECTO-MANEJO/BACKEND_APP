import { Request, Response } from "express";
export declare class PasswordRecoveryController {
    private requestPasswordResetUseCase;
    private validateResetTokenUseCase;
    private resetPasswordUseCase;
    constructor();
    forgotPassword: (req: Request, res: Response) => Promise<void>;
    validateToken: (req: Request, res: Response) => Promise<void>;
    resetPassword: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=PasswordRecoveryController.d.ts.map