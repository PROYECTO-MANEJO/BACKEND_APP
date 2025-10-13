/**
 * Course Business Rules - Domain Layer
 *
 * Responsabilidad única: TODAS las reglas de negocio y operaciones para cursos
 * Aplica SRP separando completamente la lógica de negocio de la entidad
 */
import { CourseData, Course } from "../entities/Course";
export declare class CourseBusinessRules {
    /**
     * Verificar si un curso puede ser editado
     */
    static canBeEdited(course: CourseData): boolean;
    /**
     * Verificar si un curso puede ser cancelado
     */
    static canBeCanceled(course: CourseData): boolean;
    /**
     * Verificar si un curso está activo para inscripciones
     */
    static isOpenForRegistration(course: CourseData): boolean;
    /**
     * Verificar si la capacidad está llena
     */
    static isCapacityFull(course: CourseData): boolean;
    /**
     * Calcular prioridad del curso
     */
    static calculatePriority(course: CourseData): number;
    /**
     * Verificar si hay conflicto de horarios
     */
    static hasScheduleConflict(course: CourseData, otherCourses: CourseData[]): boolean;
    /**
     * Verificar si un curso puede ser actualizado
     */
    static canBeUpdated(course: CourseData): boolean;
    /**
     * Verificar si un curso puede ser eliminado
     */
    static canBeDeleted(course: CourseData): boolean;
    /**
     * Verificar si un curso puede ser cerrado
     */
    static canBeClosed(course: CourseData): boolean;
    /**
     * Verificar si un curso está activo
     */
    static isActive(course: CourseData): boolean;
    /**
     * Verificar si un curso es próximo (futuro)
     */
    static isUpcoming(course: CourseData): boolean;
    /**
     * Verificar si un curso está en progreso
     */
    static isInProgress(course: CourseData): boolean;
    /**
     * Verificar si un curso está terminado
     */
    static isFinished(course: CourseData): boolean;
    /**
     * Verificar si requiere verificación de documentos
     */
    static requiresDocumentVerification(course: CourseData): boolean;
    /**
     * Verificar si es para carrera específica
     */
    static isForSpecificCareer(course: CourseData): boolean;
    /**
     * Calcular progreso del curso
     */
    static calculateProgress(course: CourseData): number;
    /**
     * Verificar si puede generar certificados
     */
    static canGenerateCertificates(course: CourseData): boolean;
    /**
     * Cerrar un curso
     */
    static closeCourse(course: Course): void;
    /**
     * Cancelar un curso
     */
    static cancelCourse(course: Course): void;
}
//# sourceMappingURL=CourseBusinessRules.d.ts.map