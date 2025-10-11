/**
 * ApproveInscriptionUseCase - Application Layer
 *
 * Caso de uso para aprobar una inscripción pendiente.
 */

import { InscriptionData } from "../../../domain/entities/Inscription";
import { InscriptionManagementService } from "../../../domain/services/InscriptionManagementService";

export interface ApproveInscriptionRequest {
  inscriptionId: string;
  approverUserId: string;
}

export interface ApproveInscriptionResponse {
  success: boolean;
  inscription?: InscriptionData;
  message?: string;
  error?: string;
}

export class ApproveInscriptionUseCase {
  constructor(
    private inscriptionManagementService: InscriptionManagementService
  ) {}

  async execute(
    request: ApproveInscriptionRequest
  ): Promise<ApproveInscriptionResponse> {
    try {
      // Validaciones básicas
      if (!request.inscriptionId?.trim()) {
        return {
          success: false,
          error: "El ID de la inscripción es obligatorio",
        };
      }

      if (!request.approverUserId?.trim()) {
        return {
          success: false,
          error: "El ID del usuario aprobador es obligatorio",
        };
      }

      // Aprobar inscripción
      const approvedInscription =
        await this.inscriptionManagementService.approveInscription(
          request.inscriptionId,
          request.approverUserId
        );

      return {
        success: true,
        inscription: approvedInscription.toPublicObject(),
        message: "Inscripción aprobada exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al aprobar la inscripción",
      };
    }
  }
}
