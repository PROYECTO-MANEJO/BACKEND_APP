/**
 * InscriptionRepository - Infrastructure Layer
 *
 * Implementación concreta del repositorio de inscripciones usando Prisma.
 * Maneja tanto inscripciones a eventos como a cursos.
 */
import { PrismaClient } from '@prisma/client';
import { Inscription, InscriptionType } from '../../domain/entities/Inscription';
import { IInscriptionRepository } from '../../domain/repositories/IInscriptionRepository';
export declare class InscriptionRepository implements IInscriptionRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(inscription: Inscription): Promise<Inscription>;
    findById(id: string): Promise<Inscription | null>;
    findAll(): Promise<Inscription[]>;
    update(id: string, inscription: Inscription): Promise<Inscription>;
    delete(id: string): Promise<void>;
    findByUser(userId: string): Promise<Inscription[]>;
    findByUserAndType(userId: string, type: InscriptionType): Promise<Inscription[]>;
    findByUserAndTarget(userId: string, targetId: string, type: InscriptionType): Promise<Inscription | null>;
    getUserInscriptionCount(userId: string): Promise<number>;
    findByTarget(targetId: string, type: InscriptionType): Promise<Inscription[]>;
    findByEvent(eventId: string): Promise<Inscription[]>;
    findByCourse(courseId: string): Promise<Inscription[]>;
    countActiveByTarget(targetId: string, type: InscriptionType): Promise<number>;
    countApprovedByTarget(targetId: string, type: InscriptionType): Promise<number>;
    findByPaymentStatus(status: string): Promise<Inscription[]>;
    findPendingApprovals(): Promise<Inscription[]>;
    findApprovedInscriptions(): Promise<Inscription[]>;
    findRejectedInscriptions(): Promise<Inscription[]>;
    findCancelledInscriptions(): Promise<Inscription[]>;
    findEventInscriptions(): Promise<Inscription[]>;
    findCourseInscriptions(): Promise<Inscription[]>;
    findWithFilters(filters: {
        userId?: string;
        targetId?: string;
        type?: InscriptionType;
        paymentStatus?: string;
        startDate?: Date;
        endDate?: Date;
        hasPaymentProof?: boolean;
        hasMotivationLetter?: boolean;
        approvedBy?: string;
    }): Promise<Inscription[]>;
    findAllPaginated(page: number, limit: number): Promise<{
        inscriptions: Inscription[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findByUserPaginated(userId: string, page: number, limit: number): Promise<{
        inscriptions: Inscription[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findPendingPaginated(page: number, limit: number): Promise<{
        inscriptions: Inscription[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    existsByUserAndTarget(userId: string, targetId: string, type: InscriptionType): Promise<boolean>;
    hasActiveInscription(userId: string, targetId: string, type: InscriptionType): Promise<boolean>;
    canEnrollInTarget(userId: string, targetId: string, type: InscriptionType): Promise<boolean>;
    getInscriptionStatistics(): Promise<{
        totalInscriptions: number;
        eventInscriptions: number;
        courseInscriptions: number;
        pendingApprovals: number;
        approvedInscriptions: number;
        rejectedInscriptions: number;
        cancelledInscriptions: number;
    }>;
    getTargetStatistics(targetId: string, type: InscriptionType): Promise<{
        totalInscriptions: number;
        approvedInscriptions: number;
        pendingInscriptions: number;
        rejectedInscriptions: number;
        cancelledInscriptions: number;
        averageProcessingTime?: number;
    }>;
    getUserStatistics(userId: string): Promise<{
        totalInscriptions: number;
        eventInscriptions: number;
        courseInscriptions: number;
        approvedInscriptions: number;
        pendingInscriptions: number;
        cancelledInscriptions: number;
    }>;
    getApprovedCountForTarget(targetId: string, type: InscriptionType): Promise<number>;
    getPendingCountForTarget(targetId: string, type: InscriptionType): Promise<number>;
    getTotalActiveCountForTarget(targetId: string, type: InscriptionType): Promise<number>;
    findInscriptionsWithPaymentProof(): Promise<Inscription[]>;
    findInscriptionsWithoutPaymentProof(): Promise<Inscription[]>;
    findByPaymentMethod(method: string): Promise<Inscription[]>;
    findByApprover(approverUserId: string): Promise<Inscription[]>;
    findApprovalsByDateRange(startDate: Date, endDate: Date): Promise<Inscription[]>;
    findPendingOlderThan(days: number): Promise<Inscription[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<Inscription[]>;
    findByInscriptionDate(date: Date): Promise<Inscription[]>;
    findRecentInscriptions(days: number): Promise<Inscription[]>;
    approveMultiple(inscriptionIds: string[], approverUserId: string): Promise<Inscription[]>;
    rejectMultiple(inscriptionIds: string[]): Promise<Inscription[]>;
    deleteByUser(userId: string): Promise<void>;
    deleteByTarget(targetId: string, type: InscriptionType): Promise<void>;
    searchInscriptions(searchTerm: string): Promise<Inscription[]>;
    findDuplicateInscriptions(): Promise<Inscription[]>;
    findInscriptionsRequiringAction(): Promise<Inscription[]>;
    getInscriptionsForExport(filters?: any): Promise<Inscription[]>;
    cleanupOldRejectedInscriptions(olderThanDays: number): Promise<number>;
    archiveCompletedInscriptions(olderThanDays: number): Promise<number>;
    private eventInscriptionToDomain;
    private courseInscriptionToDomain;
    private calculateAverageProcessingTime;
}
//# sourceMappingURL=InscriptionRepository.d.ts.map