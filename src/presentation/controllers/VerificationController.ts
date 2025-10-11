import { Request, Response } from "express";
import { DIContainer } from "@infrastructure/config/DIContainer";
import { SendEmailVerificationUseCase } from "@application/verification/SendEmailVerificationUseCase";
import { VerifyEmailUseCase } from "@application/verification/VerifyEmailUseCase";

export class VerificationController {
  private sendEmailVerificationUseCase: SendEmailVerificationUseCase;
  private verifyEmailUseCase: VerifyEmailUseCase;

  constructor() {
    const container = DIContainer.getInstance();
    this.sendEmailVerificationUseCase = new SendEmailVerificationUseCase(
      container.verificationService
    );
    this.verifyEmailUseCase = new VerifyEmailUseCase(
      container.verificationService
    );
  }

  sendVerification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: "ID de usuario es requerido",
        });
        return;
      }

      const result = await this.sendEmailVerificationUseCase.execute(
        Number(userId)
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error(
        "[VerificationController] Error en sendVerification:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  };

  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.query;

      const result = await this.verifyEmailUseCase.execute(token as string);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("[VerificationController] Error en verifyEmail:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  };
}
