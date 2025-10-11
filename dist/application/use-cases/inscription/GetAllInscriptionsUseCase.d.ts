/**
 * GetAllInscriptionsUseCase - Application Layer
 *
 * Caso de uso para obtener todas las inscripciones con filtros y paginación.
 */
import { InscriptionData, InscriptionType } from "../../../domain/entities/Inscription";
import { IInscriptionRepository } from "../../../domain/repositories/IInscriptionRepository";
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
export declare class GetAllInscriptionsUseCase {
    private inscriptionRepository;
    constructor(inscriptionRepository: IInscriptionRepository);
    execute(request?: GetAllInscriptionsRequest): Promise<GetAllInscriptionsResponse>;
}
//# sourceMappingURL=GetAllInscriptionsUseCase.d.ts.map