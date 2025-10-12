"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordRecoveryRoutes = void 0;
const express_1 = require("express");
const PasswordRecoveryController_1 = require("../controllers/PasswordRecoveryController");
const DIContainer_1 = require("../../infrastructure/DIContainer");
class PasswordRecoveryRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        const container = DIContainer_1.DIContainer.getInstance();
        this.passwordRecoveryController = new PasswordRecoveryController_1.PasswordRecoveryController(container);
        this.setupRoutes();
    }
    setupRoutes() {
        /**
         * @route POST /password-recovery/forgot
         * @description Solicita recuperación de contraseña
         * @access Public
         */
        this.router.post("/forgot", this.passwordRecoveryController.forgotPassword.bind(this.passwordRecoveryController));
        /**
         * @route POST /password-recovery/verify-token
         * @description Valida token de recuperación
         * @access Public
         */
        this.router.post("/verify-token", this.passwordRecoveryController.verifyResetToken.bind(this.passwordRecoveryController));
        /**
         * @route POST /password-recovery/reset
         * @description Restablece la contraseña
         * @access Public
         */
        this.router.post("/reset", this.passwordRecoveryController.resetPassword.bind(this.passwordRecoveryController));
    }
    getRouter() {
        return this.router;
    }
}
exports.PasswordRecoveryRoutes = PasswordRecoveryRoutes;
//# sourceMappingURL=passwordRecoveryRoutes.js.map