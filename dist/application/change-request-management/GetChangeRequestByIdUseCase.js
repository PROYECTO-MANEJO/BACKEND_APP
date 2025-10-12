"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetChangeRequestByIdUseCase = void 0;
class GetChangeRequestByIdUseCase {
    constructor(changeRequestRepository) {
        this.changeRequestRepository = changeRequestRepository;
    }
    async execute(requestId, userId) {
        this.validateInput(requestId);
        const changeRequest = await this.changeRequestRepository.findById(requestId);
        if (!changeRequest) {
            return null;
        }
        // Opcional: verificar permisos de acceso
        if (userId && !this.canUserAccessRequest(changeRequest, userId)) {
            throw new Error("No tienes permisos para acceder a esta solicitud");
        }
        return changeRequest;
    }
    validateInput(requestId) {
        if (!requestId || requestId.trim().length === 0) {
            throw new Error("El ID de la solicitud es requerido");
        }
    }
    canUserAccessRequest(changeRequest, userId) {
        // El usuario puede acceder si es:
        // 1. El solicitante
        // 2. El desarrollador asignado
        // 3. Un administrador (esto se validaría en el controller con roles)
        return (changeRequest.requesterId === userId ||
            changeRequest.developerId === userId);
    }
}
exports.GetChangeRequestByIdUseCase = GetChangeRequestByIdUseCase;
//# sourceMappingURL=GetChangeRequestByIdUseCase.js.map