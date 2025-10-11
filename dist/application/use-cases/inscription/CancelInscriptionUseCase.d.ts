/**
 * CancelInscriptionUseCase - Application Layer
 *
 * Caso de uso para cancelar una inscripción del usuario.
 */
import { InscriptionData } from '../../../domain/entities/Inscription';
import { InscriptionManagementService } from '../../../domain/services/InscriptionManagementService';
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
export declare class CancelInscriptionUseCase {
    private inscriptionManagementService;
    constructor(inscriptionManagementService: InscriptionManagementService);
    execute(request: CancelInscriptionRequest): Promise<CancelInscriptionResponse>;
}
//# sourceMappingURL=CancelInscriptionUseCase.d.ts.map