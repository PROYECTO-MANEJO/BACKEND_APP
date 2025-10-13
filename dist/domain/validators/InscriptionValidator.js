"use strict";
/**
 * Inscription Validator - Domain Layer
 *
 * ✅ SRP: Responsabilidad única - Validaciones de inscripciones
 * Separado de InscriptionService para cumplir Single Responsibility Principle
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InscriptionValidator = void 0;
class InscriptionValidator {
    /**
     * ✅ SRP: Solo validación de datos de inscripción
     */
    static validate(data) {
        if (!data.ced_est || data.ced_est.trim().length === 0) {
            throw new Error("La cédula del estudiante es requerida");
        }
        if (data.ced_est.length < 7 || data.ced_est.length > 10) {
            throw new Error("La cédula debe tener entre 7 y 10 caracteres");
        }
        // Validar que se especifique curso o evento, no ambos
        if (!data.id_cur && !data.id_eve) {
            throw new Error("Se debe especificar un curso o un evento");
        }
        if (data.id_cur && data.id_eve) {
            throw new Error("No se puede inscribir tanto en curso como en evento simultáneamente");
        }
        if (!data.fecha_inscripcion) {
            throw new Error("La fecha de inscripción es requerida");
        }
        if (data.fecha_inscripcion > new Date()) {
            throw new Error("La fecha de inscripción no puede ser futura");
        }
        if (!data.estado ||
            !["PENDIENTE", "APROBADA", "RECHAZADA", "CANCELADA"].includes(data.estado)) {
            throw new Error("El estado debe ser PENDIENTE, APROBADA, RECHAZADA o CANCELADA");
        }
    }
    /**
     * ✅ SRP: Solo validación de documentos requeridos
     */
    static validateRequiredDocuments(data, requiresDocuments, requiresMotivationLetter) {
        if (requiresDocuments) {
            if (!data.documento_identidad ||
                data.documento_identidad.trim().length === 0) {
                throw new Error("El documento de identidad es requerido");
            }
            if (!data.documento_comprobante ||
                data.documento_comprobante.trim().length === 0) {
                throw new Error("El documento comprobante es requerido");
            }
        }
        if (requiresMotivationLetter) {
            if (!data.carta_motivacion || data.carta_motivacion.trim().length === 0) {
                throw new Error("La carta de motivación es requerida");
            }
            if (data.carta_motivacion.length < 100) {
                throw new Error("La carta de motivación debe tener al menos 100 caracteres");
            }
        }
    }
    /**
     * ✅ SRP: Solo validación de cupos disponibles
     */
    static validateCapacity(currentInscriptions, maxCapacity) {
        if (currentInscriptions >= maxCapacity) {
            throw new Error("No hay cupos disponibles");
        }
    }
    /**
     * ✅ SRP: Solo validación de fechas de inscripción
     */
    static validateInscriptionPeriod(startDate, endDate) {
        const now = new Date();
        if (now < startDate) {
            throw new Error("El período de inscripción aún no ha comenzado");
        }
        if (now > endDate) {
            throw new Error("El período de inscripción ha finalizado");
        }
    }
}
exports.InscriptionValidator = InscriptionValidator;
//# sourceMappingURL=InscriptionValidator.js.map