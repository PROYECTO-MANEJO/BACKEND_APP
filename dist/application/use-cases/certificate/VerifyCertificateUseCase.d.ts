/**
 * VerifyCertificateUseCase - Application Layer
 *
 * Caso de uso para verificar la validez de un certificado.
 */
import { CertificateManagementService } from "../../../domain/services/CertificateManagementService";
import { Certificate } from "../../../domain/entities/Certificate";
export interface VerifyCertificateRequest {
    verificationCode: string;
}
export interface VerifyCertificateResponse {
    success: boolean;
    isValid: boolean;
    certificate?: Certificate;
    message: string;
    verificationDetails?: {
        issuedDate: Date;
        recipientName: string;
        eventOrCourseName: string;
        organizationName: string;
        isRevoked: boolean;
    };
}
export declare class VerifyCertificateUseCase {
    private certificateManagementService;
    constructor(certificateManagementService: CertificateManagementService);
    execute(request: VerifyCertificateRequest): Promise<VerifyCertificateResponse>;
}
//# sourceMappingURL=VerifyCertificateUseCase.d.ts.map