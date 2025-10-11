/**
 * ApproveInscriptionUseCase - Application Layer
 *
 * Caso de uso para aprobar una inscripción pendiente.
 */
import { InscriptionData } from '../../../domain/entities/Inscription';
import { InscriptionManagementService } from '../../../domain/services/InscriptionManagementService';
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
export declare class ApproveInscriptionUseCase {
    private inscriptionManagementService;
    constructor(inscriptionManagementService: InscriptionManagementService);
    execute(request: ApproveInscriptionRequest): Promise<ApproveInscriptionResponse>;
}
//# sourceMappingURL=ApproveInscriptionUseCase.d.ts.map