"use strict";
/**
 * CloseEventUseCase - Application Layer
 *
 * Caso de uso para cerrar un evento y generar certificados automáticamente
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseEventUseCase = void 0;
class CloseEventUseCase {
    constructor(eventManagementService) {
        this.eventManagementService = eventManagementService;
    }
    async execute(request) {
        try {
            // Validar request
            if (!request.id || !request.id.trim()) {
                throw new Error("ID de evento inválido");
            }
            // Ejecutar cierre a través del servicio de dominio
            const closedEvent = await this.eventManagementService.closeEvent(request.id);
            return {
                success: true,
                message: "Evento cerrado exitosamente",
                data: {
                    id: closedEvent.id,
                    nom_eve: closedEvent.nom_eve,
                    estado_eve: closedEvent.estado_eve,
                    fecha_cierre: closedEvent.fecha_actualizacion,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: "Error al cerrar el evento",
                error: error.message,
            };
        }
    }
}
exports.CloseEventUseCase = CloseEventUseCase;
//# sourceMappingURL=CloseEventUseCase.js.map