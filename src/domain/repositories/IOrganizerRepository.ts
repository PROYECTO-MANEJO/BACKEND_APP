import { Organizador } from "../entities/Organizador";

/**
 * Interfaz del repositorio para la gestión de organizadores
 * Sigue el principio de inversión de dependencias (DIP) de SOLID
 */
export interface IOrganizerRepository {
  /**
   * Crear un nuevo organizador
   */
  create(organizadorData: Partial<Organizador>): Promise<Organizador>;

  /**
   * Buscar organizador por cédula
   */
  findByCedula(cedula: string): Promise<Organizador | null>;

  /**
   * Buscar organizador por ID
   */
  findById(id: string): Promise<Organizador | null>;

  /**
   * Obtener todos los organizadores
   */
  findAll(): Promise<Organizador[]>;

  /**
   * Actualizar organizador por cédula
   */
  update(
    cedula: string,
    organizadorData: Partial<Organizador>
  ): Promise<Organizador | null>;

  /**
   * Eliminar organizador por cédula
   */
  delete(cedula: string): Promise<void>;

  /**
   * Buscar organizadores con filtros
   */
  findWithFilters(filters: OrganizerFilters): Promise<Organizador[]>;

  /**
   * Verificar si existe un organizador con la cédula dada
   */
  existsByCedula(cedula: string): Promise<boolean>;

  /**
   * Obtener eventos asociados a un organizador
   */
  findEventsByCedula(cedula: string): Promise<any[]>;

  /**
   * Obtener cursos asociados a un organizador
   */
  findCoursesByCedula(cedula: string): Promise<any[]>;
}

/**
 * Filtros para búsqueda de organizadores
 */
export interface OrganizerFilters {
  name?: string;
  academicTitle?: string;
  hasEvents?: boolean;
  hasCourses?: boolean;
  search?: string;
}
