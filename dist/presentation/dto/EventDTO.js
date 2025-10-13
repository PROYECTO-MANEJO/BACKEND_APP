"use strict";
/**
 * Event DTOs - Presentation Layer
 *
 * Responsabilidad única: Transformación y formateo de datos de eventos
 * Aplica SRP separando las transformaciones del controlador
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDTOTransformer = void 0;
class EventDTOTransformer {
    /**
     * Convertir Event entity a ResponseDTO
     */
    static toResponseDTO(event) {
        return {
            id_eve: event.id,
            nom_eve: event.nom_eve,
            des_eve: event.des_eve,
            fec_ini_eve: event.fec_ini_eve,
            fec_fin_eve: event.fec_fin_eve,
            hor_ini_eve: event.hor_ini_eve,
            hor_fin_eve: event.hor_fin_eve,
            dur_eve: event.dur_eve,
            are_eve: event.are_eve,
            ubi_eve: event.ubi_eve,
            capacidad_max_eve: event.capacidad_max_eve,
            precio: event.precio,
            es_gratuito: event.es_gratuito,
            tipo_audiencia_eve: event.tipo_audiencia_eve,
            porcentaje_asistencia_aprobacion: event.porcentaje_asistencia_aprobacion,
            estado: event.estado_eve,
        };
    }
    /**
     * Convertir múltiples Events a ResponseDTOs
     */
    static toResponseDTOList(events) {
        return events.map((event) => this.toResponseDTO(event));
    }
    /**
     * Convertir DTO de entrada a datos del dominio
     */
    static fromCreateDTO(dto) {
        // Convertir strings de fecha y hora a objetos Date
        const fechaInicio = new Date(dto.fec_ini_eve);
        const fechaFin = dto.fec_fin_eve ? new Date(dto.fec_fin_eve) : undefined;
        return {
            nom_eve: dto.nom_eve,
            des_eve: dto.des_eve,
            id_cat_eve: dto.id_cat_eve,
            fec_ini_eve: fechaInicio,
            fec_fin_eve: fechaFin,
            hor_ini_eve: this.convertTimeStringToDate(dto.hor_ini_eve),
            hor_fin_eve: dto.hor_fin_eve
                ? this.convertTimeStringToDate(dto.hor_fin_eve)
                : undefined,
            dur_eve: dto.dur_eve,
            are_eve: dto.are_eve,
            ubi_eve: dto.ubi_eve,
            ced_org_eve: dto.ced_org_eve,
            capacidad_max_eve: dto.capacidad_max_eve,
            tipo_audiencia_eve: dto.tipo_audiencia_eve || "PUBLICO_GENERAL",
            es_gratuito: dto.es_gratuito || false,
            precio: dto.es_gratuito ? 0 : dto.precio || 0,
            porcentaje_asistencia_aprobacion: dto.porcentaje_asistencia_aprobacion,
            carreras: dto.carreras,
        };
    }
    /**
     * Convertir string de hora a objeto Date
     */
    static convertTimeStringToDate(timeString) {
        if (!timeString) {
            throw new Error("Time string is required");
        }
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;
        if (!timeRegex.test(timeString)) {
            throw new Error("Invalid time format. Use HH:MM:SS or HH:MM");
        }
        const parts = timeString.split(":").map(Number);
        const horas = parts[0] ?? 0;
        const minutos = parts[1] ?? 0;
        const segundos = parts[2] ?? 0;
        if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
            throw new Error("Invalid time format");
        }
        const fecha = new Date("1970-01-01T00:00:00.000Z");
        fecha.setUTCHours(horas, minutos, segundos, 0);
        return fecha;
    }
    /**
     * Validar formato de fecha
     */
    static validateDateFormat(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error("Invalid date format. Use YYYY-MM-DD format");
        }
        return date;
    }
    /**
     * Validar tipos de datos básicos
     */
    static validateBasicTypes(dto) {
        if (typeof dto.dur_eve !== "number" || dto.dur_eve <= 0) {
            throw new Error("Duration must be a positive number");
        }
        if (typeof dto.capacidad_max_eve !== "number" ||
            dto.capacidad_max_eve <= 0) {
            throw new Error("Maximum capacity must be a positive number");
        }
        if (typeof dto.porcentaje_asistencia_aprobacion !== "number" ||
            dto.porcentaje_asistencia_aprobacion < 0 ||
            dto.porcentaje_asistencia_aprobacion > 100) {
            throw new Error("Attendance percentage must be a number between 0 and 100");
        }
    }
}
exports.EventDTOTransformer = EventDTOTransformer;
//# sourceMappingURL=EventDTO.js.map