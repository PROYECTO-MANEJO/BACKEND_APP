"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyEmailUseCase = void 0;
class VerifyEmailUseCase {
    constructor(verificationService) {
        this.verificationService = verificationService;
    }
    async execute(token) {
        if (!token) {
            return {
                success: false,
                message: "Token es requerido",
            };
        }
        try {
            return await this.verificationService.verifyEmail(token);
        }
        catch (error) {
            console.error("[VerifyEmailUseCase] Error:", error);
            return {
                success: false,
                message: "Error interno del servidor",
            };
        }
    }
}
exports.VerifyEmailUseCase = VerifyEmailUseCase;
//# sourceMappingURL=VerifyEmailUseCase.js.map