"use strict";
/**
 * ApproveInscriptionUseCase - Application Layer
 *
 * Caso de uso para aprobar una inscripción pendiente.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveInscriptionUseCase = void 0;
class ApproveInscriptionUseCase {
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
            if (!request.approverUserId?.trim()) {
                return {
                    success: false,
                    error: 'El ID del usuario aprobador es obligatorio'
                };
            }
            // Aprobar inscripción
            const approvedInscription = await this.inscriptionManagementService.approveInscription(request.inscriptionId, request.approverUserId);
            return {
                success: true,
                inscription: approvedInscription.toPublicObject(),
                message: 'Inscripción aprobada exitosamente'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido al aprobar la inscripción'
            };
        }
    }
}
exports.ApproveInscriptionUseCase = ApproveInscriptionUseCase;
//# sourceMappingURL=ApproveInscriptionUseCase.js.map