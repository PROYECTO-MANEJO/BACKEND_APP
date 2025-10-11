"use strict";
/**
 * GetAllInscriptionsUseCase - Application Layer
 *
 * Caso de uso para obtener todas las inscripciones con filtros y paginación.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllInscriptionsUseCase = void 0;
class GetAllInscriptionsUseCase {
    constructor(inscriptionRepository) {
        this.inscriptionRepository = inscriptionRepository;
    }
    async execute(request = {}) {
        try {
            const { page = 1, limit = 10 } = request;
            // Si se especifica paginación
            if (page && limit) {
                const result = await this.inscriptionRepository.findAllPaginated(page, limit);
                return {
                    success: true,
                    inscriptions: result.inscriptions.map(ins => ins.toPublicObject()),
                    pagination: {
                        total: result.total,
                        totalPages: result.totalPages,
                        currentPage: result.currentPage,
                        limit
                    }
                };
            }
            // Sin paginación - aplicar filtros
            const inscriptions = await this.inscriptionRepository.findWithFilters({
                userId: request.userId,
                targetId: request.targetId,
                type: request.type,
                paymentStatus: request.paymentStatus,
                startDate: request.startDate,
                endDate: request.endDate,
                hasPaymentProof: request.hasPaymentProof,
                hasMotivationLetter: request.hasMotivationLetter
            });
            return {
                success: true,
                inscriptions: inscriptions.map(ins => ins.toPublicObject())
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido al obtener las inscripciones'
            };
        }
    }
}
exports.GetAllInscriptionsUseCase = GetAllInscriptionsUseCase;
//# sourceMappingURL=GetAllInscriptionsUseCase.js.map