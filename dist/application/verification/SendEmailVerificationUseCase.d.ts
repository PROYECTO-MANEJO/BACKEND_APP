import { VerificationService } from "../../domain/services/VerificationService";
export declare class SendEmailVerificationUseCase {
    private verificationService;
    constructor(verificationService: VerificationService);
    execute(userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=SendEmailVerificationUseCase.d.ts.map