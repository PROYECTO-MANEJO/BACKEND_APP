import { Router } from "express";
import { VerificationController } from "@presentation/controllers/VerificationController";

const router = Router();
const verificationController = new VerificationController();

/**
 * @route POST /verification/send
 * @description Envía correo de verificación a un usuario
 * @access Public
 */
router.post("/send", verificationController.sendVerification);

/**
 * @route GET /verification/verify
 * @description Verifica el email usando el token
 * @access Public
 */
router.get("/verify", verificationController.verifyEmail);

export { router as verificationRoutes };
