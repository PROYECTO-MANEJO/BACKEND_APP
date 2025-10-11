import { PasswordRecoveryService } from "../../domain/services/PasswordRecoveryService";

export class ValidateResetTokenUseCase {
  constructor(private passwordRecoveryService: PasswordRecoveryService) {}

  async execute(
    token: string
  ): Promise<{ success: boolean; message: string; userId?: number }> {
    if (!token) {
      return {
        success: false,
        message: "Token es requerido",
      };
    }

    try {
      return await this.passwordRecoveryService.validateResetToken(token);
    } catch (error) {
      console.error("[ValidateResetTokenUseCase] Error:", error);
      return {
        success: false,
        message: "Error interno del servidor",
      };
    }
  }
}
