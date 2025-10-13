"use strict";
/**
 * Organizer Validator - Domain Layer
 *
 * ✅ SRP: Responsabilidad única - Validaciones de organizadores
 * Separado de OrganizerService para cumplir Single Responsibility Principle
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizerValidator = void 0;
class OrganizerValidator {
    /**
     * ✅ SRP: Solo validación de datos de organizador
     */
    static validate(data) {
        if (!data.ced_org || data.ced_org.trim().length === 0) {
            throw new Error("La cédula del organizador es requerida");
        }
        if (data.ced_org.length < 7 || data.ced_org.length > 10) {
            throw new Error("La cédula debe tener entre 7 y 10 caracteres");
        }
        if (!data.nom_org1 || data.nom_org1.trim().length === 0) {
            throw new Error("El primer nombre es requerido");
        }
        if (!data.ape_org1 || data.ape_org1.trim().length === 0) {
            throw new Error("El primer apellido es requerido");
        }
        if (!data.email || !this.isValidEmail(data.email)) {
            throw new Error("Email válido es requerido");
        }
        if (data.tel_org && !this.isValidPhone(data.tel_org)) {
            throw new Error("Formato de teléfono inválido");
        }
        if (data.experiencia_anos !== undefined && data.experiencia_anos < 0) {
            throw new Error("Los años de experiencia no pueden ser negativos");
        }
        if (data.experiencia_anos !== undefined && data.experiencia_anos > 50) {
            throw new Error("Los años de experiencia no pueden exceder 50 años");
        }
    }
    /**
     * ✅ SRP: Solo validación de actualización
     */
    static validateUpdate(data) {
        if (data.nom_org1 !== undefined && data.nom_org1.trim().length === 0) {
            throw new Error("El primer nombre no puede estar vacío");
        }
        if (data.ape_org1 !== undefined && data.ape_org1.trim().length === 0) {
            throw new Error("El primer apellido no puede estar vacío");
        }
        if (data.email && !this.isValidEmail(data.email)) {
            throw new Error("Formato de email inválido");
        }
        if (data.tel_org && !this.isValidPhone(data.tel_org)) {
            throw new Error("Formato de teléfono inválido");
        }
        if (data.experiencia_anos !== undefined && data.experiencia_anos < 0) {
            throw new Error("Los años de experiencia no pueden ser negativos");
        }
        if (data.experiencia_anos !== undefined && data.experiencia_anos > 50) {
            throw new Error("Los años de experiencia no pueden exceder 50 años");
        }
        if (data.estado &&
            !["ACTIVO", "INACTIVO", "SUSPENDIDO"].includes(data.estado)) {
            throw new Error("Estado de organizador inválido");
        }
    }
    /**
     * ✅ SRP: Solo validación de email
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    /**
     * ✅ SRP: Solo validación de teléfono
     */
    static isValidPhone(phone) {
        const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
        return phoneRegex.test(phone);
    }
    /**
     * ✅ SRP: Solo validación de capacitación requerida
     */
    static validateRequiredTraining(tituloAcademico, experiencia, especialidad) {
        if (!tituloAcademico || tituloAcademico.trim().length === 0) {
            throw new Error("El título académico es requerido para ser organizador");
        }
        if (!experiencia || experiencia < 1) {
            throw new Error("Se requiere al menos 1 año de experiencia");
        }
        if (!especialidad || especialidad.trim().length === 0) {
            throw new Error("La especialidad es requerida");
        }
    }
}
exports.OrganizerValidator = OrganizerValidator;
//# sourceMappingURL=OrganizerValidator.js.map