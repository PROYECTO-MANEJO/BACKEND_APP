import { PasswordRecoveryService } from "../../domain/services/PasswordRecoveryService";

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export class ResetPasswordUseCase {
  constructor(private passwordRecoveryService: PasswordRecoveryService) {}

  async execute(
    dto: ResetPasswordDto
  ): Promise<{ success: boolean; message: string }> {
    if (!dto.token) {
      return {
        success: false,
        message: "Token es requerido",
      };
    }

    if (!dto.newPassword) {
      return {
        success: false,
        message: "Nueva contraseña es requerida",
      };
    }

    // Validar fortaleza de contraseña
    if (dto.newPassword.length < 8) {
      return {
        success: false,
        message: "La contraseña debe tener al menos 8 caracteres",
      };
    }

    try {
      return await this.passwordRecoveryService.resetPassword(
        dto.token,
        dto.newPassword
      );
    } catch (error) {
      console.error("[ResetPasswordUseCase] Error:", error);
      return {
        success: false,
        message: "Error interno del servidor",
      };
    }
  }
}
