"use strict";
/**
 * UpdateChangeRequestStatusUseCase - Application Layer
 *
 * Caso de uso para actualizar el estado de una solicitud de cambio.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateChangeRequestStatusUseCase = void 0;
class UpdateChangeRequestStatusUseCase {
    constructor(changeRequestManagementService) {
        this.changeRequestManagementService = changeRequestManagementService;
    }
    async execute(request) {
        try {
            // Validar entrada
            const validationErrors = this.validateRequest(request);
            if (validationErrors.length > 0) {
                return {
                    success: false,
                    statusChanged: false,
                    message: "Datos de entrada inválidos",
                    errors: validationErrors,
                };
            }
            const changeRequest = await this.changeRequestManagementService.updateStatus(request.changeRequestId, request.newStatus, request.updatedBy, request.comment, request.githubBranch, request.githubPrUrl);
            return {
                success: true,
                statusChanged: true,
                changeRequest,
                message: "Estado de solicitud actualizado exitosamente",
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            return {
                success: false,
                statusChanged: false,
                message: `Error actualizando estado: ${errorMessage}`,
            };
        }
    }
    validateRequest(request) {
        const errors = [];
        if (!request.changeRequestId?.trim()) {
            errors.push("ID de solicitud de cambio es requerido");
        }
        if (!request.updatedBy?.trim()) {
            errors.push("Usuario que actualiza es requerido");
        }
        const validStatuses = [
            "PENDING",
            "REVIEWED",
            "APPROVED",
            "REJECTED",
            "IN_PROGRESS",
            "IN_TESTING",
            "COMPLETED",
            "CANCELLED",
        ];
        if (!validStatuses.includes(request.newStatus)) {
            errors.push("Estado inválido");
        }
        // Validaciones específicas por estado
        if (request.newStatus === "IN_PROGRESS" && !request.githubBranch?.trim()) {
            errors.push("Branch de GitHub es requerido para estado EN_PROGRESO");
        }
        if (request.newStatus === "COMPLETED" && !request.githubPrUrl?.trim()) {
            errors.push("URL del Pull Request es requerido para estado COMPLETADO");
        }
        if (request.comment && request.comment.length > 1000) {
            errors.push("El comentario no puede exceder 1000 caracteres");
        }
        return errors;
    }
}
exports.UpdateChangeRequestStatusUseCase = UpdateChangeRequestStatusUseCase;
//# sourceMappingURL=UpdateChangeRequestStatusUseCase.js.map