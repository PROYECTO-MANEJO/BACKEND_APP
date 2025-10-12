import { Router } from "express";
import { UserRoutes } from "./userRoutes";
import { AuthRoutes } from "./authRoutes";
import { PasswordRecoveryRoutes } from "./passwordRecoveryRoutes";
import { VerificationRoutes } from "./verificationRoutes";

export class AppRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Rutas de autenticación
    const authRoutes = new AuthRoutes();
    this.router.use("/auth", authRoutes.getRouter());

    // Rutas de usuarios
    const userRoutes = new UserRoutes();
    this.router.use("/users", userRoutes.getRouter());

    // Rutas de recuperación de contraseña
    const passwordRecoveryRoutes = new PasswordRecoveryRoutes();
    this.router.use("/password-recovery", passwordRecoveryRoutes.getRouter());

    // Rutas de verificación de email
    const verificationRoutes = new VerificationRoutes();
    this.router.use("/verification", verificationRoutes.getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}