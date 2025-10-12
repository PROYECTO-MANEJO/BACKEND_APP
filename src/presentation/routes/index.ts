import { Router } from "express";
import { verificationRoutes } from "./verificationRoutes";
import { passwordRecoveryRoutes } from "./passwordRecoveryRoutes";
import changeRequestRoutes from "./changeRequestRoutes";
import { AppRoutes } from "./appRoutes";

// Crear router principal
const router = Router();

// Rutas refactorizadas (Clean Architecture)
const appRoutes = new AppRoutes();
router.use("/", appRoutes.getRouter());

// Rutas legacy (mantener temporalmente)
router.use("/verification", verificationRoutes);
router.use("/password-recovery", passwordRecoveryRoutes);
router.use("/", changeRequestRoutes);

export { router as apiRoutes };

// Exportar clases de rutas individuales para uso directo
export { AppRoutes } from "./appRoutes";
export { UserRoutes } from "./userRoutes";
export { AuthRoutes } from "./authRoutes";
export { CourseRoutes } from "./courseRoutes";
export { EventRoutes } from "./eventRoutes";
export { CertificateRoutes } from "./certificateRoutes";
