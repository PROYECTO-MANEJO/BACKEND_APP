"use strict";
/**
 * CreateEventUseCase - Application Layer
 *
 * Caso de uso para crear un nuevo evento en el sistema
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEventUseCase = void 0;
class CreateEventUseCase {
    constructor(eventManagementService) {
        this.eventManagementService = eventManagementService;
    }
    async execute(request) {
        try {
            // Validar request
            this.validateRequest(request);
            // Preparar datos con conversiones necesarias
            const eventData = {
                nom_eve: request.nom_eve.trim(),
                des_eve: request.des_eve.trim(),
                id_cat_eve: request.id_cat_eve,
                fec_ini_eve: new Date(request.fec_ini_eve),
                fec_fin_eve: request.fec_fin_eve
                    ? new Date(request.fec_fin_eve)
                    : undefined,
                hor_ini_eve: this.parseTimeToDate(request.hor_ini_eve),
                hor_fin_eve: request.hor_fin_eve
                    ? this.parseTimeToDate(request.hor_fin_eve)
                    : undefined,
                dur_eve: request.dur_eve,
                are_eve: request.are_eve.trim(),
                ubi_eve: request.ubi_eve.trim(),
                ced_org_eve: request.ced_org_eve.trim(),
                capacidad_max_eve: request.capacidad_max_eve,
                tipo_audiencia_eve: request.tipo_audiencia_eve,
                es_gratuito: request.es_gratuito,
                precio: request.precio,
                porcentaje_asistencia_aprobacion: request.porcentaje_asistencia_aprobacion,
                carreras: request.carreras,
            };
            // Ejecutar creación a través del servicio de dominio
            const createdEvent = await this.eventManagementService.createEvent(eventData);
            return {
                success: true,
                message: "Evento creado exitosamente",
                data: {
                    id: createdEvent.id,
                    nom_eve: createdEvent.nom_eve,
                    estado_eve: createdEvent.estado_eve,
                    fecha_creacion: createdEvent.fecha_creacion,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: "Error al crear el evento",
                error: error.message,
            };
        }
    }
    validateRequest(request) {
        if (!request.nom_eve?.trim()) {
            throw new Error("El nombre del evento es obligatorio");
        }
        if (!request.des_eve?.trim()) {
            throw new Error("La descripción del evento es obligatoria");
        }
        if (!request.id_cat_eve || request.id_cat_eve <= 0) {
            throw new Error("La categoría del evento es obligatoria");
        }
        if (!request.fec_ini_eve) {
            throw new Error("La fecha de inicio es obligatoria");
        }
        if (!request.hor_ini_eve) {
            throw new Error("La hora de inicio es obligatoria");
        }
        if (!request.ced_org_eve?.trim()) {
            throw new Error("La cédula del organizador es obligatoria");
        }
        // Validar formato de fecha
        const fechaInicio = new Date(request.fec_ini_eve);
        if (isNaN(fechaInicio.getTime())) {
            throw new Error("Formato de fecha de inicio inválido");
        }
        if (request.fec_fin_eve) {
            const fechaFin = new Date(request.fec_fin_eve);
            if (isNaN(fechaFin.getTime())) {
                throw new Error("Formato de fecha de fin inválido");
            }
        }
        // Validar formato de hora
        this.validateTimeFormat(request.hor_ini_eve);
        if (request.hor_fin_eve) {
            this.validateTimeFormat(request.hor_fin_eve);
        }
    }
    validateTimeFormat(timeString) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;
        if (!timeRegex.test(timeString)) {
            throw new Error("Formato de hora inválido. Use HH:MM o HH:MM:SS");
        }
    }
    parseTimeToDate(timeString) {
        const timeParts = timeString.split(":").map(Number);
        const horas = timeParts[0] || 0;
        const minutos = timeParts[1] || 0;
        const segundos = timeParts[2] || 0;
        // Crear Date object con fecha base 1970-01-01
        const fecha = new Date("1970-01-01T00:00:00.000Z");
        fecha.setUTCHours(horas, minutos, segundos, 0);
        return fecha;
    }
}
exports.CreateEventUseCase = CreateEventUseCase;
//# sourceMappingURL=CreateEventUseCase.js.map