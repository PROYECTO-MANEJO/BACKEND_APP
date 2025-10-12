"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationController = void 0;
const DIContainer_1 = require("@infrastructure/config/DIContainer");
const SendEmailVerificationUseCase_1 = require("@application/verification/SendEmailVerificationUseCase");
const VerifyEmailUseCase_1 = require("@application/verification/VerifyEmailUseCase");
class VerificationController {
    constructor() {
        this.sendVerification = async (req, res) => {
            try {
                const { userId } = req.body;
                if (!userId) {
                    res.status(400).json({
                        success: false,
                        message: "ID de usuario es requerido",
                    });
                    return;
                }
                const result = await this.sendEmailVerificationUseCase.execute(Number(userId));
                if (result.success) {
                    res.status(200).json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error("[VerificationController] Error en sendVerification:", error);
                res.status(500).json({
                    success: false,
                    message: "Error interno del servidor",
                });
            }
        };
        this.verifyEmail = async (req, res) => {
            try {
                const { token } = req.query;
                const result = await this.verifyEmailUseCase.execute(token);
                if (result.success) {
                    res.status(200).json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error("[VerificationController] Error en verifyEmail:", error);
                res.status(500).json({
                    success: false,
                    message: "Error interno del servidor",
                });
            }
        };
        const container = DIContainer_1.DIContainer.getInstance();
        this.sendEmailVerificationUseCase = new SendEmailVerificationUseCase_1.SendEmailVerificationUseCase(container.verificationService);
        this.verifyEmailUseCase = new VerifyEmailUseCase_1.VerifyEmailUseCase(container.verificationService);
    }
}
exports.VerificationController = VerificationController;
