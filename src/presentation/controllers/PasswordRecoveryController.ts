import { Request, Response } from "express";
import { DIContainer } from "@infrastructure/config/DIContainer";
import {
  RequestPasswordResetUseCase,
  RequestPasswordResetDto,
} from "@application/password-recovery/RequestPasswordResetUseCase";
import { ValidateResetTokenUseCase } from "@application/password-recovery/ValidateResetTokenUseCase";
import {
  ResetPasswordUseCase,
  ResetPasswordDto,
} from "@application/password-recovery/ResetPasswordUseCase";

export class PasswordRecoveryController {
  private requestPasswordResetUseCase: RequestPasswordResetUseCase;
  private validateResetTokenUseCase: ValidateResetTokenUseCase;
  private resetPasswordUseCase: ResetPasswordUseCase;

  constructor() {
    const container = DIContainer.getInstance();
    this.requestPasswordResetUseCase = new RequestPasswordResetUseCase(
      container.passwordRecoveryService
    );
    this.validateResetTokenUseCase = new ValidateResetTokenUseCase(
      container.passwordRecoveryService
    );
    this.resetPasswordUseCase = new ResetPasswordUseCase(
      container.passwordRecoveryService
    );
  }

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: RequestPasswordResetDto = { email: req.body.email };

      const result = await this.requestPasswordResetUseCase.execute(dto);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error(
        "[PasswordRecoveryController] Error en forgotPassword:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  };

  validateToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.query;

      const result = await this.validateResetTokenUseCase.execute(
        token as string
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error(
        "[PasswordRecoveryController] Error en validateToken:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: ResetPasswordDto = {
        token: req.body.token,
        newPassword: req.body.newPassword,
      };

      const result = await this.resetPasswordUseCase.execute(dto);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error(
        "[PasswordRecoveryController] Error en resetPassword:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  };
}
