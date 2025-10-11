"use strict";
/**
 * GetPendingInscriptionsUseCase - Application Layer
 *
 * Caso de uso para obtener las inscripciones pendientes de aprobación.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPendingInscriptionsUseCase = void 0;
class GetPendingInscriptionsUseCase {
    constructor(inscriptionManagementService) {
        this.inscriptionManagementService = inscriptionManagementService;
    }
    async execute(request = {}) {
        try {
            // Obtener todas las inscripciones pendientes
            const pendingInscriptions = await this.inscriptionManagementService.getPendingInscriptions();
            // Calcular estadísticas
            const statistics = {
                totalPending: pendingInscriptions.length,
                eventInscriptions: pendingInscriptions.filter(ins => ins.isForEvent()).length,
                courseInscriptions: pendingInscriptions.filter(ins => ins.isForCourse()).length
            };
            // Aplicar paginación si se solicita
            if (request.page && request.limit) {
                const startIndex = (request.page - 1) * request.limit;
                const endIndex = startIndex + request.limit;
                const paginatedInscriptions = pendingInscriptions.slice(startIndex, endIndex);
                return {
                    success: true,
                    inscriptions: paginatedInscriptions.map(ins => ins.toPublicObject()),
                    pagination: {
                        total: pendingInscriptions.length,
                        totalPages: Math.ceil(pendingInscriptions.length / request.limit),
                        currentPage: request.page,
                        limit: request.limit
                    },
                    statistics
                };
            }
            return {
                success: true,
                inscriptions: pendingInscriptions.map(ins => ins.toPublicObject()),
                statistics
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido al obtener inscripciones pendientes'
            };
        }
    }
}
exports.GetPendingInscriptionsUseCase = GetPendingInscriptionsUseCase;
//# sourceMappingURL=GetPendingInscriptionsUseCase.js.map