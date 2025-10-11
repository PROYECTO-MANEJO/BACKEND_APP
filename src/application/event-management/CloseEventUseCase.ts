/**
 * CloseEventUseCase - Application Layer
 *
 * Caso de uso para cerrar un evento y generar certificados automáticamente
 */

import { EventManagementService } from "../../domain/services/EventManagementService";
import { Event } from "../../domain/entities/Event";

export interface CloseEventRequest {
  id: string;
}

export interface CloseEventResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    nom_eve: string;
    estado_eve: string;
    fecha_cierre: Date;
  };
  error?: string;
}

export class CloseEventUseCase {
  constructor(private eventManagementService: EventManagementService) {}

  async execute(request: CloseEventRequest): Promise<CloseEventResponse> {
    try {
      // Validar request
      if (!request.id || !request.id.trim()) {
        throw new Error("ID de evento inválido");
      }

      // Ejecutar cierre a través del servicio de dominio
      const closedEvent = await this.eventManagementService.closeEvent(
        request.id
      );

      return {
        success: true,
        message: "Evento cerrado exitosamente",
        data: {
          id: closedEvent.id!,
          nom_eve: closedEvent.nom_eve,
          estado_eve: closedEvent.estado_eve,
          fecha_cierre: closedEvent.fecha_actualizacion!,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Error al cerrar el evento",
        error: error.message,
      };
    }
  }
}
