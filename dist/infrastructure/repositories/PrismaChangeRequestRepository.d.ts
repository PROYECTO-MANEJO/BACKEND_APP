import { PrismaClient } from "@prisma/client";
import { ChangeRequest } from "@domain/entities/ChangeRequest";
import { ChangeRequestRepository, ChangeRequestFilters } from "@domain/repositories/IChangeRequestRepository";
export declare class PrismaChangeRequestRepository implements ChangeRequestRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(changeRequest: ChangeRequest): Promise<ChangeRequest>;
    findById(id: string): Promise<ChangeRequest | null>;
    findAll(filters?: ChangeRequestFilters): Promise<{
        items: ChangeRequest[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findByRequesterId(requesterId: string, filters?: ChangeRequestFilters): Promise<{
        items: ChangeRequest[];
        total: number;
    }>;
    findByDeveloperId(developerId: string, filters?: ChangeRequestFilters): Promise<{
        items: ChangeRequest[];
        total: number;
    }>;
    update(changeRequest: ChangeRequest): Promise<ChangeRequest>;
    delete(id: string): Promise<void>;
    getStatistics(): Promise<{
        totalRequests: number;
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
        byType: Record<string, number>;
        averageResolutionTime: number;
        pendingRequests: number;
        completedThisMonth: number;
    }>;
    findPendingTechnicalPlanApproval(): Promise<ChangeRequest[]>;
    canUserEdit(requestId: string, userId: string): Promise<boolean>;
    getAvailableDevelopers(): Promise<Array<{
        id: string;
        name: string;
        currentWorkload: number;
        skills: string[];
    }>>;
    validateStatusTransition(currentStatus: string, newStatus: string, userRole: string): Promise<boolean>;
    getChangeHistory(requestId: string): Promise<Array<{
        timestamp: Date;
        action: string;
        user: string;
        details: string;
        oldValue?: string;
        newValue?: string;
    }>>;
    private buildWhereClause;
    private mapFromDatabase;
    private mapToDatabase;
}
//# sourceMappingURL=PrismaChangeRequestRepository.d.ts.map