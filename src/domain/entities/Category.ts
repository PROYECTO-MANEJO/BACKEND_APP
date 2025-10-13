import { BaseEntity } from "../../shared/interfaces/BaseInterfaces";

/**
 * Entidad Categoría del dominio
 * Principio SRP: Solo representa la información de la categoría
 */
export interface Category extends BaseEntity {
  name: string;
  description: string;

  // Relaciones (opcionales para evitar dependencias circulares)
  events?: any[];
  courses?: any[];
}

/**
 * DTO para crear una categoría
 * Principio SRP: Solo para transferencia de datos de creación
 */
export interface CreateCategoryDto {
  name: string;
  description: string;
}

/**
 * DTO para actualizar una categoría
 * Principio SRP: Solo para transferencia de datos de actualización
 */
export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}

/**
 * Respuesta completa de la categoría con estadísticas
 */
export interface CategoryWithStats extends Category {
  eventsCount?: number;
  coursesCount?: number;
  totalItemsCount?: number;
}
