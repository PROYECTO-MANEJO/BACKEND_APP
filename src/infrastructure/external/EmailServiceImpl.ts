import { IEmailService } from '../../domain/repositories/IEmailService';
import { sendRecoveryEmail, sendVerificationEmail, testEmailConnection } from './emailService';

export class EmailServiceImpl implements IEmailService {
  
  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    try {
      await sendVerificationEmail(email, token);
      return true;
    } catch (error) {
      console.error('[EmailServiceImpl] Error enviando email de verificación:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    try {
      await sendRecoveryEmail(email, token);
      return true;
    } catch (error) {
      console.error('[EmailServiceImpl] Error enviando email de recuperación:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      return await testEmailConnection();
    } catch (error) {
      console.error('[EmailServiceImpl] Error probando conexión de email:', error);
      return false;
    }
  }
}
