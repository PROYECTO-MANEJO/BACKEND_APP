import { Router } from "express";
import { VerificationController } from "../controllers/VerificationController";
import { DIContainer } from "../../infrastructure/DIContainer";

export class VerificationRoutes {
  private router: Router;
  private verificationController: VerificationController;

  constructor() {
    this.router = Router();
    const container = DIContainer.getInstance();
    this.verificationController = new VerificationController(container);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    /**
     * @route POST /verification/send
     * @description Envía token de verificación por email
     * @access Public
     */
    this.router.post(
      "/send",
      this.verificationController.sendVerification.bind(this.verificationController)
    );

    /**
     * @route GET /verification/verify
     * @description Verifica email con token (query parameter)
     * @access Public
     */
    this.router.get(
      "/verify",
      this.verificationController.verifyEmail.bind(this.verificationController)
    );

    /**
     * @route POST /verification/resend
     * @description Reenvía token de verificación
     * @access Public
     */
    this.router.post(
      "/resend",
      this.verificationController.resendVerification.bind(this.verificationController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
