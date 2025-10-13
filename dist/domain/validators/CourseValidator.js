"use strict";
/**
 * Course Validator - Domain Layer
 *
 * Responsabilidad única: Validar datos de cursos
 * Aplica SRP separando las validaciones de la entidad
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseValidator = void 0;
class CourseValidator {
    /**
     * Validar todos los datos del curso
     */
    static validate(data) {
        this.validateRequiredFields(data);
        this.validateDates(data.fec_ini_cur, data.fec_fin_cur);
        this.validateDuration(data.dur_cur);
        this.validateCapacity(data.capacidad_max_cur);
        this.validateApprovalCriteria(data.porcentaje_asistencia_aprobacion, data.nota_minima_aprobacion);
        this.validatePrice(data.es_gratuito, data.precio);
        this.validateAudienceType(data.tipo_audiencia_cur);
    }
    /**
     * Validar campos requeridos
     */
    static validateRequiredFields(data) {
        if (!data.nom_cur?.trim()) {
            throw new Error("El nombre del curso es obligatorio");
        }
        if (data.nom_cur.length > 100) {
            throw new Error("El nombre del curso no puede exceder 100 caracteres");
        }
        if (!data.des_cur?.trim()) {
            throw new Error("La descripción del curso es obligatoria");
        }
        if (data.des_cur.length > 500) {
            throw new Error("La descripción no puede exceder 500 caracteres");
        }
        if (!data.dur_cur || data.dur_cur <= 0) {
            throw new Error("La duración debe ser mayor a 0 horas");
        }
        if (!data.fec_ini_cur) {
            throw new Error("La fecha de inicio es obligatoria");
        }
        if (!data.fec_fin_cur) {
            throw new Error("La fecha de fin es obligatoria");
        }
        if (!data.id_cat_cur || data.id_cat_cur <= 0) {
            throw new Error("La categoría del curso es obligatoria");
        }
        if (!data.ced_org_cur?.trim()) {
            throw new Error("La cédula del organizador es obligatoria");
        }
        if (!data.capacidad_max_cur || data.capacidad_max_cur <= 0) {
            throw new Error("La capacidad máxima debe ser mayor a 0");
        }
    }
    /**
     * Validar fechas del curso
     */
    static validateDates(fechaInicio, fechaFin) {
        const now = new Date();
        if (fechaInicio < now) {
            throw new Error("La fecha de inicio no puede ser en el pasado");
        }
        if (fechaFin <= fechaInicio) {
            throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
        }
        // Validar que no sea más de 2 años en el futuro
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 2);
        if (fechaFin > maxDate) {
            throw new Error("La fecha de fin no puede ser más de 2 años en el futuro");
        }
        // Validar duración mínima del curso (al menos 1 día)
        const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 1) {
            throw new Error("El curso debe durar al menos 1 día");
        }
        // Validar duración máxima del curso (máximo 1 año)
        if (diffDays > 365) {
            throw new Error("El curso no puede durar más de 1 año");
        }
    }
    /**
     * Validar duración en horas
     */
    static validateDuration(duracion) {
        if (duracion < 1) {
            throw new Error("La duración mínima del curso es de 1 hora");
        }
        if (duracion > 2000) {
            throw new Error("La duración máxima del curso es de 2000 horas");
        }
    }
    /**
     * Validar capacidad del curso
     */
    static validateCapacity(capacidad) {
        if (capacidad < 1) {
            throw new Error("La capacidad mínima es de 1 persona");
        }
        if (capacidad > 1000) {
            throw new Error("La capacidad máxima es de 1,000 personas");
        }
    }
    /**
     * Validar criterios de aprobación
     */
    static validateApprovalCriteria(porcentajeAsistencia, notaMinima) {
        if (porcentajeAsistencia == null || isNaN(porcentajeAsistencia)) {
            throw new Error("El porcentaje de asistencia es obligatorio");
        }
        if (porcentajeAsistencia < 0 || porcentajeAsistencia > 100) {
            throw new Error("El porcentaje de asistencia debe estar entre 0 y 100");
        }
        if (notaMinima == null || isNaN(notaMinima)) {
            throw new Error("La nota mínima de aprobación es obligatoria");
        }
        if (notaMinima < 0 || notaMinima > 10) {
            throw new Error("La nota mínima debe estar entre 0 y 10");
        }
    }
    /**
     * Validar precio del curso
     */
    static validatePrice(esGratuito, precio) {
        if (!esGratuito) {
            if (!precio || precio <= 0) {
                throw new Error("El precio debe ser mayor a 0 para cursos pagos");
            }
            if (precio > 10000000) {
                throw new Error("El precio no puede superar $10,000,000");
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
        if (!tiposValidos.includes(tipoAudiencia)) {
            throw new Error(`Tipo de audiencia debe ser uno de: ${tiposValidos.join(", ")}`);
        }
    }
    /**
     * Validar nombre del curso individualmente
     */
    static validateName(name) {
        if (!name?.trim()) {
            throw new Error("El nombre del curso no puede estar vacío");
        }
        if (name.length > 100) {
            throw new Error("El nombre del curso no puede exceder 100 caracteres");
        }
    }
    /**
     * Validar descripción del curso individualmente
     */
    static validateDescription(description) {
        if (!description?.trim()) {
            throw new Error("La descripción del curso no puede estar vacía");
        }
        if (description.length > 500) {
            throw new Error("La descripción no puede exceder 500 caracteres");
        }
    }
    /**
     * Validar capacidad individualmente
     */
    static validateCapacityValue(capacity) {
        if (capacity !== undefined) {
            if (capacity <= 0) {
                throw new Error("La capacidad debe ser mayor a 0");
            }
            if (capacity > 1000) {
                throw new Error("La capacidad máxima es de 1,000 personas");
            }
        }
    }
    /**
     * Validar precio individualmente
     */
    static validatePriceValue(price, isFree) {
        if (!isFree && price !== undefined) {
            if (!price || price <= 0) {
                throw new Error("El precio debe ser mayor a 0");
            }
            if (price > 10000000) {
                throw new Error("El precio no puede superar $10,000,000");
            }
        }
    }
    /**
     * Validar duración individualmente
     */
    static validateDurationValue(duration) {
        if (duration !== undefined) {
            if (duration < 1) {
                throw new Error("La duración mínima del curso es de 1 hora");
            }
            if (duration > 2000) {
                throw new Error("La duración máxima del curso es de 2000 horas");
            }
        }
    }
}
exports.CourseValidator = CourseValidator;
//# sourceMappingURL=CourseValidator.js.map