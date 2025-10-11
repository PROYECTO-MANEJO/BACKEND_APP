import { IEmailService } from "@domain/repositories/IEmailService";
export declare class EmailService implements IEmailService {
    private transporter;
    constructor();
    private createTransporter;
    sendVerificationEmail(email: string, token: string): Promise<boolean>;
    sendPasswordResetEmail(email: string, token: string): Promise<boolean>;
}
//# sourceMappingURL=EmailService.d.ts.map