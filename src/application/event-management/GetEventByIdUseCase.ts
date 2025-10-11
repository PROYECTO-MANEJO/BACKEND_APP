/**
 * GetEventByIdUseCase - Application Layer
 *
 * Caso de uso para obtener un evento específico por su ID
 */

import { EventManagementService } from "../../domain/services/EventManagementService";
import { Event } from "../../domain/entities/Event";

export interface GetEventByIdRequest {
  id: string;
}

export interface GetEventByIdResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class GetEventByIdUseCase {
  constructor(private eventManagementService: EventManagementService) {}

  async execute(request: GetEventByIdRequest): Promise<GetEventByIdResponse> {
    try {
      // Validar request
      if (!request.id || !request.id.trim()) {
        throw new Error("ID de evento inválido");
      }

      // Obtener evento
      const event = await this.eventManagementService.getEventById(request.id);

      if (!event) {
        return {
          success: false,
          message: "Evento no encontrado",
          error: "El evento con el ID especificado no existe",
        };
      }

      return {
        success: true,
        message: "Evento obtenido exitosamente",
        data: this.formatEventForResponse(event),
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Error al obtener el evento",
        error: error.message,
      };
    }
  }

  private formatEventForResponse(event: Event): any {
    return {
      id: event.id,
      nom_eve: event.nom_eve,
      des_eve: event.des_eve,
      id_cat_eve: event.id_cat_eve,
      fec_ini_eve: event.fec_ini_eve.toISOString().split("T")[0], // YYYY-MM-DD
      fec_fin_eve: event.fec_fin_eve
        ? event.fec_fin_eve.toISOString().split("T")[0]
        : null,
      hor_ini_eve: this.formatTimeFromDate(event.hor_ini_eve),
      hor_fin_eve: event.hor_fin_eve
        ? this.formatTimeFromDate(event.hor_fin_eve)
        : null,
      dur_eve: event.dur_eve,
      are_eve: event.are_eve,
      ubi_eve: event.ubi_eve,
      ced_org_eve: event.ced_org_eve,
      capacidad_max_eve: event.capacidad_max_eve,
      tipo_audiencia_eve: event.tipo_audiencia_eve,
      es_gratuito: event.es_gratuito,
      precio: event.precio,
      porcentaje_asistencia_aprobacion: event.porcentaje_asistencia_aprobacion,
      estado_eve: event.estado_eve,
      fecha_creacion: event.fecha_creacion,
      fecha_actualizacion: event.fecha_actualizacion,
      // Campos calculados
      isActive: event.isActive(),
      isUpcoming: event.isUpcoming(),
      isInProgress: event.isInProgress(),
      isFinished: event.isFinished(),
      canBeUpdated: event.canBeUpdated(),
      canBeDeleted: event.canBeDeleted(),
      canBeClosed: event.canBeClosed(),
    };
  }

  private formatTimeFromDate(date: Date): string {
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const seconds = date.getUTCSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }
}
