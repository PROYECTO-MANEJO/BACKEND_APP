/**
 * GetAllInscriptionsUseCase - Application Layer
 * 
 * Caso de uso para obtener todas las inscripciones con filtros y paginación.
 */

import { InscriptionData, InscriptionType } from '../../../domain/entities/Inscription';
import { IInscriptionRepository } from '../../../domain/repositories/IInscriptionRepository';

export interface GetAllInscriptionsRequest {
  page?: number;
  limit?: number;
  userId?: string;
  targetId?: string;
  type?: InscriptionType;
  paymentStatus?: string;
  startDate?: Date;
  endDate?: Date;
  hasPaymentProof?: boolean;
  hasMotivationLetter?: boolean;
}

export interface GetAllInscriptionsResponse {
  success: boolean;
  inscriptions?: InscriptionData[];
  pagination?: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  error?: string;
}

export class GetAllInscriptionsUseCase {
  constructor(private inscriptionRepository: IInscriptionRepository) {}

  async execute(request: GetAllInscriptionsRequest = {}): Promise<GetAllInscriptionsResponse> {
    try {
      const { page = 1, limit = 10 } = request;

      // Si se especifica paginación
      if (page && limit) {
        const result = await this.inscriptionRepository.findAllPaginated(page, limit);

        return {
          success: true,
          inscriptions: result.inscriptions.map(ins => ins.toPublicObject()),
          pagination: {
            total: result.total,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            limit
          }
        };
      }

      // Sin paginación - aplicar filtros
      const inscriptions = await this.inscriptionRepository.findWithFilters({
        userId: request.userId,
        targetId: request.targetId,
        type: request.type,
        paymentStatus: request.paymentStatus,
        startDate: request.startDate,
        endDate: request.endDate,
        hasPaymentProof: request.hasPaymentProof,
        hasMotivationLetter: request.hasMotivationLetter
      });

      return {
        success: true,
        inscriptions: inscriptions.map(ins => ins.toPublicObject())
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener las inscripciones'
      };
    }
  }
}