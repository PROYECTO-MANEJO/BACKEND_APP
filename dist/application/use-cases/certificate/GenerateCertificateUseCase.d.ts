/**
 * GenerateCertificateUseCase - Application Layer
 *
 * Caso de uso para generar certificados de participación/finalización.
 */
import { CertificateManagementService } from "../../../domain/services/CertificateManagementService";
import { Certificate } from "../../../domain/entities/Certificate";
export interface GenerateCertificateRequest {
    participationId?: string;
    completionId?: string;
    participationType: "event" | "course";
    requestedBy: string;
    templateId?: string;
}
export interface GenerateCertificateResponse {
    success: boolean;
    certificate?: Certificate;
    message: string;
    errors?: string[];
}
export declare class GenerateCertificateUseCase {
    private certificateManagementService;
    constructor(certificateManagementService: CertificateManagementService);
    execute(request: GenerateCertificateRequest): Promise<GenerateCertificateResponse>;
    private validateRequest;
}
//# sourceMappingURL=GenerateCertificateUseCase.d.ts.map