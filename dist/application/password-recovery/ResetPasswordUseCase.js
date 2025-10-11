"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordUseCase = void 0;
class ResetPasswordUseCase {
    constructor(passwordRecoveryService) {
        this.passwordRecoveryService = passwordRecoveryService;
    }
    async execute(dto) {
        if (!dto.token) {
            return {
                success: false,
                message: "Token es requerido",
            };
        }
        if (!dto.newPassword) {
            return {
                success: false,
                message: "Nueva contraseña es requerida",
            };
        }
        // Validar fortaleza de contraseña
        if (dto.newPassword.length < 8) {
            return {
                success: false,
                message: "La contraseña debe tener al menos 8 caracteres",
            };
        }
        try {
            return await this.passwordRecoveryService.resetPassword(dto.token, dto.newPassword);
        }
        catch (error) {
            console.error("[ResetPasswordUseCase] Error:", error);
            return {
                success: false,
                message: "Error interno del servidor",
            };
        }
    }
}
exports.ResetPasswordUseCase = ResetPasswordUseCase;
//# sourceMappingURL=ResetPasswordUseCase.js.map