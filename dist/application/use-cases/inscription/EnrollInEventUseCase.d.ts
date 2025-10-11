/**
 * EnrollInEventUseCase - Application Layer
 *
 * Caso de uso para inscribir un usuario en un evento.
 */
import { InscriptionData, PaymentMethod } from "../../../domain/entities/Inscription";
import { InscriptionManagementService } from "../../../domain/services/InscriptionManagementService";
export interface EnrollInEventRequest {
    userId: string;
    eventId: string;
    paymentMethod?: PaymentMethod;
    motivationLetter?: string;
    paymentProofBuffer?: Buffer;
    paymentProofFilename?: string;
}
export interface EnrollInEventResponse {
    success: boolean;
    inscription?: InscriptionData;
    message?: string;
    error?: string;
}
export declare class EnrollInEventUseCase {
    private inscriptionManagementService;
    constructor(inscriptionManagementService: InscriptionManagementService);
    execute(request: EnrollInEventRequest): Promise<EnrollInEventResponse>;
}
//# sourceMappingURL=EnrollInEventUseCase.d.ts.map