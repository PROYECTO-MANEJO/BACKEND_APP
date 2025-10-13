"use strict";
/**
 * Category Validator - Domain Layer
 *
 * ✅ SRP: Responsabilidad única - Validaciones de categorías
 * Separado de CategoryService para cumplir Single Responsibility Principle
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryValidator = void 0;
class CategoryValidator {
    /**
     * ✅ SRP: Solo validación de datos de categoría
     */
    static validate(data) {
        if (!data.nom_cat || data.nom_cat.trim().length === 0) {
            throw new Error("El nombre de la categoría es requerido");
        }
        if (data.nom_cat.length > 50) {
            throw new Error("El nombre de la categoría no puede exceder 50 caracteres");
        }
        if (!data.des_cat || data.des_cat.trim().length === 0) {
            throw new Error("La descripción de la categoría es requerida");
        }
        if (data.des_cat.length > 255) {
            throw new Error("La descripción no puede exceder 255 caracteres");
        }
        if (!data.tipo_categoria ||
            !["CURSO", "EVENTO", "GENERAL"].includes(data.tipo_categoria)) {
            throw new Error("El tipo de categoría debe ser CURSO, EVENTO o GENERAL");
        }
    }
    /**
     * ✅ SRP: Solo validación de actualización
     */
    static validateUpdate(data) {
        if (data.nom_cat !== undefined && data.nom_cat.trim().length === 0) {
            throw new Error("El nombre de la categoría no puede estar vacío");
        }
        if (data.nom_cat && data.nom_cat.length > 50) {
            throw new Error("El nombre de la categoría no puede exceder 50 caracteres");
        }
        if (data.des_cat !== undefined && data.des_cat.trim().length === 0) {
            throw new Error("La descripción no puede estar vacía");
        }
        if (data.des_cat && data.des_cat.length > 255) {
            throw new Error("La descripción no puede exceder 255 caracteres");
        }
        if (data.tipo_categoria &&
            !["CURSO", "EVENTO", "GENERAL"].includes(data.tipo_categoria)) {
            throw new Error("El tipo de categoría debe ser CURSO, EVENTO o GENERAL");
        }
        if (data.estado && !["ACTIVA", "INACTIVA"].includes(data.estado)) {
            throw new Error("El estado debe ser ACTIVA o INACTIVA");
        }
    }
    /**
     * ✅ SRP: Solo validación de nombre único por tipo
     */
    static validateUniqueNameByType(name, type, existingCategories) {
        const exists = existingCategories.some((cat) => cat.nom_cat.toLowerCase() === name.toLowerCase() &&
            cat.tipo_categoria === type);
        if (exists) {
            throw new Error(`Ya existe una categoría "${name}" para el tipo "${type}"`);
        }
    }
}
exports.CategoryValidator = CategoryValidator;
//# sourceMappingURL=CategoryValidator.js.map