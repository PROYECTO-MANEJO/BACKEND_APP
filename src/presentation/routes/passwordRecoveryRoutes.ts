import { Router } from "express";
import { PasswordRecoveryController } from "../controllers/PasswordRecoveryController";
import { DIContainer } from "../../infrastructure/DIContainer";

export class PasswordRecoveryRoutes {
  private router: Router;
  private passwordRecoveryController: PasswordRecoveryController;

  constructor() {
    this.router = Router();
    const container = DIContainer.getInstance();
    this.passwordRecoveryController = new PasswordRecoveryController(container);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    /**
     * @route POST /password-recovery/forgot
     * @description Solicita recuperación de contraseña
     * @access Public
     */
    this.router.post(
      "/forgot",
      this.passwordRecoveryController.forgotPassword.bind(this.passwordRecoveryController)
    );

    /**
     * @route POST /password-recovery/verify-token
     * @description Valida token de recuperación
     * @access Public
     */
    this.router.post(
      "/verify-token",
      this.passwordRecoveryController.verifyResetToken.bind(this.passwordRecoveryController)
    );

    /**
     * @route POST /password-recovery/reset
     * @description Restablece la contraseña
     * @access Public
     */
    this.router.post(
      "/reset",
      this.passwordRecoveryController.resetPassword.bind(this.passwordRecoveryController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
