import { IUserRepository } from "../repositories/IUserRepository";
import { IVerificationTokenRepository } from "../repositories/IVerificationTokenRepository";
import { IEmailService } from "../repositories/IEmailService";
export declare class VerificationService {
    private userRepository;
    private tokenRepository;
    private emailService;
    constructor(userRepository: IUserRepository, tokenRepository: IVerificationTokenRepository, emailService: IEmailService);
    sendEmailVerification(userId: number): Promise<boolean>;
    verifyEmail(token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private generateSecureToken;
}
//# sourceMappingURL=VerificationService.d.ts.map