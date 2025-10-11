"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserProfileUseCase = void 0;
class GetUserProfileUseCase {
    constructor(userManagementService) {
        this.userManagementService = userManagementService;
    }
    async execute(userId) {
        try {
            const profile = await this.userManagementService.getUserProfile(userId);
            if (!profile) {
                return {
                    success: false,
                    message: "Usuario no encontrado",
                };
            }
            return {
                success: true,
                message: "Perfil obtenido exitosamente",
                data: profile,
            };
        }
        catch (error) {
            console.error("[GetUserProfileUseCase] Error:", error);
            return {
                success: false,
                message: "Error interno del servidor",
            };
        }
    }
}
exports.GetUserProfileUseCase = GetUserProfileUseCase;
//# sourceMappingURL=GetUserProfileUseCase.js.map