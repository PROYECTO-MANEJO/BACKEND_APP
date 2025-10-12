import { Router } from "express";
import { AppRoutes } from "./appRoutes";

// Crear router principal
const router = Router();

// Rutas refactorizadas (Clean Architecture)
const appRoutes = new AppRoutes();
router.use("/", appRoutes.getRouter());

export { router as apiRoutes };

// Exportar clases de rutas individuales para uso directo
export { AppRoutes } from "./appRoutes";
export { UserRoutes } from "./userRoutes";
export { AuthRoutes } from "./authRoutes";
export { PasswordRecoveryRoutes } from "./passwordRecoveryRoutes";
export { VerificationRoutes } from "./verificationRoutes";
export { ChangeRequestRoutes } from "./changeRequestRoutes";
export { DeveloperRoutes } from "./developerRoutes";
export { InscriptionRoutes } from "./inscriptionRoutes";
export { ParticipationRoutes } from "./participationRoutes";
export { HomepageRoutes } from "./homepageRoutes";
export { CareerRoutes } from "./careerRoutes";
