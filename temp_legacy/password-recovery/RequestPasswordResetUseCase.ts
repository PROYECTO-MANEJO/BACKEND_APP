import { PasswordRecoveryService } from "../../domain/services/PasswordRecoveryService";

export interface RequestPasswordResetDto {
  email: string;
}

export class RequestPasswordResetUseCase {
  constructor(private passwordRecoveryService: PasswordRecoveryService) {}

  async execute(
    dto: RequestPasswordResetDto
  ): Promise<{ success: boolean; message: string }> {
    if (!dto.email) {
      return {
        success: false,
        message: "El correo electrónico es requerido",
      };
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      return {
        success: false,
        message: "Formato de correo electrónico inválido",
      };
    }

    try {
      return await this.passwordRecoveryService.requestPasswordReset(dto.email);
    } catch (error) {
      console.error("[RequestPasswordResetUseCase] Error:", error);
      return {
        success: false,
        message: "Error interno del servidor",
      };
    }
  }
}
