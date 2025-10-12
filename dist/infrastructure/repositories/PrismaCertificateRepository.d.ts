/**
 * Certificate Repository Implementation - Infrastructure Layer
 *
 * Implementación para certificados tanto de eventos como de cursos
 * Maneja operaciones básicas según el esquema Prisma real
 */
import { PrismaClient } from "@prisma/client";
export interface CertificateData {
    id?: string;
    certificatePdf?: Buffer;
    certificateFilename?: string;
    certificateSize?: number;
    issuedDate?: Date;
    evaluationDate?: Date;
    approved: boolean;
    attendancePercentage?: number;
    finalGrade?: number;
    enrollmentId: string;
    type: "event" | "course";
}
export declare class PrismaCertificateRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    createEventCertificate(certificateData: CertificateData): Promise<CertificateData>;
    createCourseCertificate(certificateData: CertificateData): Promise<CertificateData>;
    findEventCertificateById(id: string): Promise<CertificateData | null>;
    findCourseCertificateById(id: string): Promise<CertificateData | null>;
    private mapToCertificateData;
}
//# sourceMappingURL=PrismaCertificateRepository.d.ts.map