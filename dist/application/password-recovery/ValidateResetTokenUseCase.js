"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateResetTokenUseCase = void 0;
class ValidateResetTokenUseCase {
    constructor(passwordRecoveryService) {
        this.passwordRecoveryService = passwordRecoveryService;
    }
    async execute(token) {
        if (!token) {
            return {
                success: false,
                message: "Token es requerido",
            };
        }
        try {
            return await this.passwordRecoveryService.validateResetToken(token);
        }
        catch (error) {
            console.error("[ValidateResetTokenUseCase] Error:", error);
            return {
                success: false,
                message: "Error interno del servidor",
            };
        }
    }
}
exports.ValidateResetTokenUseCase = ValidateResetTokenUseCase;
//# sourceMappingURL=ValidateResetTokenUseCase.js.map