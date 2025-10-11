/**
 * PrismaCertificateRepository - Infrastructure Layer
 *
 * Implementación simplificada del repositorio de certificados.
 * Nota: Esta es una implementación de ejemplo para demostrar la estructura.
 * En producción requiere el esquema de Prisma apropiado.
 */
import { Certificate } from "../../domain/entities/Certificate";
import { CertificateRepository } from "../../domain/repositories/CertificateRepository";
export declare class PrismaCertificateRepository implements CertificateRepository {
    private certificates;
    save(certificate: Certificate): Promise<Certificate>;
    findById(id: string): Promise<Certificate | null>;
    findByVerificationCode(verificationCode: string): Promise<Certificate | null>;
    findByParticipationId(participationId: string): Promise<Certificate[]>;
    findByCompletionId(completionId: string): Promise<Certificate[]>;
    findByRecipientId(recipientId: string): Promise<Certificate[]>;
    findByStatus(status: "DRAFT" | "ISSUED" | "REVOKED"): Promise<Certificate[]>;
    findByType(type: "EVENT" | "COURSE"): Promise<Certificate[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<Certificate[]>;
    findWithFilters(filters: {
        recipientId?: string;
        type?: "EVENT" | "COURSE";
        status?: "DRAFT" | "ISSUED" | "REVOKED";
        eventOrCourseId?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Certificate[]>;
    countByStatus(status: "DRAFT" | "ISSUED" | "REVOKED"): Promise<number>;
    countByType(type: "EVENT" | "COURSE"): Promise<number>;
    getStatistics(): Promise<{
        total: number;
        byStatus: {
            [status: string]: number;
        };
        byType: {
            [type: string]: number;
        };
        issuedThisMonth: number;
        issuedThisYear: number;
    }>;
    update(certificate: Certificate): Promise<Certificate>;
    deleteById(id: string): Promise<boolean>;
    existsByVerificationCode(verificationCode: string): Promise<boolean>;
    findExpiringInDateRange(startDate: Date, endDate: Date): Promise<Certificate[]>;
    findPendingGeneration(): Promise<Certificate[]>;
    findPotentialDuplicates(recipientId: string, eventOrCourseId: string, type: "EVENT" | "COURSE"): Promise<Certificate[]>;
    private generateId;
}
//# sourceMappingURL=PrismaCertificateRepository.d.ts.map