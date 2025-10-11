import { Request, Response } from "express";
export declare class VerificationController {
    private sendEmailVerificationUseCase;
    private verifyEmailUseCase;
    constructor();
    sendVerification: (req: Request, res: Response) => Promise<void>;
    verifyEmail: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=VerificationController.d.ts.map