/**
 * RejectInscriptionUseCase - Application Layer
 * 
 * Caso de uso para rechazar una inscripción pendiente.
 */

import { InscriptionData } from '../../../domain/entities/Inscription';
import { InscriptionManagementService } from '../../../domain/services/InscriptionManagementService';

export interface RejectInscriptionRequest {
  inscriptionId: string;
}

export interface RejectInscriptionResponse {
  success: boolean;
  inscription?: InscriptionData;
  message?: string;
  error?: string;
}

export class RejectInscriptionUseCase {
  constructor(private inscriptionManagementService: InscriptionManagementService) {}

  async execute(request: RejectInscriptionRequest): Promise<RejectInscriptionResponse> {
    try {
      // Validación básica
      if (!request.inscriptionId?.trim()) {
        return { 
          success: false, 
          error: 'El ID de la inscripción es obligatorio' 
        };
      }

      // Rechazar inscripción
      const rejectedInscription = await this.inscriptionManagementService.rejectInscription(
        request.inscriptionId
      );

      return {
        success: true,
        inscription: rejectedInscription.toPublicObject(),
        message: 'Inscripción rechazada exitosamente'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al rechazar la inscripción'
      };
    }
  }
}