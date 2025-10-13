"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareerEntity = void 0;
/**
 * Clase Career con métodos de dominio
 */
class CareerEntity {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.code = data.code;
        this.faculty = data.faculty;
        this.isActive = data.isActive;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
    /**
     * Valida si la carrera está activa
     */
    canAcceptStudents() {
        return this.isActive;
    }
    /**
     * Obtiene nombre completo de la carrera
     */
    getFullName() {
        return `${this.name} - ${this.faculty}`;
    }
    /**
     * Valida si el código de carrera es válido
     */
    static isValidCode(code) {
        return Boolean(code && code.length >= 2 && code.length <= 10);
    }
}
exports.CareerEntity = CareerEntity;
//# sourceMappingURL=Career.js.map