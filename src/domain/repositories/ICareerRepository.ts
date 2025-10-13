import { Career } from "../entities/Career";

/**
 * Interfaz del repositorio para la gestión de carreras
 * Sigue el principio de inversión de dependencias (DIP) de SOLID
 */
export interface ICareerRepository {
  /**
   * Crear una nueva carrera
   */
  create(careerData: Partial<Career>): Promise<Career>;

  /**
   * Buscar carrera por ID
   */
  findById(id: string): Promise<Career | null>;

  /**
   * Obtener todas las carreras
   */
  findAll(): Promise<Career[]>;

  /**
   * Actualizar carrera por ID
   */
  update(id: string, careerData: Partial<Career>): Promise<Career | null>;

  /**
   * Eliminar carrera por ID
   */
  delete(id: string): Promise<void>;

  /**
   * Buscar carreras con filtros
   */
  findWithFilters(filters: CareerFilters): Promise<Career[]>;

  /**
   * Verificar si existe una carrera con el ID dado
   */
  existsById(id: string): Promise<boolean>;

  /**
   * Buscar carreras por nombre
   */
  findByName(name: string): Promise<Career[]>;

  /**
   * Obtener usuarios asociados a una carrera
   */
  findUsersById(id: string): Promise<any[]>;

  /**
   * Obtener eventos asociados a una carrera
   */
  findEventsById(id: string): Promise<any[]>;

  /**
   * Obtener cursos asociados a una carrera
   */
  findCoursesById(id: string): Promise<any[]>;

  /**
   * Verificar si una carrera puede ser eliminada (no tiene usuarios/eventos/cursos)
   */
  canBeDeleted(id: string): Promise<boolean>;

  /**
   * Contar usuarios, eventos y cursos asociados a una carrera
   */
  countRelatedItems(id: string): Promise<CareerRelationsCount>;

  /**
   * Obtener estadísticas de carreras
   */
  getCareerStats(): Promise<CareerStats>;
}

/**
 * Filtros para búsqueda de carreras
 */
export interface CareerFilters {
  name?: string;
  faculty?: string;
  hasUsers?: boolean;
  hasEvents?: boolean;
  hasCourses?: boolean;
  search?: string;
}

/**
 * Contador de relaciones de una carrera
 */
export interface CareerRelationsCount {
  usersCount: number;
  eventsCount: number;
  coursesCount: number;
  totalCount: number;
}

/**
 * Estadísticas de carreras
 */
export interface CareerStats {
  totalCareers: number;
  careersWithUsers: number;
  careersWithEvents: number;
  careersWithCourses: number;
  averageUsersPerCareer: number;
  averageEventsPerCareer: number;
  averageCoursesPerCareer: number;
}
