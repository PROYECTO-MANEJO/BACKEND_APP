/**
 * Course Validator - Domain Layer
 *
 * Responsabilidad única: Validar datos de cursos
 * Aplica SRP separando las validaciones de la entidad
 */
import { CourseData } from "../entities/Course";
export declare class CourseValidator {
    /**
     * Validar todos los datos del curso
     */
    static validate(data: CourseData): void;
    /**
     * Validar campos requeridos
     */
    private static validateRequiredFields;
    /**
     * Validar fechas del curso
     */
    private static validateDates;
    /**
     * Validar duración en horas
     */
    private static validateDuration;
    /**
     * Validar capacidad del curso
     */
    private static validateCapacity;
    /**
     * Validar criterios de aprobación
     */
    private static validateApprovalCriteria;
    /**
     * Validar precio del curso
     */
    private static validatePrice;
    /**
     * Validar tipo de audiencia
     */
    private static validateAudienceType;
    /**
     * Validar nombre del curso individualmente
     */
    static validateName(name: string | undefined): void;
    /**
     * Validar descripción del curso individualmente
     */
    static validateDescription(description: string | undefined): void;
    /**
     * Validar capacidad individualmente
     */
    static validateCapacityValue(capacity: number | undefined): void;
    /**
     * Validar precio individualmente
     */
    static validatePriceValue(price: number | undefined, isFree: boolean): void;
    /**
     * Validar duración individualmente
     */
    static validateDurationValue(duration: number | undefined): void;
}
//# sourceMappingURL=CourseValidator.d.ts.map