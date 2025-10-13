/**
 * Category Validator - Domain Layer
 *
 * ✅ SRP: Responsabilidad única - Validaciones de categorías
 * Separado de CategoryService para cumplir Single Responsibility Principle
 */
export interface CategoryValidationData {
    nom_cat?: string;
    des_cat?: string;
    tipo_categoria?: string;
    estado?: string;
}
export declare class CategoryValidator {
    /**
     * ✅ SRP: Solo validación de datos de categoría
     */
    static validate(data: CategoryValidationData): void;
    /**
     * ✅ SRP: Solo validación de actualización
     */
    static validateUpdate(data: Partial<CategoryValidationData>): void;
    /**
     * ✅ SRP: Solo validación de nombre único por tipo
     */
    static validateUniqueNameByType(name: string, type: string, existingCategories: Array<{
        nom_cat: string;
        tipo_categoria: string;
    }>): void;
}
//# sourceMappingURL=CategoryValidator.d.ts.map