/**
 * RejectInscriptionUseCase - Application Layer
 *
 * Caso de uso para rechazar una inscripción pendiente.
 */
import { InscriptionData } from "../../../domain/entities/Inscription";
import { InscriptionManagementService } from "../../../domain/services/InscriptionManagementService";
export interface RejectInscriptionRequest {
    inscriptionId: string;
}
export interface RejectInscriptionResponse {
    success: boolean;
    inscription?: InscriptionData;
    message?: string;
    error?: string;
}
export declare class RejectInscriptionUseCase {
    private inscriptionManagementService;
    constructor(inscriptionManagementService: InscriptionManagementService);
    execute(request: RejectInscriptionRequest): Promise<RejectInscriptionResponse>;
}
//# sourceMappingURL=RejectInscriptionUseCase.d.ts.map