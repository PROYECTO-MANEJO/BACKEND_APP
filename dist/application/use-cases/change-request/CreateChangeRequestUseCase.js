"use strict";
/**
 * CreateChangeRequestUseCase - Application Layer
 *
 * Caso de uso para crear solicitudes de cambio.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateChangeRequestUseCase = void 0;
class CreateChangeRequestUseCase {
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
                    message: "Datos de entrada inválidos",
                    errors: validationErrors,
                };
            }
            const changeRequest = await this.changeRequestManagementService.createChangeRequest(request.title, request.description, request.justification, request.changeType, request.requesterId, request.priority || "MEDIA", request.urgency || "NORMAL");
            return {
                success: true,
                changeRequest,
                githubIssueUrl: changeRequest.githubIntegration?.issueUrl,
                message: "Solicitud de cambio creada exitosamente",
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            return {
                success: false,
                message: `Error creando solicitud de cambio: ${errorMessage}`,
            };
        }
    }
    validateRequest(request) {
        const errors = [];
        if (!request.title?.trim()) {
            errors.push("El título es requerido");
        }
        else if (request.title.length < 5) {
            errors.push("El título debe tener al menos 5 caracteres");
        }
        if (!request.description?.trim()) {
            errors.push("La descripción es requerida");
        }
        else if (request.description.length < 10) {
            errors.push("La descripción debe tener al menos 10 caracteres");
        }
        if (!request.justification?.trim()) {
            errors.push("La justificación es requerida");
        }
        else if (request.justification.length < 10) {
            errors.push("La justificación debe tener al menos 10 caracteres");
        }
        if (!request.requesterId?.trim()) {
            errors.push("El solicitante es requerido");
        }
        if (!request.changeType) {
            errors.push("El tipo de cambio es requerido");
        }
        const validChangeTypes = [
            "FEATURE", "BUG_FIX", "ENHANCEMENT", "MAINTENANCE",
            "DOCUMENTATION", "SECURITY", "PERFORMANCE"
        ];
        if (request.changeType && !validChangeTypes.includes(request.changeType)) {
            errors.push("Tipo de cambio inválido");
        }
        if (request.priority) {
            const validPriorities = ["BAJA", "MEDIA", "ALTA", "CRITICA"];
            if (!validPriorities.includes(request.priority)) {
                errors.push("Prioridad inválida");
            }
        }
        if (request.urgency) {
            const validUrgencies = ["NORMAL", "URGENTE", "CRITICA"];
            if (!validUrgencies.includes(request.urgency)) {
                errors.push("Urgencia inválida");
            }
        }
        return errors;
    }
}
exports.CreateChangeRequestUseCase = CreateChangeRequestUseCase;
//# sourceMappingURL=CreateChangeRequestUseCase.js.map