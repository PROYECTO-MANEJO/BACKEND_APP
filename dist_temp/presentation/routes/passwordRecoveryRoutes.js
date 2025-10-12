"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordRecoveryRoutes = void 0;
const express_1 = require("express");
const PasswordRecoveryController_1 = require("@presentation/controllers/PasswordRecoveryController");
const router = (0, express_1.Router)();
exports.passwordRecoveryRoutes = router;
const passwordRecoveryController = new PasswordRecoveryController_1.PasswordRecoveryController();
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
