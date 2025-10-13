/**
 * Event Validator - Domain Layer
 *
 * Responsabilidad única: Validar datos de eventos
 * Aplica SRP separando las validaciones de la entidad
 */

import { EventData } from "../entities/Event";

export class EventValidator {
  /**
   * Validar todos los datos del evento
   */
  public static validate(data: EventData): void {
    this.validateRequiredFields(data);
    this.validateDates(data.fec_ini_eve, data.fec_fin_eve);
    this.validateTimes(data.hor_ini_eve, data.hor_fin_eve);
    this.validateDuration(data.dur_eve);
    this.validateCapacity(data.capacidad_max_eve);
    this.validateAttendancePercentage(data.porcentaje_asistencia_aprobacion);
    this.validatePrice(data.es_gratuito, data.precio);
    this.validateAudienceType(data.tipo_audiencia_eve);
  }

  /**
   * Validar campos requeridos
   */
  private static validateRequiredFields(data: EventData): void {
    if (!data.nom_eve?.trim()) {
      throw new Error("El nombre del evento es requerido");
    }

    if (data.nom_eve.length > 100) {
      throw new Error("El nombre del evento no puede exceder 100 caracteres");
    }

    if (!data.des_eve?.trim()) {
      throw new Error("La descripción del evento es requerida");
    }

    if (data.des_eve.length > 500) {
      throw new Error("La descripción no puede exceder 500 caracteres");
    }

    if (!data.are_eve?.trim()) {
      throw new Error("El área del evento es requerida");
    }

    if (!data.ubi_eve?.trim()) {
      throw new Error("La ubicación del evento es requerida");
    }

    if (!data.ced_org_eve?.trim()) {
      throw new Error("El organizador del evento es requerido");
    }
  }

  /**
   * Validar fechas del evento
   */
  private static validateDates(
    fechaInicio: Date,
    fechaFin?: Date | null
  ): void {
    if (!fechaInicio) {
      throw new Error("La fecha de inicio es requerida");
    }

    // Obtener fecha actual en la zona horaria local
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Convertir fecha de inicio a objeto Date
    const startDate = new Date(fechaInicio);
    const startDateOnly = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );

    // Permitir fechas desde hoy en adelante
    if (startDateOnly < today) {
      throw new Error("La fecha de inicio no puede ser anterior a hoy");
    }

    if (fechaFin) {
      const endDate = new Date(fechaFin);
      const endDateOnly = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      );

      if (endDateOnly < startDateOnly) {
        throw new Error(
          "La fecha de fin no puede ser anterior a la fecha de inicio"
        );
      }

      // Validar que no sea muy lejana (máximo 2 años)
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 2);
      if (endDate > maxDate) {
        throw new Error("La fecha de fin no puede ser mayor a 2 años");
      }
    }
  }

  /**
   * Validar horarios del evento
   */
  private static validateTimes(horaInicio: Date, horaFin?: Date | null): void {
    if (!horaInicio) {
      throw new Error("La hora de inicio es requerida");
    }

    if (horaFin) {
      const startTime = new Date(horaInicio).getTime();
      const endTime = new Date(horaFin).getTime();

      if (endTime <= startTime) {
        throw new Error(
          "La hora de fin debe ser posterior a la hora de inicio"
        );
      }

      // Validar duración máxima (12 horas por día)
      const maxDuration = 12 * 60 * 60 * 1000; // 12 horas en millisegundos
      if (endTime - startTime > maxDuration) {
        throw new Error(
          "La duración del evento no puede exceder 12 horas por día"
        );
      }
    }
  }

  /**
   * Validar duración del evento
   */
  private static validateDuration(duracion: number): void {
    if (duracion == null || duracion <= 0) {
      throw new Error("La duración del evento debe ser mayor a 0 horas");
    }

    if (duracion > 720) {
      // 720 horas = 1 mes aproximadamente
      throw new Error("La duración del evento no puede exceder 720 horas");
    }
  }

  /**
   * Validar capacidad máxima
   */
  private static validateCapacity(capacidad: number): void {
    if (capacidad == null || capacidad <= 0) {
      throw new Error("La capacidad máxima debe ser mayor a 0");
    }

    if (capacidad > 10000) {
      throw new Error("La capacidad máxima no puede exceder 10,000 personas");
    }
  }

  /**
   * Validar porcentaje de asistencia para aprobación
   */
  private static validateAttendancePercentage(porcentaje: number): void {
    if (porcentaje == null || porcentaje < 0 || porcentaje > 100) {
      throw new Error("El porcentaje de asistencia debe estar entre 0 y 100");
    }
  }

  /**
   * Validar precio del evento
   */
  private static validatePrice(
    esGratuito: boolean,
    precio?: number | null
  ): void {
    if (esGratuito) {
      if (precio != null && precio > 0) {
        throw new Error("Un evento gratuito no puede tener precio mayor a 0");
      }
    } else {
      if (precio == null || precio <= 0) {
        throw new Error("Un evento no gratuito debe tener un precio mayor a 0");
      }

      if (precio > 10000) {
        throw new Error("El precio del evento no puede exceder $10,000");
      }
    }
  }

  /**
   * Validar tipo de audiencia
   */
  public static validateAudienceType(
    tipoAudiencia: string | undefined
  ): void {
    const tiposValidos = [
      "CARRERA_ESPECIFICA",
      "TODAS_CARRERAS",
      "PUBLICO_GENERAL",
    ];

    if (!tipoAudiencia || !tiposValidos.includes(tipoAudiencia)) {
      throw new Error(
        `Tipo de audiencia inválido. Debe ser uno de: ${tiposValidos.join(
          ", "
        )}`
      );
    }
  }

  /**
   * Validar nombre del evento individualmente
   */
  public static validateName(name: string | undefined): void {
    if (!name?.trim()) {
      throw new Error("El nombre del evento no puede estar vacío");
    }

    if (name.length > 100) {
      throw new Error("El nombre del evento no puede exceder 100 caracteres");
    }
  }

  /**
   * Validar descripción del evento individualmente
   */
  public static validateDescription(description: string | undefined): void {
    if (!description?.trim()) {
      throw new Error("La descripción del evento no puede estar vacía");
    }

    if (description.length > 500) {
      throw new Error("La descripción no puede exceder 500 caracteres");
    }
  }

  /**
   * Validar capacidad individualmente
   */
  public static validateCapacityValue(capacity: number | undefined): void {
    if (capacity !== undefined && capacity <= 0) {
      throw new Error("La capacidad debe ser mayor a 0");
    }
  }

  /**
   * Validar precio individualmente
   */
  public static validatePriceValue(
    price: number | undefined,
    isFree: boolean
  ): void {
    if (!isFree && price !== undefined && (!price || price <= 0)) {
      throw new Error("El precio debe ser mayor a 0");
    }
  }
}
