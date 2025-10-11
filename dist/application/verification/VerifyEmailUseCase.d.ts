import { VerificationService } from "../../domain/services/VerificationService";
export declare class VerifyEmailUseCase {
    private verificationService;
    constructor(verificationService: VerificationService);
    execute(token: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=VerifyEmailUseCase.d.ts.map