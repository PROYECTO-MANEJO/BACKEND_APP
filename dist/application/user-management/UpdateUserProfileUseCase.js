"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserProfileUseCase = void 0;
class UpdateUserProfileUseCase {
    constructor(userManagementService) {
        this.userManagementService = userManagementService;
    }
    async execute(userId, updateData) {
        // Validaciones básicas
        if (updateData.firstName && updateData.firstName.trim().length === 0) {
            return {
                success: false,
                message: "El nombre no puede estar vacío",
            };
        }
        if (updateData.lastName && updateData.lastName.trim().length === 0) {
            return {
                success: false,
                message: "El apellido no puede estar vacío",
            };
        }
        if (updateData.phoneNumber && updateData.phoneNumber.length > 0) {
            // Validar formato de teléfono (solo números, 10 dígitos)
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(updateData.phoneNumber)) {
                return {
                    success: false,
                    message: "El número de teléfono debe tener 10 dígitos",
                };
            }
        }
        if (updateData.dateOfBirth) {
            // Validar que no sea una fecha futura
            const today = new Date();
            if (updateData.dateOfBirth > today) {
                return {
                    success: false,
                    message: "La fecha de nacimiento no puede ser futura",
                };
            }
            // Validar edad mínima (13 años)
            const minAge = new Date();
            minAge.setFullYear(today.getFullYear() - 13);
            if (updateData.dateOfBirth > minAge) {
                return {
                    success: false,
                    message: "Debe ser mayor de 13 años",
                };
            }
        }
        try {
            return await this.userManagementService.updateUserProfile(userId, updateData);
        }
        catch (error) {
            console.error("[UpdateUserProfileUseCase] Error:", error);
            return {
                success: false,
                message: "Error interno del servidor",
            };
        }
    }
}
exports.UpdateUserProfileUseCase = UpdateUserProfileUseCase;
//# sourceMappingURL=UpdateUserProfileUseCase.js.map