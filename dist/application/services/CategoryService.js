"use strict";
/**
 * Category Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Operaciones de negocio para categorías
 * Separado del controlador para cumplir Single Responsibility Principle
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const CategoryValidator_1 = require("../../domain/validators/CategoryValidator");
class CategoryService {
    constructor(container) {
        this.container = container;
    }
    /**
     * ✅ SRP: Crear nueva categoría
     */
    async createCategory(categoryRequest) {
        // ✅ SRP: Delegar validación al CategoryValidator
        CategoryValidator_1.CategoryValidator.validate({
            nom_cat: categoryRequest.nom_cat,
            des_cat: categoryRequest.des_cat,
            tipo_categoria: categoryRequest.tipo_categoria,
        });
        // ✅ SRP: Validar nombre único por tipo (simulado)
        const existingCategories = []; // Simulado
        CategoryValidator_1.CategoryValidator.validateUniqueNameByType(categoryRequest.nom_cat, categoryRequest.tipo_categoria, existingCategories);
        // ✅ SRP: Lógica de creación de categoría
        // NOTA: Este es un archivo de demostración - no conectado al sistema real
        console.log("CategoryService.createCategory - Archivo de demostración SRP");
        return {
            message: "Category creation logic would go here",
            data: categoryRequest,
        };
    }
    /**
     * ✅ SRP: Obtener todas las categorías
     */
    async getAllCategories() {
        // ✅ SRP: Lógica de obtención de categorías
        console.log("CategoryService.getAllCategories - Archivo de demostración SRP");
        return [{ message: "Category fetching logic would go here" }];
    }
    /**
     * ✅ SRP: Obtener categorías por tipo
     */
    async getCategoriesByType(type) {
        // ✅ SRP: Lógica de obtención por tipo
        console.log("CategoryService.getCategoriesByType - Archivo de demostración SRP", type);
        return [
            { message: "Categories by type fetching logic would go here", type },
        ];
    }
    /**
     * ✅ SRP: Obtener categoría por ID
     */
    async getCategoryById(id) {
        // ✅ SRP: Lógica de obtención por ID
        console.log("CategoryService.getCategoryById - Archivo de demostración SRP", id);
        return {
            message: "Category by ID fetching logic would go here",
            id,
        };
    }
    /**
     * ✅ SRP: Actualizar categoría
     */
    async updateCategory(id, updateRequest) {
        // ✅ SRP: Delegar validación al CategoryValidator
        CategoryValidator_1.CategoryValidator.validateUpdate(updateRequest);
        // ✅ SRP: Lógica de actualización
        console.log("CategoryService.updateCategory - Archivo de demostración SRP", id, updateRequest);
        return {
            message: "Category update logic would go here",
            id,
            data: updateRequest,
        };
    }
    /**
     * ✅ SRP: Eliminar categoría
     */
    async deleteCategory(id) {
        // ✅ SRP: Lógica de eliminación
        console.log("CategoryService.deleteCategory - Archivo de demostración SRP", id);
    }
}
exports.CategoryService = CategoryService;
//# sourceMappingURL=CategoryService.js.map