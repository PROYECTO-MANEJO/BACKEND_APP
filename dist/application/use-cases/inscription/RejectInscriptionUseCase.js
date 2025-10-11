"use strict";
/**
 * RejectInscriptionUseCase - Application Layer
 *
 * Caso de uso para rechazar una inscripción pendiente.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectInscriptionUseCase = void 0;
class RejectInscriptionUseCase {
    constructor(inscriptionManagementService) {
        this.inscriptionManagementService = inscriptionManagementService;
    }
    async execute(request) {
        try {
            // Validación básica
            if (!request.inscriptionId?.trim()) {
                return {
                    success: false,
                    error: "El ID de la inscripción es obligatorio",
                };
            }
            // Rechazar inscripción
            const rejectedInscription = await this.inscriptionManagementService.rejectInscription(request.inscriptionId);
            return {
                success: true,
                inscription: rejectedInscription.toPublicObject(),
                message: "Inscripción rechazada exitosamente",
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : "Error desconocido al rechazar la inscripción",
            };
        }
    }
}
exports.RejectInscriptionUseCase = RejectInscriptionUseCase;
//# sourceMappingURL=RejectInscriptionUseCase.js.map