import { PasswordRecoveryService } from "../../domain/services/PasswordRecoveryService";
export interface RequestPasswordResetDto {
    email: string;
}
export declare class RequestPasswordResetUseCase {
    private passwordRecoveryService;
    constructor(passwordRecoveryService: PasswordRecoveryService);
    execute(dto: RequestPasswordResetDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=RequestPasswordResetUseCase.d.ts.map