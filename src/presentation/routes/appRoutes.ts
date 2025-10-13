import { Router } from "express";
import { UserRoutes } from "./userRoutes";
import { AuthRoutes } from "./authRoutes";
import { PasswordRecoveryRoutes } from "./passwordRecoveryRoutes";
import { VerificationRoutes } from "./verificationRoutes";
import { ChangeRequestRoutes } from "./changeRequestRoutes";
import { DeveloperRoutes } from "./developerRoutes";
import { InscriptionRoutes } from "./inscriptionRoutes";
import { ParticipationRoutes } from "./participationRoutes";
import { homepageRoutes } from "./homepageRoutes";
import { CareerRoutes } from "./careerRoutes";

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

    // Rutas de solicitudes de cambio
    const changeRequestRoutes = new ChangeRequestRoutes();
    this.router.use("/change-requests", changeRequestRoutes.getRouter());

    // Rutas de desarrolladores
    const developerRoutes = new DeveloperRoutes();
    this.router.use("/developers", developerRoutes.getRouter());

    // Rutas de inscripciones
    const inscriptionRoutes = new InscriptionRoutes();
    this.router.use("/inscriptions", inscriptionRoutes.getRouter());

    // Rutas de participaciones
    const participationRoutes = new ParticipationRoutes();
    this.router.use("/participations", participationRoutes.getRouter());

    // Rutas de página principal
    this.router.use("/homepage", homepageRoutes);

    // Rutas de carreras
    const careerRoutes = new CareerRoutes();
    this.router.use("/careers", careerRoutes.getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}
