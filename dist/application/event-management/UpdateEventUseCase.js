"use strict";
/**
 * UpdateEventUseCase - Application Layer
 *
 * Caso de uso para actualizar un evento existente
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEventUseCase = void 0;
class UpdateEventUseCase {
    constructor(eventManagementService) {
        this.eventManagementService = eventManagementService;
    }
    async execute(request) {
        try {
            // Validar request
            this.validateRequest(request);
            // Preparar datos de actualización
            const updateData = {};
            if (request.nom_eve !== undefined)
                updateData.nom_eve = request.nom_eve.trim();
            if (request.des_eve !== undefined)
                updateData.des_eve = request.des_eve.trim();
            if (request.capacidad_max_eve !== undefined)
                updateData.capacidad_max_eve = request.capacidad_max_eve;
            if (request.precio !== undefined)
                updateData.precio = request.precio;
            if (request.are_eve !== undefined)
                updateData.are_eve = request.are_eve.trim();
            if (request.ubi_eve !== undefined)
                updateData.ubi_eve = request.ubi_eve.trim();
            // Ejecutar actualización a través del servicio de dominio
            const updatedEvent = await this.eventManagementService.updateEvent(request.id, updateData);
            return {
                success: true,
                message: "Evento actualizado exitosamente",
                data: {
                    id: updatedEvent.id,
                    nom_eve: updatedEvent.nom_eve,
                    estado_eve: updatedEvent.estado_eve,
                    fecha_actualizacion: updatedEvent.fecha_actualizacion,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: "Error al actualizar el evento",
                error: error.message,
            };
        }
    }
    validateRequest(request) {
        if (!request.id || !request.id.trim()) {
            throw new Error("ID de evento inválido");
        }
        // Validar que se envíe al menos un campo para actualizar
        const hasUpdates = request.nom_eve !== undefined ||
            request.des_eve !== undefined ||
            request.capacidad_max_eve !== undefined ||
            request.precio !== undefined ||
            request.are_eve !== undefined ||
            request.ubi_eve !== undefined;
        if (!hasUpdates) {
            throw new Error("Debe especificar al menos un campo para actualizar");
        }
        // Validaciones específicas
        if (request.nom_eve !== undefined && !request.nom_eve.trim()) {
            throw new Error("El nombre del evento no puede estar vacío");
        }
        if (request.des_eve !== undefined && !request.des_eve.trim()) {
            throw new Error("La descripción del evento no puede estar vacía");
        }
        if (request.capacidad_max_eve !== undefined &&
            request.capacidad_max_eve <= 0) {
            throw new Error("La capacidad máxima debe ser mayor a 0");
        }
        if (request.precio !== undefined && request.precio < 0) {
            throw new Error("El precio no puede ser negativo");
        }
        if (request.are_eve !== undefined && !request.are_eve.trim()) {
            throw new Error("El área del evento no puede estar vacía");
        }
        if (request.ubi_eve !== undefined && !request.ubi_eve.trim()) {
            throw new Error("La ubicación del evento no puede estar vacía");
        }
    }
}
exports.UpdateEventUseCase = UpdateEventUseCase;
//# sourceMappingURL=UpdateEventUseCase.js.map