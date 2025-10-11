/**
 * EnrollInCourseUseCase - Application Layer
 *
 * Caso de uso para inscribir un usuario en un curso.
 */
import { InscriptionData, PaymentMethod } from '../../../domain/entities/Inscription';
import { InscriptionManagementService } from '../../../domain/services/InscriptionManagementService';
export interface EnrollInCourseRequest {
    userId: string;
    courseId: string;
    paymentMethod?: PaymentMethod;
    motivationLetter?: string;
    paymentProofBuffer?: Buffer;
    paymentProofFilename?: string;
}
export interface EnrollInCourseResponse {
    success: boolean;
    inscription?: InscriptionData;
    message?: string;
    error?: string;
}
export declare class EnrollInCourseUseCase {
    private inscriptionManagementService;
    constructor(inscriptionManagementService: InscriptionManagementService);
    execute(request: EnrollInCourseRequest): Promise<EnrollInCourseResponse>;
}
//# sourceMappingURL=EnrollInCourseUseCase.d.ts.map