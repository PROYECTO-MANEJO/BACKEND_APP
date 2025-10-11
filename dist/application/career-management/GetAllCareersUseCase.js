"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllCareersUseCase = void 0;
class GetAllCareersUseCase {
    constructor(careerManagementService) {
        this.careerManagementService = careerManagementService;
    }
    async execute(activeOnly = false) {
        try {
            const careers = activeOnly
                ? await this.careerManagementService.getActiveCareers()
                : await this.careerManagementService.getAllCareers();
            return {
                success: true,
                message: "Carreras obtenidas exitosamente",
                data: careers,
            };
        }
        catch (error) {
            console.error("[GetAllCareersUseCase] Error:", error);
            return {
                success: false,
                message: "Error interno del servidor",
            };
        }
    }
}
exports.GetAllCareersUseCase = GetAllCareersUseCase;
//# sourceMappingURL=GetAllCareersUseCase.js.map