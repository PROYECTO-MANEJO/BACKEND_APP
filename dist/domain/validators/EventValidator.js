"use strict";
/**
 * Event Validator - Domain Layer
 *
 * Responsabilidad única: Validar datos de eventos
 * Aplica SRP separando las validaciones de la entidad
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventValidator = void 0;
class EventValidator {
    /**
     * Validar todos los datos del evento
     */
    static validate(data) {
        this.validateRequiredFields(data);
        this.validateDates(data.fec_ini_eve, data.fec_fin_eve);
        this.validateTimes(data.hor_ini_eve, data.hor_fin_eve);
        this.validateDuration(data.dur_eve);
        this.validateCapacity(data.capacidad_max_eve);
        this.validateAttendancePercentage(data.porcentaje_asistencia_aprobacion);
        this.validatePrice(data.es_gratuito, data.precio);
        this.validateAudienceType(data.tipo_audiencia_eve);
    }
    /**
     * Validar campos requeridos
     */
    static validateRequiredFields(data) {
        if (!data.nom_eve?.trim()) {
            throw new Error("El nombre del evento es requerido");
        }
        if (data.nom_eve.length > 100) {
            throw new Error("El nombre del evento no puede exceder 100 caracteres");
        }
        if (!data.des_eve?.trim()) {
            throw new Error("La descripción del evento es requerida");
        }
        if (data.des_eve.length > 500) {
            throw new Error("La descripción no puede exceder 500 caracteres");
        }
        if (!data.are_eve?.trim()) {
            throw new Error("El área del evento es requerida");
        }
        if (!data.ubi_eve?.trim()) {
            throw new Error("La ubicación del evento es requerida");
        }
        if (!data.ced_org_eve?.trim()) {
            throw new Error("El organizador del evento es requerido");
        }
    }
    /**
     * Validar fechas del evento
     */
    static validateDates(fechaInicio, fechaFin) {
        if (!fechaInicio) {
            throw new Error("La fecha de inicio es requerida");
        }
        // Obtener fecha actual en la zona horaria local
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        // Convertir fecha de inicio a objeto Date
        const startDate = new Date(fechaInicio);
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        // Permitir fechas desde hoy en adelante
        if (startDateOnly < today) {
            throw new Error("La fecha de inicio no puede ser anterior a hoy");
        }
        if (fechaFin) {
            const endDate = new Date(fechaFin);
            const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            if (endDateOnly < startDateOnly) {
                throw new Error("La fecha de fin no puede ser anterior a la fecha de inicio");
            }
            // Validar que no sea muy lejana (máximo 2 años)
            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() + 2);
            if (endDate > maxDate) {
                throw new Error("La fecha de fin no puede ser mayor a 2 años");
            }
        }
    }
    /**
     * Validar horarios del evento
     */
    static validateTimes(horaInicio, horaFin) {
        if (!horaInicio) {
            throw new Error("La hora de inicio es requerida");
        }
        if (horaFin) {
            const startTime = new Date(horaInicio).getTime();
            const endTime = new Date(horaFin).getTime();
            if (endTime <= startTime) {
                throw new Error("La hora de fin debe ser posterior a la hora de inicio");
            }
            // Validar duración máxima (12 horas por día)
            const maxDuration = 12 * 60 * 60 * 1000; // 12 horas en millisegundos
            if (endTime - startTime > maxDuration) {
                throw new Error("La duración del evento no puede exceder 12 horas por día");
            }
        }
    }
    /**
     * Validar duración del evento
     */
    static validateDuration(duracion) {
        if (duracion == null || duracion <= 0) {
            throw new Error("La duración del evento debe ser mayor a 0 horas");
        }
        if (duracion > 720) {
            // 720 horas = 1 mes aproximadamente
            throw new Error("La duración del evento no puede exceder 720 horas");
        }
    }
    /**
     * Validar capacidad máxima
     */
    static validateCapacity(capacidad) {
        if (capacidad == null || capacidad <= 0) {
            throw new Error("La capacidad máxima debe ser mayor a 0");
        }
        if (capacidad > 10000) {
            throw new Error("La capacidad máxima no puede exceder 10,000 personas");
        }
    }
    /**
     * Validar porcentaje de asistencia para aprobación
     */
    static validateAttendancePercentage(porcentaje) {
        if (porcentaje == null || porcentaje < 0 || porcentaje > 100) {
            throw new Error("El porcentaje de asistencia debe estar entre 0 y 100");
        }
    }
    /**
     * Validar precio del evento
     */
    static validatePrice(esGratuito, precio) {
        if (esGratuito) {
            if (precio != null && precio > 0) {
                throw new Error("Un evento gratuito no puede tener precio mayor a 0");
            }
        }
        else {
            if (precio == null || precio <= 0) {
                throw new Error("Un evento no gratuito debe tener un precio mayor a 0");
            }
            if (precio > 10000) {
                throw new Error("El precio del evento no puede exceder $10,000");
            }
        }
    }
    /**
     * Validar tipo de audiencia
     */
    static validateAudienceType(tipoAudiencia) {
        const tiposValidos = [
            "CARRERA_ESPECIFICA",
            "TODAS_CARRERAS",
            "PUBLICO_GENERAL",
        ];
        if (!tipoAudiencia || !tiposValidos.includes(tipoAudiencia)) {
            throw new Error(`Tipo de audiencia inválido. Debe ser uno de: ${tiposValidos.join(", ")}`);
        }
    }
    /**
     * Validar nombre del evento individualmente
     */
    static validateName(name) {
        if (!name?.trim()) {
            throw new Error("El nombre del evento no puede estar vacío");
        }
        if (name.length > 100) {
            throw new Error("El nombre del evento no puede exceder 100 caracteres");
        }
    }
    /**
     * Validar descripción del evento individualmente
     */
    static validateDescription(description) {
        if (!description?.trim()) {
            throw new Error("La descripción del evento no puede estar vacía");
        }
        if (description.length > 500) {
            throw new Error("La descripción no puede exceder 500 caracteres");
        }
    }
    /**
     * Validar capacidad individualmente
     */
    static validateCapacityValue(capacity) {
        if (capacity !== undefined && capacity <= 0) {
            throw new Error("La capacidad debe ser mayor a 0");
        }
    }
    /**
     * Validar precio individualmente
     */
    static validatePriceValue(price, isFree) {
        if (!isFree && price !== undefined && (!price || price <= 0)) {
            throw new Error("El precio debe ser mayor a 0");
        }
    }
}
exports.EventValidator = EventValidator;
//# sourceMappingURL=EventValidator.js.map