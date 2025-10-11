"use strict";
/**
 * DeleteEventUseCase - Application Layer
 *
 * Caso de uso para eliminar un evento del sistema
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteEventUseCase = void 0;
class DeleteEventUseCase {
    constructor(eventManagementService) {
        this.eventManagementService = eventManagementService;
    }
    async execute(request) {
        try {
            // Validar request
            if (!request.id || !request.id.trim()) {
                throw new Error("ID de evento inválido");
            }
            // Ejecutar eliminación a través del servicio de dominio
            const deleted = await this.eventManagementService.deleteEvent(request.id);
            return {
                success: true,
                message: "Evento eliminado exitosamente",
                data: {
                    id: request.id,
                    deleted: deleted,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: "Error al eliminar el evento",
                error: error.message,
            };
        }
    }
}
exports.DeleteEventUseCase = DeleteEventUseCase;
//# sourceMappingURL=DeleteEventUseCase.js.map