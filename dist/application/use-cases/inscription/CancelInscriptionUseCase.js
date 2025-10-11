"use strict";
/**
 * CancelInscriptionUseCase - Application Layer
 *
 * Caso de uso para cancelar una inscripción del usuario.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelInscriptionUseCase = void 0;
class CancelInscriptionUseCase {
    constructor(inscriptionManagementService) {
        this.inscriptionManagementService = inscriptionManagementService;
    }
    async execute(request) {
        try {
            // Validaciones básicas
            if (!request.inscriptionId?.trim()) {
                return {
                    success: false,
                    error: 'El ID de la inscripción es obligatorio'
                };
            }
            if (!request.userId?.trim()) {
                return {
                    success: false,
                    error: 'El ID del usuario es obligatorio'
                };
            }
            // Cancelar inscripción
            const cancelledInscription = await this.inscriptionManagementService.cancelInscription(request.inscriptionId, request.userId);
            return {
                success: true,
                inscription: cancelledInscription.toPublicObject(),
                message: 'Inscripción cancelada exitosamente'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido al cancelar la inscripción'
            };
        }
    }
}
exports.CancelInscriptionUseCase = CancelInscriptionUseCase;
//# sourceMappingURL=CancelInscriptionUseCase.js.map