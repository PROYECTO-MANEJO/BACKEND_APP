import { IUserRepository } from "../repositories/IUserRepository";
import { IVerificationTokenRepository } from "../repositories/IVerificationTokenRepository";
import { IEmailService } from "../repositories/IEmailService";
import { VerificationToken } from "../entities/VerificationToken";
import crypto from "crypto";
import bcrypt from "bcrypt";

export class PasswordRecoveryService {
  constructor(
    private userRepository: IUserRepository,
    private tokenRepository: IVerificationTokenRepository,
    private emailService: IEmailService
  ) {}

  async requestPasswordReset(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Buscar usuario por email
      const user = await this.userRepository.findByEmail(email);

      // Por seguridad, siempre responder que se envió el correo
      if (!user) {
        return {
          success: true,
          message:
            "Si existe una cuenta con ese correo, se enviarán instrucciones para restablecer la contraseña.",
        };
      }

      // Generar token único
      const tokenValue = this.generateSecureToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      // Crear token de recuperación
      const recoveryToken = new VerificationToken({
        id: crypto.randomUUID(),
        userId: user.id.toString(),
        token: tokenValue,
        type: "PASSWORD_RESET",
        expiresAt,
        isUsed: false,
        createdAt: new Date(),
      });

      // Guardar token
      await this.tokenRepository.create(recoveryToken);

      // Enviar email
      const emailSent = await this.emailService.sendPasswordResetEmail(
        email,
        tokenValue
      );

      if (!emailSent) {
        console.error(
          "[PasswordRecoveryService] Error enviando email de recuperación"
        );
      }

      return {
        success: true,
        message:
          "Si existe una cuenta con ese correo, se enviarán instrucciones para restablecer la contraseña.",
      };
    } catch (error) {
      console.error(
        "[PasswordRecoveryService] Error en solicitud de recuperación:",
        error
      );
      return {
        success: false,
        message: "Error interno del servidor",
      };
    }
  }

  async validateResetToken(
    token: string
  ): Promise<{ success: boolean; message: string; userId?: number }> {
    try {
      // Buscar token
      const resetToken = await this.tokenRepository.findByToken(token);
      if (!resetToken || resetToken.type !== "PASSWORD_RESET") {
        return { success: false, message: "Token inválido" };
      }

      // Validar token
      if (!resetToken.canBeUsed()) {
        return { success: false, message: "Token expirado o ya usado" };
      }

      // Verificar que el usuario existe
      const user = await this.userRepository.findById(
        Number(resetToken.userId)
      );
      if (!user) {
        return { success: false, message: "Usuario no encontrado" };
      }

      return {
        success: true,
        message: "Token válido",
        userId: user.id,
      };
    } catch (error) {
      console.error("[PasswordRecoveryService] Error validando token:", error);
      return { success: false, message: "Error interno del servidor" };
    }
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validar token primero
      const tokenValidation = await this.validateResetToken(token);
      if (!tokenValidation.success || !tokenValidation.userId) {
        return { success: false, message: tokenValidation.message };
      }

      // Hash de la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña
      const updated = await this.userRepository.updatePassword(
        tokenValidation.userId,
        hashedPassword
      );
      if (!updated) {
        return { success: false, message: "Error actualizando contraseña" };
      }

      // Marcar token como usado
      const resetToken = await this.tokenRepository.findByToken(token);
      if (resetToken) {
        await this.tokenRepository.markAsUsed(resetToken.id);
      }

      return {
        success: true,
        message: "Contraseña restablecida exitosamente",
      };
    } catch (error) {
      console.error(
        "[PasswordRecoveryService] Error restableciendo contraseña:",
        error
      );
      return {
        success: false,
        message: "Error interno del servidor",
      };
    }
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }
}
