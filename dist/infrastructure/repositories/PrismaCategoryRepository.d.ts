import { PrismaClient } from "@prisma/client";
import { ICategoryRepository, CategoryFilters, CategoryRelationsCount } from "../../domain/repositories/ICategoryRepository";
import { Category } from "../../domain/entities/Category";
/**
 * Implementación concreta del repositorio de categorías usando Prisma
 * Principio DIP: Implementa la interfaz del dominio
 * Principio SRP: Solo se encarga de la persistencia de categorías
 */
export declare class PrismaCategoryRepository implements ICategoryRepository {
    private prisma;
    constructor(prisma: PrismaClient);
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
    /**
     * Mapear datos de Prisma a entidad del dominio
     */
    private mapPrismaToEntity;
}
//# sourceMappingURL=PrismaCategoryRepository.d.ts.map