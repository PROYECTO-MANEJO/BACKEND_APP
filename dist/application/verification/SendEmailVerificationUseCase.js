"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendEmailVerificationUseCase = void 0;
class SendEmailVerificationUseCase {
    constructor(verificationService) {
        this.verificationService = verificationService;
    }
    async execute(userId) {
        try {
            const result = await this.verificationService.sendEmailVerification(userId);
            if (result) {
                return {
                    success: true,
                    message: "Correo de verificación enviado exitosamente",
                };
            }
            else {
                return {
                    success: false,
                    message: "Error enviando correo de verificación",
                };
            }
        }
        catch (error) {
            console.error("[SendEmailVerificationUseCase] Error:", error);
            return {
                success: false,
                message: "Error interno del servidor",
            };
        }
    }
}
exports.SendEmailVerificationUseCase = SendEmailVerificationUseCase;
//# sourceMappingURL=SendEmailVerificationUseCase.js.map