import { IEmailService } from '../../domain/repositories/IEmailService';
export declare class EmailServiceImpl implements IEmailService {
    sendVerificationEmail(email: string, token: string): Promise<boolean>;
    sendPasswordResetEmail(email: string, token: string): Promise<boolean>;
    testConnection(): Promise<boolean>;
}
//# sourceMappingURL=EmailServiceImpl.d.ts.map