import { Category } from "../entities/Category";
/**
 * Interfaz del repositorio para la gestión de categorías de eventos y cursos
 * Sigue el principio de inversión de dependencias (DIP) de SOLID
 */
export interface ICategoryRepository {
    /**
     * Crear una nueva categoría
     */
    create(categoryData: Partial<Category>): Promise<Category>;
    /**
     * Buscar categoría por ID
     */
    findById(id: string): Promise<Category | null>;
    /**
     * Obtener todas las categorías
     */
    findAll(): Promise<Category[]>;
    /**
     * Actualizar categoría por ID
     */
    update(id: string, categoryData: Partial<Category>): Promise<Category | null>;
    /**
     * Eliminar categoría por ID
     */
    delete(id: string): Promise<void>;
    /**
     * Buscar categorías con filtros
     */
    findWithFilters(filters: CategoryFilters): Promise<Category[]>;
    /**
     * Verificar si existe una categoría con el ID dado
     */
    existsById(id: string): Promise<boolean>;
    /**
     * Buscar categorías por nombre
     */
    findByName(name: string): Promise<Category[]>;
    /**
     * Obtener eventos asociados a una categoría
     */
    findEventsById(id: string): Promise<any[]>;
    /**
     * Obtener cursos asociados a una categoría
     */
    findCoursesById(id: string): Promise<any[]>;
    /**
     * Verificar si una categoría puede ser eliminada (no tiene eventos/cursos)
     */
    canBeDeleted(id: string): Promise<boolean>;
    /**
     * Contar eventos y cursos asociados a una categoría
     */
    countRelatedItems(id: string): Promise<CategoryRelationsCount>;
}
/**
 * Filtros para búsqueda de categorías
 */
export interface CategoryFilters {
    name?: string;
    description?: string;
    hasEvents?: boolean;
    hasCourses?: boolean;
    search?: string;
}
/**
 * Contador de relaciones de una categoría
 */
export interface CategoryRelationsCount {
    eventsCount: number;
    coursesCount: number;
    totalCount: number;
}
//# sourceMappingURL=ICategoryRepository.d.ts.map