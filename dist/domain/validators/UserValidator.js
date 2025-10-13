"use strict";
/**
 * User Validator - Domain Layer
 *
 * ✅ SRP: Responsabilidad única - Validaciones de usuarios
 * Separado de UserService para cumplir Single Responsibility Principle
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidator = void 0;
class UserValidator {
    /**
     * ✅ SRP: Solo validación de datos de usuario
     */
    static validate(data) {
        if (!data.ced_usu || data.ced_usu.trim().length === 0) {
            throw new Error("La cédula del usuario es requerida");
        }
        if (data.ced_usu.length < 7 || data.ced_usu.length > 10) {
            throw new Error("La cédula debe tener entre 7 y 10 caracteres");
        }
        if (!data.nom_usu1 || data.nom_usu1.trim().length === 0) {
            throw new Error("El primer nombre es requerido");
        }
        if (!data.ape_usu1 || data.ape_usu1.trim().length === 0) {
            throw new Error("El primer apellido es requerido");
        }
        if (!data.email || !this.isValidEmail(data.email)) {
            throw new Error("Email válido es requerido");
        }
        if (data.password && data.password.length < 8) {
            throw new Error("La contraseña debe tener al menos 8 caracteres");
        }
        if (data.tel_usu && !this.isValidPhone(data.tel_usu)) {
            throw new Error("Formato de teléfono inválido");
        }
        if (data.fec_nac_usu && data.fec_nac_usu > new Date()) {
            throw new Error("La fecha de nacimiento no puede ser futura");
        }
        if (data.rol &&
            !["ESTUDIANTE", "ORGANIZADOR", "ADMIN", "DESARROLLADOR"].includes(data.rol)) {
            throw new Error("Rol de usuario inválido");
        }
    }
    /**
     * ✅ SRP: Solo validación de actualización
     */
    static validateUpdate(data) {
        if (data.nom_usu1 !== undefined && data.nom_usu1.trim().length === 0) {
            throw new Error("El primer nombre no puede estar vacío");
        }
        if (data.ape_usu1 !== undefined && data.ape_usu1.trim().length === 0) {
            throw new Error("El primer apellido no puede estar vacío");
        }
        if (data.email && !this.isValidEmail(data.email)) {
            throw new Error("Formato de email inválido");
        }
        if (data.password && data.password.length < 8) {
            throw new Error("La contraseña debe tener al menos 8 caracteres");
        }
        if (data.tel_usu && !this.isValidPhone(data.tel_usu)) {
            throw new Error("Formato de teléfono inválido");
        }
        if (data.fec_nac_usu && data.fec_nac_usu > new Date()) {
            throw new Error("La fecha de nacimiento no puede ser futura");
        }
        if (data.estado &&
            !["ACTIVO", "INACTIVO", "SUSPENDIDO"].includes(data.estado)) {
            throw new Error("Estado de usuario inválido");
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
     * ✅ SRP: Solo validación de edad mínima
     */
    static validateMinimumAge(birthDate, minimumAge = 16) {
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            if (age - 1 < minimumAge) {
                throw new Error(`El usuario debe tener al menos ${minimumAge} años`);
            }
        }
        else if (age < minimumAge) {
            throw new Error(`El usuario debe tener al menos ${minimumAge} años`);
        }
    }
}
exports.UserValidator = UserValidator;
//# sourceMappingURL=UserValidator.js.map