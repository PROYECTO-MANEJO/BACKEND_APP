import { PasswordRecoveryService } from "../../domain/services/PasswordRecoveryService";
export interface ResetPasswordDto {
    token: string;
    newPassword: string;
}
export declare class ResetPasswordUseCase {
    private passwordRecoveryService;
    constructor(passwordRecoveryService: PasswordRecoveryService);
    execute(dto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=ResetPasswordUseCase.d.ts.map