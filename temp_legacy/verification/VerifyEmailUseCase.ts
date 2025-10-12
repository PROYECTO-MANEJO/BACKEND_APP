import { VerificationService } from "../../domain/services/VerificationService";

export class VerifyEmailUseCase {
  constructor(private verificationService: VerificationService) {}

  async execute(token: string): Promise<{ success: boolean; message: string }> {
    if (!token) {
      return {
        success: false,
        message: "Token es requerido",
      };
    }

    try {
      return await this.verificationService.verifyEmail(token);
    } catch (error) {
      console.error("[VerifyEmailUseCase] Error:", error);
      return {
        success: false,
        message: "Error interno del servidor",
      };
    }
  }
}
