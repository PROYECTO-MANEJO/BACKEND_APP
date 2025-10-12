"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationRoutes = void 0;
const express_1 = require("express");
const VerificationController_1 = require("../controllers/VerificationController");
const DIContainer_1 = require("../../infrastructure/DIContainer");
class VerificationRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        const container = DIContainer_1.DIContainer.getInstance();
        this.verificationController = new VerificationController_1.VerificationController(container);
        this.setupRoutes();
    }
    setupRoutes() {
        /**
         * @route POST /verification/send
         * @description Envía token de verificación por email
         * @access Public
         */
        this.router.post("/send", this.verificationController.sendVerification.bind(this.verificationController));
        /**
         * @route GET /verification/verify
         * @description Verifica email con token (query parameter)
         * @access Public
         */
        this.router.get("/verify", this.verificationController.verifyEmail.bind(this.verificationController));
        /**
         * @route POST /verification/resend
         * @description Reenvía token de verificación
         * @access Public
         */
        this.router.post("/resend", this.verificationController.resendVerification.bind(this.verificationController));
    }
    getRouter() {
        return this.router;
    }
}
exports.VerificationRoutes = VerificationRoutes;
//# sourceMappingURL=verificationRoutes.js.map