"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestPasswordResetUseCase = void 0;
class RequestPasswordResetUseCase {
    constructor(passwordRecoveryService) {
        this.passwordRecoveryService = passwordRecoveryService;
    }
    async execute(dto) {
        if (!dto.email) {
            return {
                success: false,
                message: "El correo electrónico es requerido",
            };
        }
        // Validar formato de email básico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dto.email)) {
            return {
                success: false,
                message: "Formato de correo electrónico inválido",
            };
        }
        try {
            return await this.passwordRecoveryService.requestPasswordReset(dto.email);
        }
        catch (error) {
            console.error("[RequestPasswordResetUseCase] Error:", error);
            return {
                success: false,
                message: "Error interno del servidor",
            };
        }
    }
}
exports.RequestPasswordResetUseCase = RequestPasswordResetUseCase;
//# sourceMappingURL=RequestPasswordResetUseCase.js.map