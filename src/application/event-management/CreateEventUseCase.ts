/**
 * CreateEventUseCase - Application Layer
 *
 * Caso de uso para crear un nuevo evento en el sistema
 */

import {
  EventManagementService,
  EventCreationData,
} from "../../domain/services/EventManagementService";
import { Event } from "../../domain/entities/Event";

export interface CreateEventRequest {
  nom_eve: string;
  des_eve: string;
  id_cat_eve: number;
  fec_ini_eve: string; // String que será convertida a Date
  fec_fin_eve?: string;
  hor_ini_eve: string;
  hor_fin_eve?: string;
  dur_eve: number;
  are_eve: string;
  ubi_eve: string;
  ced_org_eve: string;
  capacidad_max_eve: number;
  tipo_audiencia_eve: string;
  es_gratuito: boolean;
  precio?: number;
  porcentaje_asistencia_aprobacion: number;
  carreras?: number[];
}

export interface CreateEventResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    nom_eve: string;
    estado_eve: string;
    fecha_creacion: Date;
  };
  error?: string;
}

export class CreateEventUseCase {
  constructor(private eventManagementService: EventManagementService) {}

  async execute(request: CreateEventRequest): Promise<CreateEventResponse> {
    try {
      // Validar request
      this.validateRequest(request);

      // Preparar datos con conversiones necesarias
      const eventData: EventCreationData = {
        nom_eve: request.nom_eve.trim(),
        des_eve: request.des_eve.trim(),
        id_cat_eve: request.id_cat_eve,
        fec_ini_eve: new Date(request.fec_ini_eve),
        fec_fin_eve: request.fec_fin_eve
          ? new Date(request.fec_fin_eve)
          : undefined,
        hor_ini_eve: this.parseTimeToDate(request.hor_ini_eve),
        hor_fin_eve: request.hor_fin_eve
          ? this.parseTimeToDate(request.hor_fin_eve)
          : undefined,
        dur_eve: request.dur_eve,
        are_eve: request.are_eve.trim(),
        ubi_eve: request.ubi_eve.trim(),
        ced_org_eve: request.ced_org_eve.trim(),
        capacidad_max_eve: request.capacidad_max_eve,
        tipo_audiencia_eve: request.tipo_audiencia_eve,
        es_gratuito: request.es_gratuito,
        precio: request.precio,
        porcentaje_asistencia_aprobacion:
          request.porcentaje_asistencia_aprobacion,
        carreras: request.carreras,
      };

      // Ejecutar creación a través del servicio de dominio
      const createdEvent = await this.eventManagementService.createEvent(
        eventData
      );

      return {
        success: true,
        message: "Evento creado exitosamente",
        data: {
          id: createdEvent.id!,
          nom_eve: createdEvent.nom_eve,
          estado_eve: createdEvent.estado_eve,
          fecha_creacion: createdEvent.fecha_creacion!,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Error al crear el evento",
        error: error.message,
      };
    }
  }

  private validateRequest(request: CreateEventRequest): void {
    if (!request.nom_eve?.trim()) {
      throw new Error("El nombre del evento es obligatorio");
    }

    if (!request.des_eve?.trim()) {
      throw new Error("La descripción del evento es obligatoria");
    }

    if (!request.id_cat_eve || request.id_cat_eve <= 0) {
      throw new Error("La categoría del evento es obligatoria");
    }

    if (!request.fec_ini_eve) {
      throw new Error("La fecha de inicio es obligatoria");
    }

    if (!request.hor_ini_eve) {
      throw new Error("La hora de inicio es obligatoria");
    }

    if (!request.ced_org_eve?.trim()) {
      throw new Error("La cédula del organizador es obligatoria");
    }

    // Validar formato de fecha
    const fechaInicio = new Date(request.fec_ini_eve);
    if (isNaN(fechaInicio.getTime())) {
      throw new Error("Formato de fecha de inicio inválido");
    }

    if (request.fec_fin_eve) {
      const fechaFin = new Date(request.fec_fin_eve);
      if (isNaN(fechaFin.getTime())) {
        throw new Error("Formato de fecha de fin inválido");
      }
    }

    // Validar formato de hora
    this.validateTimeFormat(request.hor_ini_eve);
    if (request.hor_fin_eve) {
      this.validateTimeFormat(request.hor_fin_eve);
    }
  }

  private validateTimeFormat(timeString: string): void {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;

    if (!timeRegex.test(timeString)) {
      throw new Error("Formato de hora inválido. Use HH:MM o HH:MM:SS");
    }
  }

  private parseTimeToDate(timeString: string): Date {
    const timeParts = timeString.split(":").map(Number);
    const horas = timeParts[0] || 0;
    const minutos = timeParts[1] || 0;
    const segundos = timeParts[2] || 0;

    // Crear Date object con fecha base 1970-01-01
    const fecha = new Date("1970-01-01T00:00:00.000Z");
    fecha.setUTCHours(horas, minutos, segundos, 0);

    return fecha;
  }
}
