/**
 * GetUserInscriptionsUseCase - Application Layer
 *
 * Caso de uso para obtener las inscripciones de un usuario.
 */
import { InscriptionData, InscriptionType } from "../../../domain/entities/Inscription";
import { InscriptionManagementService } from "../../../domain/services/InscriptionManagementService";
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
export declare class GetUserInscriptionsUseCase {
    private inscriptionManagementService;
    constructor(inscriptionManagementService: InscriptionManagementService);
    execute(request: GetUserInscriptionsRequest): Promise<GetUserInscriptionsResponse>;
}
//# sourceMappingURL=GetUserInscriptionsUseCase.d.ts.map