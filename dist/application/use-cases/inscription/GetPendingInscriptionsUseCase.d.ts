/**
 * GetPendingInscriptionsUseCase - Application Layer
 *
 * Caso de uso para obtener las inscripciones pendientes de aprobación.
 */
import { InscriptionData } from "../../../domain/entities/Inscription";
import { InscriptionManagementService } from "../../../domain/services/InscriptionManagementService";
export interface GetPendingInscriptionsRequest {
    page?: number;
    limit?: number;
}
export interface GetPendingInscriptionsResponse {
    success: boolean;
    inscriptions?: InscriptionData[];
    pagination?: {
        total: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
    statistics?: {
        totalPending: number;
        eventInscriptions: number;
        courseInscriptions: number;
    };
    error?: string;
}
export declare class GetPendingInscriptionsUseCase {
    private inscriptionManagementService;
    constructor(inscriptionManagementService: InscriptionManagementService);
    execute(request?: GetPendingInscriptionsRequest): Promise<GetPendingInscriptionsResponse>;
}
//# sourceMappingURL=GetPendingInscriptionsUseCase.d.ts.map