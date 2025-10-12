import { Router } from "express";
import { PasswordRecoveryController } from "@presentation/controllers/PasswordRecoveryController";

const router = Router();
const passwordRecoveryController = new PasswordRecoveryController();

/**
 * @route POST /password-recovery/forgot
 * @description Solicita recuperación de contraseña
 * @access Public
 */
router.post("/forgot", passwordRecoveryController.forgotPassword);

/**
 * @route GET /password-recovery/validate
 * @description Valida token de recuperación
 * @access Public
 */
router.get("/validate", passwordRecoveryController.validateToken);

/**
 * @route POST /password-recovery/reset
 * @description Restablece la contraseña usando token válido
 * @access Public
 */
router.post("/reset", passwordRecoveryController.resetPassword);

export { router as passwordRecoveryRoutes };
