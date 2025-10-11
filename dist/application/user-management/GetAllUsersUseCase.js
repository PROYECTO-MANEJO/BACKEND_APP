"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllUsersUseCase = void 0;
class GetAllUsersUseCase {
    constructor(userManagementService) {
        this.userManagementService = userManagementService;
    }
    async execute(query) {
        try {
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(50, Math.max(1, query.limit || 10)); // Limitar entre 1 y 50
            // Preparar filtros
            const filters = {};
            if (query.careerId)
                filters.careerId = query.careerId;
            const result = await this.userManagementService.getAllUsers(page, limit, filters);
            return {
                success: true,
                message: "Usuarios obtenidos exitosamente",
                data: {
                    users: result.users,
                    pagination: {
                        currentPage: page,
                        totalPages: result.totalPages,
                        totalItems: result.total,
                        limit,
                    },
                },
            };
        }
        catch (error) {
            console.error("[GetAllUsersUseCase] Error:", error);
            return {
                success: false,
                message: "Error interno del servidor",
            };
        }
    }
}
exports.GetAllUsersUseCase = GetAllUsersUseCase;
//# sourceMappingURL=GetAllUsersUseCase.js.map