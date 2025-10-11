/**
 * ICourseRepository Interface - Domain Layer
 * 
 * Interfaz que define el contrato para el repositorio de cursos.
 * Contiene todas las operaciones necesarias para la persistencia.
 */

import { Course } from '../entities/Course';

export interface ICourseRepository {
  // ✅ CRUD BÁSICO
  create(course: Course): Promise<Course>;
  findById(id: string): Promise<Course | null>;
  findAll(): Promise<Course[]>;
  update(id: string, course: Course): Promise<Course>;
  delete(id: string): Promise<void>;

  // ✅ CONSULTAS POR FILTROS BÁSICOS
  findByOrganizer(organizerId: string): Promise<Course[]>;
  findByCategory(categoryId: number): Promise<Course[]>;
  findByStatus(status: string): Promise<Course[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Course[]>;

  // ✅ CONSULTAS ESPECIALIZADAS
  findAvailableCourses(userId?: string): Promise<Course[]>;
  findUserCourses(userId: string): Promise<Course[]>;
  findActiveByDateRange(startDate: Date, endDate: Date): Promise<Course[]>;
  findUpcomingCourses(): Promise<Course[]>;
  findInProgressCourses(): Promise<Course[]>;
  findFinishedCourses(): Promise<Course[]>;

  // ✅ CONSULTAS DE INSCRIPCIONES Y CAPACIDAD
  getEnrolledCount(courseId: string): Promise<number>;
  isUserEnrolled(courseId: string, userId: string): Promise<boolean>;
  hasAvailableCapacity(courseId: string): Promise<boolean>;
  getEnrolledUsers(courseId: string): Promise<any[]>;

  // ✅ GESTIÓN DE CARRERAS
  getCourseCareerIds(courseId: string): Promise<number[]>;
  updateCourseCareerIds(courseId: string, careerIds: number[]): Promise<void>;
  findByCareerIds(careerIds: number[]): Promise<Course[]>;

  // ✅ VALIDACIONES DE NEGOCIO
  findConflictingCourses(
    organizerId: string, 
    startDate: Date, 
    endDate: Date, 
    excludeCourseId?: string
  ): Promise<Course[]>;
  
  existsById(id: string): Promise<boolean>;
  countByOrganizer(organizerId: string): Promise<number>;
  countByCategory(categoryId: number): Promise<number>;

  // ✅ CONSULTAS CON PAGINACIÓN
  findAllPaginated(page: number, limit: number): Promise<{
    courses: Course[];
    total: number;
    totalPages: number;
    currentPage: number;
  }>;

  findByOrganizerPaginated(organizerId: string, page: number, limit: number): Promise<{
    courses: Course[];
    total: number;
    totalPages: number;
    currentPage: number;
  }>;

  // ✅ CONSULTAS CON FILTROS AVANZADOS
  findWithFilters(filters: {
    organizerId?: string;
    categoryId?: number;
    status?: string;
    audienceType?: string;
    isFree?: boolean;
    startDate?: Date;
    endDate?: Date;
    searchTerm?: string;
  }): Promise<Course[]>;

  // ✅ ESTADÍSTICAS Y REPORTES
  getStatistics(): Promise<{
    totalCourses: number;
    activeCourses: number;
    finishedCourses: number;
    totalEnrollments: number;
    averageCapacityUsage: number;
  }>;

  getCourseStatistics(courseId: string): Promise<{
    enrolledCount: number;
    completedCount?: number;
    averageAttendance?: number;
    averageGrade?: number;
  }>;
}