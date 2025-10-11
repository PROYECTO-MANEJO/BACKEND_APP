/**
 * GetUserInscriptionsUseCase - Application Layer
 * 
 * Caso de uso para obtener las inscripciones de un usuario.
 */

import { InscriptionData, InscriptionType } from '../../../domain/entities/Inscription';
import { InscriptionManagementService } from '../../../domain/services/InscriptionManagementService';

export interface GetUserInscriptionsRequest {
  userId: string;
  type?: InscriptionType;
  status?: string;
}

export interface GetUserInscriptionsResponse {
  success: boolean;
  inscriptions?: InscriptionData[];
  statistics?: {
    total: number;
    events: number;
    courses: number;
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
  };
  error?: string;
}

export class GetUserInscriptionsUseCase {
  constructor(private inscriptionManagementService: InscriptionManagementService) {}

  async execute(request: GetUserInscriptionsRequest): Promise<GetUserInscriptionsResponse> {
    try {
      // Validación básica
      if (!request.userId?.trim()) {
        return { 
          success: false, 
          error: 'El ID del usuario es obligatorio' 
        };
      }

      // Obtener inscripciones con filtros
      const inscriptions = await this.inscriptionManagementService.getUserInscriptions(
        request.userId,
        {
          type: request.type,
          status: request.status
        }
      );

      // Calcular estadísticas
      const statistics = {
        total: inscriptions.length,
        events: inscriptions.filter(ins => ins.isForEvent()).length,
        courses: inscriptions.filter(ins => ins.isForCourse()).length,
        pending: inscriptions.filter(ins => ins.isPending()).length,
        approved: inscriptions.filter(ins => ins.isApproved()).length,
        rejected: inscriptions.filter(ins => ins.isRejected()).length,
        cancelled: inscriptions.filter(ins => ins.isCancelled()).length
      };

      return {
        success: true,
        inscriptions: inscriptions.map(ins => ins.toPublicObject()),
        statistics
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener inscripciones'
      };
    }
  }
}