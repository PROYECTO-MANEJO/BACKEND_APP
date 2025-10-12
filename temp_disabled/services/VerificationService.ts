import { IUserRepository } from "../repositories/IUserRepository";
import { IVerificationTokenRepository } from "../repositories/IVerificationTokenRepository";
import { IEmailService } from "../repositories/IEmailService";
import { VerificationToken } from "../entities/VerificationToken";
import { User } from "../entities/User";
import crypto from "crypto";

export class VerificationService {
  constructor(
    private userRepository: IUserRepository,
    private tokenRepository: IVerificationTokenRepository,
    private emailService: IEmailService
  ) {}

  async sendEmailVerification(userId: number): Promise<boolean> {
    try {
      // Obtener usuario con cuenta
      const user = await this.userRepository.findById(userId);
      if (!user || !user.account) {
        throw new Error("Usuario o cuenta no encontrado");
      }

      // Generar token único
      const tokenValue = this.generateSecureToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

      // Crear token de verificación
      const verificationToken = new VerificationToken({
        id: crypto.randomUUID(),
        userId: user.id.toString(),
        token: tokenValue,
        type: "EMAIL_VERIFICATION",
        expiresAt,
        isUsed: false,
        createdAt: new Date(),
      });

      // Guardar token
      await this.tokenRepository.create(verificationToken);

      // Enviar email
      return await this.emailService.sendVerificationEmail(
        user.account.email,
        tokenValue
      );
    } catch (error) {
      console.error(
        "[VerificationService] Error enviando verificación:",
        error
      );
      return false;
    }
  }

  async verifyEmail(
    token: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Buscar token
      const verificationToken = await this.tokenRepository.findByToken(token);
      if (!verificationToken) {
        return { success: false, message: "Token inválido" };
      }

      // Validar token
      if (!verificationToken.canBeUsed()) {
        return { success: false, message: "Token expirado o ya usado" };
      }

      // Obtener usuario
      const user = await this.userRepository.findById(
        Number(verificationToken.userId)
      );
      if (!user) {
        return { success: false, message: "Usuario no encontrado" };
      }

      // Verificar usuario
      await this.userRepository.markAsVerified(user.id);

      // Marcar token como usado
      await this.tokenRepository.markAsUsed(verificationToken.id);

      return { success: true, message: "Cuenta verificada exitosamente" };
    } catch (error) {
      console.error("[VerificationService] Error verificando email:", error);
      return { success: false, message: "Error interno del servidor" };
    }
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }
}
