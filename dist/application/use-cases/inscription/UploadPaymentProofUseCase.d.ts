/**
 * UploadPaymentProofUseCase - Application Layer
 *
 * Caso de uso para subir o actualizar el comprobante de pago de una inscripción.
 */
import { InscriptionData } from "../../../domain/entities/Inscription";
import { InscriptionManagementService } from "../../../domain/services/InscriptionManagementService";
export interface UploadPaymentProofRequest {
    inscriptionId: string;
    userId: string;
    paymentProofBuffer: Buffer;
    filename: string;
}
export interface UploadPaymentProofResponse {
    success: boolean;
    inscription?: InscriptionData;
    message?: string;
    error?: string;
}
export declare class UploadPaymentProofUseCase {
    private inscriptionManagementService;
    constructor(inscriptionManagementService: InscriptionManagementService);
    execute(request: UploadPaymentProofRequest): Promise<UploadPaymentProofResponse>;
}
//# sourceMappingURL=UploadPaymentProofUseCase.d.ts.map