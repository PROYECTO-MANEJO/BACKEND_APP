"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateChangeRequestUseCase = void 0;
const ChangeRequest_1 = require("@domain/entities/ChangeRequest");
class CreateChangeRequestUseCase {
    constructor(changeRequestRepository) {
        this.changeRequestRepository = changeRequestRepository;
    }
    async execute(data) {
        // Validaciones de entrada
        this.validateInput(data);
        // Crear entidad de dominio
        const changeRequest = ChangeRequest_1.ChangeRequest.create(data.title.trim(), data.description.trim(), data.justification.trim(), data.changeType, data.requesterId, undefined, // requesterName - se puede obtener luego
        (data.priority || "MEDIA"), (data.urgency || "NORMAL"));
        // Persistir en el repositorio
        const createdRequest = await this.changeRequestRepository.create(changeRequest);
        return createdRequest;
    }
    validateInput(data) {
        if (!data.title || data.title.trim().length === 0) {
            throw new Error("El título es requerido");
        }
        if (data.title.trim().length > 200) {
            throw new Error("El título no puede exceder 200 caracteres");
        }
        if (!data.description || data.description.trim().length === 0) {
            throw new Error("La descripción es requerida");
        }
        if (data.description.trim().length > 2000) {
            throw new Error("La descripción no puede exceder 2000 caracteres");
        }
        if (!data.justification || data.justification.trim().length === 0) {
            throw new Error("La justificación es requerida");
        }
        if (data.justification.trim().length > 1500) {
            throw new Error("La justificación no puede exceder 1500 caracteres");
        }
        if (!data.changeType) {
            throw new Error("El tipo de cambio es requerido");
        }
        const validChangeTypes = [
            "FUNCIONALIDAD",
            "CORRECCION",
            "MEJORA",
            "CONFIGURACION",
            "SEGURIDAD",
            "RENDIMIENTO",
            "DOCUMENTACION",
        ];
        if (!validChangeTypes.includes(data.changeType)) {
            throw new Error(`Tipo de cambio inválido. Valores válidos: ${validChangeTypes.join(", ")}`);
        }
        const validPriorities = ["BAJA", "MEDIA", "ALTA", "CRITICA"];
        if (data.priority && !validPriorities.includes(data.priority)) {
            throw new Error(`Prioridad inválida. Valores válidos: ${validPriorities.join(", ")}`);
        }
        const validUrgencies = ["NORMAL", "URGENTE", "INMEDIATA"];
        if (data.urgency && !validUrgencies.includes(data.urgency)) {
            throw new Error(`Urgencia inválida. Valores válidos: ${validUrgencies.join(", ")}`);
        }
        if (!data.requesterId || data.requesterId.trim().length === 0) {
            throw new Error("El ID del solicitante es requerido");
        }
    }
}
exports.CreateChangeRequestUseCase = CreateChangeRequestUseCase;
//# sourceMappingURL=CreateChangeRequestUseCase.js.map