/**
 * Event Business Rules - Domain Layer
 * 
 * Responsabilidad única: TODAS las reglas de negocio y operaciones para eventos
 * Aplica SRP separando completamente la lógica de negocio de la entidad
 */

import { EventData, Event } from "../entities/Event";

export class EventBusinessRules {
  /**
   * Verificar si un evento puede ser editado
   */
  public static canBeEdited(event: EventData): boolean {
    // No se puede editar si ya comenzó
    const now = new Date();
    const startDate = new Date(event.fec_ini_eve);
    
    return startDate > now;
  }

  /**
   * Verificar si un evento puede ser cancelado
   */
  public static canBeCanceled(event: EventData): boolean {
    // Se puede cancelar hasta 24 horas antes del inicio
    const now = new Date();
    const startDate = new Date(event.fec_ini_eve);
    const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilStart >= 24 && event.estado_eve !== "CANCELADO";
  }

  /**
   * Verificar si un evento está activo para inscripciones
   */
  public static isOpenForRegistration(event: EventData): boolean {
    const now = new Date();
    const startDate = new Date(event.fec_ini_eve);
    
    return (
      event.estado_eve === "ACTIVO" &&
      startDate > now &&
      !this.isCapacityFull(event)
    );
  }

  /**
   * Verificar si la capacidad está llena
   */
  public static isCapacityFull(event: EventData): boolean {
    const currentParticipants = event.participaciones?.length || 0;
    return currentParticipants >= event.capacidad_max_eve;
  }

  /**
   * Calcular el porcentaje de ocupación
   */
  public static getOccupancyPercentage(event: EventData): number {
    const currentParticipants = event.participaciones?.length || 0;
    return Math.round((currentParticipants / event.capacidad_max_eve) * 100);
  }

  /**
   * Verificar si requiere aprobación del organizador
   */
  public static requiresOrganizerApproval(event: EventData): boolean {
    // Los eventos gratuitos y de estudiantes no requieren aprobación
    // Los eventos pagos o para público general sí requieren aprobación
    return !event.es_gratuito || event.tipo_audiencia_eve === "PUBLICO_GENERAL";
  }

  /**
   * Calcular duración en días
   */
  public static calculateDurationInDays(event: EventData): number {
    if (!event.fec_fin_eve) {
      return 1; // Evento de un solo día
    }

    const startDate = new Date(event.fec_ini_eve);
    const endDate = new Date(event.fec_fin_eve);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays + 1; // +1 porque incluye ambos días
  }

  /**
   * Generar código único del evento
   */
  public static generateEventCode(event: EventData): string {
    const year = new Date(event.fec_ini_eve).getFullYear();
    const category = event.id_cat_eve?.toString().padStart(2, '0') || '00';
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    
    return `EVE-${year}-${category}-${random}`;
  }

  /**
   * Determinar prioridad del evento
   */
  public static calculatePriority(event: EventData): 'ALTA' | 'MEDIA' | 'BAJA' {
    let score = 0;

    // Factores que aumentan la prioridad
    if (event.tipo_audiencia_eve === 'DOCENTES') score += 3;
    if (event.tipo_audiencia_eve === 'PROFESIONALES') score += 2;
    if (!event.es_gratuito) score += 2;
    if (event.capacidad_max_eve > 100) score += 1;
    if (event.dur_eve > 8) score += 1; // Eventos largos

    if (score >= 5) return 'ALTA';
    if (score >= 3) return 'MEDIA';
    return 'BAJA';
  }

  /**
   * Verificar compatibilidad de fechas con otros eventos
   */
  public static hasScheduleConflict(
    event: EventData, 
    otherEvents: EventData[]
  ): boolean {
    const eventStart = new Date(event.fec_ini_eve);
    const eventEnd = event.fec_fin_eve ? new Date(event.fec_fin_eve) : eventStart;

    return otherEvents.some(other => {
      // Misma ubicación y organizador
      if (other.ubi_eve === event.ubi_eve || other.ced_org_eve === event.ced_org_eve) {
        const otherStart = new Date(other.fec_ini_eve);
        const otherEnd = other.fec_fin_eve ? new Date(other.fec_fin_eve) : otherStart;

        // Verificar solapamiento de fechas
        return eventStart <= otherEnd && eventEnd >= otherStart;
      }
      
      return false;
    });
  }

  // ✅ MÉTODOS MOVIDOS DESDE Event.ts PARA SRP COMPLETO

  /**
   * Verificar si un evento puede ser actualizado
   */
  public static canBeUpdated(event: EventData): boolean {
    const now = new Date();
    const startDate = new Date(event.fec_ini_eve);
    return startDate > now && event.estado_eve === "ACTIVO";
  }

  /**
   * Verificar si un evento puede ser eliminado
   */
  public static canBeDeleted(event: EventData): boolean {
    return this.canBeUpdated(event); // Mismas reglas que actualización
  }

  /**
   * Verificar si un evento puede ser cerrado
   */
  public static canBeClosed(event: EventData): boolean {
    const now = new Date();
    const startDate = new Date(event.fec_ini_eve);
    return startDate <= now && event.estado_eve === "ACTIVO";
  }

  /**
   * Verificar si un evento está activo
   */
  public static isActive(event: EventData): boolean {
    return event.estado_eve === "ACTIVO";
  }

  /**
   * Verificar si un evento es próximo (futuro)
   */
  public static isUpcoming(event: EventData): boolean {
    const now = new Date();
    const startDate = new Date(event.fec_ini_eve);
    return startDate > now && event.estado_eve === "ACTIVO";
  }

  /**
   * Verificar si un evento está en progreso
   */
  public static isInProgress(event: EventData): boolean {
    const now = new Date();
    const startDate = new Date(event.fec_ini_eve);
    const endDate = event.fec_fin_eve ? new Date(event.fec_fin_eve) : startDate;
    
    return (
      startDate <= now &&
      endDate >= now &&
      event.estado_eve === "ACTIVO"
    );
  }

  /**
   * Verificar si un evento está terminado
   */
  public static isFinished(event: EventData): boolean {
    return event.estado_eve === "CERRADO" || event.estado_eve === "FINALIZADO";
  }

  // ✅ OPERACIONES DE NEGOCIO (que modifican el evento)

  /**
   * Cerrar un evento
   */
  public static closeEvent(event: Event): void {
    if (!this.canBeClosed(event.toPlainObject())) {
      throw new Error("El evento no puede ser cerrado en este momento");
    }
    // La lógica de modificación se delega a métodos específicos de la entidad
  }

  /**
   * Cancelar un evento  
   */
  public static cancelEvent(event: Event): void {
    if (!this.canBeUpdated(event.toPlainObject())) {
      throw new Error("El evento no puede ser cancelado");
    }
    // La lógica de modificación se delega a métodos específicos de la entidad
  }
}