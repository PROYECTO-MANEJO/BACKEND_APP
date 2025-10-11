/**
 * DeleteEventUseCase - Application Layer
 *
 * Caso de uso para eliminar un evento del sistema
 */

import { EventManagementService } from "../../domain/services/EventManagementService";

export interface DeleteEventRequest {
  id: string;
}

export interface DeleteEventResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    deleted: boolean;
  };
  error?: string;
}

export class DeleteEventUseCase {
  constructor(private eventManagementService: EventManagementService) {}

  async execute(request: DeleteEventRequest): Promise<DeleteEventResponse> {
    try {
      // Validar request
      if (!request.id || !request.id.trim()) {
        throw new Error("ID de evento inválido");
      }

      // Ejecutar eliminación a través del servicio de dominio
      const deleted = await this.eventManagementService.deleteEvent(request.id);

      return {
        success: true,
        message: "Evento eliminado exitosamente",
        data: {
          id: request.id,
          deleted: deleted,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Error al eliminar el evento",
        error: error.message,
      };
    }
  }
}
