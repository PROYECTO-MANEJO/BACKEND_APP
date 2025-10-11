"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificationRoutes = void 0;
const express_1 = require("express");
const VerificationController_1 = require("@presentation/controllers/VerificationController");
const router = (0, express_1.Router)();
exports.verificationRoutes = router;
const verificationController = new VerificationController_1.VerificationController();
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
//# sourceMappingURL=verificationRoutes.js.map