import { VerificationService } from "../../domain/services/VerificationService";

export class SendEmailVerificationUseCase {
  constructor(private verificationService: VerificationService) {}

  async execute(
    userId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.verificationService.sendEmailVerification(
        userId
      );

      if (result) {
        return {
          success: true,
          message: "Correo de verificación enviado exitosamente",
        };
      } else {
        return {
          success: false,
          message: "Error enviando correo de verificación",
        };
      }
    } catch (error) {
      console.error("[SendEmailVerificationUseCase] Error:", error);
      return {
        success: false,
        message: "Error interno del servidor",
      };
    }
  }
}
