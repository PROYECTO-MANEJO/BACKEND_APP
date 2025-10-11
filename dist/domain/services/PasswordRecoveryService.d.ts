import { IUserRepository } from "../repositories/IUserRepository";
import { IVerificationTokenRepository } from "../repositories/IVerificationTokenRepository";
import { IEmailService } from "../repositories/IEmailService";
export declare class PasswordRecoveryService {
    private userRepository;
    private tokenRepository;
    private emailService;
    constructor(userRepository: IUserRepository, tokenRepository: IVerificationTokenRepository, emailService: IEmailService);
    requestPasswordReset(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    validateResetToken(token: string): Promise<{
        success: boolean;
        message: string;
        userId?: number;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private generateSecureToken;
}
//# sourceMappingURL=PasswordRecoveryService.d.ts.map