/**
 * Event Validator - Domain Layer
 *
 * Responsabilidad única: Validar datos de eventos
 * Aplica SRP separando las validaciones de la entidad
 */
import { EventData } from "../entities/Event";
export declare class EventValidator {
    /**
     * Validar todos los datos del evento
     */
    static validate(data: EventData): void;
    /**
     * Validar campos requeridos
     */
    private static validateRequiredFields;
    /**
     * Validar fechas del evento
     */
    private static validateDates;
    /**
     * Validar horarios del evento
     */
    private static validateTimes;
    /**
     * Validar duración del evento
     */
    private static validateDuration;
    /**
     * Validar capacidad máxima
     */
    private static validateCapacity;
    /**
     * Validar porcentaje de asistencia para aprobación
     */
    private static validateAttendancePercentage;
    /**
     * Validar precio del evento
     */
    private static validatePrice;
    /**
     * Validar tipo de audiencia
     */
    static validateAudienceType(tipoAudiencia: string | undefined): void;
    /**
     * Validar nombre del evento individualmente
     */
    static validateName(name: string | undefined): void;
    /**
     * Validar descripción del evento individualmente
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
}
//# sourceMappingURL=EventValidator.d.ts.map