/**
 * Event Business Rules - Domain Layer
 *
 * Responsabilidad única: TODAS las reglas de negocio y operaciones para eventos
 * Aplica SRP separando completamente la lógica de negocio de la entidad
 */
import { EventData, Event } from "../entities/Event";
export declare class EventBusinessRules {
    /**
     * Verificar si un evento puede ser editado
     */
    static canBeEdited(event: EventData): boolean;
    /**
     * Verificar si un evento puede ser cancelado
     */
    static canBeCanceled(event: EventData): boolean;
    /**
     * Verificar si un evento está activo para inscripciones
     */
    static isOpenForRegistration(event: EventData): boolean;
    /**
     * Verificar si la capacidad está llena
     */
    static isCapacityFull(event: EventData): boolean;
    /**
     * Calcular el porcentaje de ocupación
     */
    static getOccupancyPercentage(event: EventData): number;
    /**
     * Verificar si requiere aprobación del organizador
     */
    static requiresOrganizerApproval(event: EventData): boolean;
    /**
     * Calcular duración en días
     */
    static calculateDurationInDays(event: EventData): number;
    /**
     * Generar código único del evento
     */
    static generateEventCode(event: EventData): string;
    /**
     * Determinar prioridad del evento
     */
    static calculatePriority(event: EventData): 'ALTA' | 'MEDIA' | 'BAJA';
    /**
     * Verificar compatibilidad de fechas con otros eventos
     */
    static hasScheduleConflict(event: EventData, otherEvents: EventData[]): boolean;
    /**
     * Verificar si un evento puede ser actualizado
     */
    static canBeUpdated(event: EventData): boolean;
    /**
     * Verificar si un evento puede ser eliminado
     */
    static canBeDeleted(event: EventData): boolean;
    /**
     * Verificar si un evento puede ser cerrado
     */
    static canBeClosed(event: EventData): boolean;
    /**
     * Verificar si un evento está activo
     */
    static isActive(event: EventData): boolean;
    /**
     * Verificar si un evento es próximo (futuro)
     */
    static isUpcoming(event: EventData): boolean;
    /**
     * Verificar si un evento está en progreso
     */
    static isInProgress(event: EventData): boolean;
    /**
     * Verificar si un evento está terminado
     */
    static isFinished(event: EventData): boolean;
    /**
     * Cerrar un evento
     */
    static closeEvent(event: Event): void;
    /**
     * Cancelar un evento
     */
    static cancelEvent(event: Event): void;
}
//# sourceMappingURL=EventBusinessRules.d.ts.map