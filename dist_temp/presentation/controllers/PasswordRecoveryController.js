"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordRecoveryController = void 0;
const DIContainer_1 = require("@infrastructure/config/DIContainer");
const RequestPasswordResetUseCase_1 = require("@application/password-recovery/RequestPasswordResetUseCase");
const ValidateResetTokenUseCase_1 = require("@application/password-recovery/ValidateResetTokenUseCase");
const ResetPasswordUseCase_1 = require("@application/password-recovery/ResetPasswordUseCase");
class PasswordRecoveryController {
    constructor() {
        this.forgotPassword = async (req, res) => {
            try {
                const dto = { email: req.body.email };
                const result = await this.requestPasswordResetUseCase.execute(dto);
                if (result.success) {
                    res.status(200).json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error("[PasswordRecoveryController] Error en forgotPassword:", error);
                res.status(500).json({
                    success: false,
                    message: "Error interno del servidor",
                });
            }
        };
        this.validateToken = async (req, res) => {
            try {
                const { token } = req.query;
                const result = await this.validateResetTokenUseCase.execute(token);
                if (result.success) {
                    res.status(200).json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error("[PasswordRecoveryController] Error en validateToken:", error);
                res.status(500).json({
                    success: false,
                    message: "Error interno del servidor",
                });
            }
        };
        this.resetPassword = async (req, res) => {
            try {
                const dto = {
                    token: req.body.token,
                    newPassword: req.body.newPassword,
                };
                const result = await this.resetPasswordUseCase.execute(dto);
                if (result.success) {
                    res.status(200).json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error("[PasswordRecoveryController] Error en resetPassword:", error);
                res.status(500).json({
                    success: false,
                    message: "Error interno del servidor",
                });
            }
        };
        const container = DIContainer_1.DIContainer.getInstance();
        this.requestPasswordResetUseCase = new RequestPasswordResetUseCase_1.RequestPasswordResetUseCase(container.passwordRecoveryService);
        this.validateResetTokenUseCase = new ValidateResetTokenUseCase_1.ValidateResetTokenUseCase(container.passwordRecoveryService);
        this.resetPasswordUseCase = new ResetPasswordUseCase_1.ResetPasswordUseCase(container.passwordRecoveryService);
    }
}
exports.PasswordRecoveryController = PasswordRecoveryController;
