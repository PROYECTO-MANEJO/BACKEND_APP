/**
 * CancelInscriptionUseCase - Application Layer
 *
 * Caso de uso para cancelar una inscripción del usuario.
 */

import { InscriptionData } from "../../../domain/entities/Inscription";
import { InscriptionManagementService } from "../../../domain/services/InscriptionManagementService";

export interface CancelInscriptionRequest {
  inscriptionId: string;
  userId: string;
}

export interface CancelInscriptionResponse {
  success: boolean;
  inscription?: InscriptionData;
  message?: string;
  error?: string;
}

export class CancelInscriptionUseCase {
  constructor(
    private inscriptionManagementService: InscriptionManagementService
  ) {}

  async execute(
    request: CancelInscriptionRequest
  ): Promise<CancelInscriptionResponse> {
    try {
      // Validaciones básicas
      if (!request.inscriptionId?.trim()) {
        return {
          success: false,
          error: "El ID de la inscripción es obligatorio",
        };
      }

      if (!request.userId?.trim()) {
        return {
          success: false,
          error: "El ID del usuario es obligatorio",
        };
      }

      // Cancelar inscripción
      const cancelledInscription =
        await this.inscriptionManagementService.cancelInscription(
          request.inscriptionId,
          request.userId
        );

      return {
        success: true,
        inscription: cancelledInscription.toPublicObject(),
        message: "Inscripción cancelada exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al cancelar la inscripción",
      };
    }
  }
}
