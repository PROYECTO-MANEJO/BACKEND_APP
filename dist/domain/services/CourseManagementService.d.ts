/**
 * Course Management Service - Domain Layer
 *
 * Servicio de dominio que maneja la lógica de negocio compleja
 * para la gestión de cursos y sus operaciones.
 */
import { Course, CourseData } from "../entities/Course";
import { ICourseRepository } from "../repositories/ICourseRepository";
export interface ICategoryRepository {
    findById(id: number): Promise<any | null>;
    existsById(id: number): Promise<boolean>;
}
export interface IUserRepository {
    findById(id: string): Promise<any | null>;
    exists(id: string): Promise<boolean>;
    findByCareer(careerId: number): Promise<any[]>;
}
export interface ICareerRepository {
    exists(id: number): Promise<boolean>;
    findByIds(ids: number[]): Promise<any[]>;
}
export declare class CourseManagementService {
    private courseRepository;
    private categoryRepository;
    private userRepository;
    private careerRepository;
    constructor(courseRepository: ICourseRepository, categoryRepository: ICategoryRepository, userRepository: IUserRepository, careerRepository: ICareerRepository);
    /**
     * ✅ CREAR CURSO
     */
    createCourse(courseData: CourseData): Promise<Course>;
    /**
     * ✅ ACTUALIZAR CURSO
     */
    updateCourse(courseId: string, updateData: Partial<CourseData>): Promise<Course>;
    /**
     * ✅ CERRAR CURSO
     */
    closeCourse(courseId: string, organizerId: string): Promise<Course>;
    /**
     * ✅ ELIMINAR CURSO
     */
    deleteCourse(courseId: string, organizerId: string): Promise<void>;
    /**
     * ✅ ACTUALIZAR CARRERAS DEL CURSO
     */
    updateCourseCarerIds(courseId: string, careerIds: number[], organizerId: string): Promise<Course>;
    /**
     * ✅ OBTENER CURSOS DISPONIBLES PARA USUARIO
     */
    getAvailableCoursesForUser(userId?: string): Promise<Course[]>;
    /**
     * ✅ OBTENER CURSOS DEL USUARIO
     */
    getUserCourses(userId: string): Promise<Course[]>;
    /**
     * ✅ VERIFICAR DISPONIBILIDAD DE INSCRIPCIÓN
     */
    canUserEnroll(courseId: string, userId: string): Promise<{
        canEnroll: boolean;
        reason?: string;
    }>;
    /**
     * ✅ VALIDACIONES AUXILIARES
     */
    private validateCareerIds;
    /**
     * ✅ OBTENER ESTADÍSTICAS DEL CURSO
     */
    getCourseStatistics(courseId: string): Promise<{
        enrolledCount: number;
        availableSpots: number;
        capacityPercentage: number;
        canEnroll: boolean;
    }>;
    /**
     * ✅ VALIDAR CONFLICTOS DE HORARIO
     */
    validateScheduleConflicts(organizerId: string, startDate: Date, endDate: Date, excludeCourseId?: string): Promise<Course[]>;
}
//# sourceMappingURL=CourseManagementService.d.ts.map