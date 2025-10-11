import { PasswordRecoveryService } from "../../domain/services/PasswordRecoveryService";
export declare class ValidateResetTokenUseCase {
    private passwordRecoveryService;
    constructor(passwordRecoveryService: PasswordRecoveryService);
    execute(token: string): Promise<{
        success: boolean;
        message: string;
        userId?: number;
    }>;
}
//# sourceMappingURL=ValidateResetTokenUseCase.d.ts.map