/**
 * Category Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Operaciones de negocio para categorías
 * Separado del controlador para cumplir Single Responsibility Principle
 */
import { DIContainer } from "../../infrastructure/DIContainer";
export interface CreateCategoryRequest {
    nom_cat: string;
    des_cat: string;
    tipo_categoria: string;
}
export interface UpdateCategoryRequest {
    nom_cat?: string;
    des_cat?: string;
    tipo_categoria?: string;
    estado?: string;
}
export declare class CategoryService {
    private container;
    constructor(container: DIContainer);
    /**
     * ✅ SRP: Crear nueva categoría
     */
    createCategory(categoryRequest: CreateCategoryRequest): Promise<any>;
    /**
     * ✅ SRP: Obtener todas las categorías
     */
    getAllCategories(): Promise<any[]>;
    /**
     * ✅ SRP: Obtener categorías por tipo
     */
    getCategoriesByType(type: string): Promise<any[]>;
    /**
     * ✅ SRP: Obtener categoría por ID
     */
    getCategoryById(id: string): Promise<any | null>;
    /**
     * ✅ SRP: Actualizar categoría
     */
    updateCategory(id: string, updateRequest: UpdateCategoryRequest): Promise<any>;
    /**
     * ✅ SRP: Eliminar categoría
     */
    deleteCategory(id: string): Promise<void>;
}
//# sourceMappingURL=CategoryService.d.ts.map