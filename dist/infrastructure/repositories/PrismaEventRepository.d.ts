/**
 * Event Repository Implementation - Infrastructure Layer
 *
 * Implementación simplificada que funciona con el esquema Prisma real
 * Maneja operaciones básicas de eventos según la estructura existente
 */
import { PrismaClient } from "@prisma/client";
export interface EventData {
    id?: string;
    name: string;
    description: string;
    categoryId: string;
    startDate: Date;
    endDate?: Date;
    startTime: Date;
    endTime?: Date;
    duration: number;
    area: string;
    location: string;
    organizerId: string;
    maxCapacity: number;
    audienceType: string;
    isFree: boolean;
    price?: number;
    attendanceApprovalPercentage: number;
    status?: string;
    requiresMotivationLetter?: boolean;
    associatedCareers?: string[];
}
export declare class PrismaEventRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(eventData: EventData): Promise<EventData>;
    findById(id: string): Promise<EventData | null>;
    findAll(): Promise<EventData[]>;
    update(id: string, eventData: Partial<EventData>): Promise<EventData>;
    delete(id: string): Promise<void>;
    findByCategory(categoryId: string): Promise<EventData[]>;
    findByOrganizer(organizerId: string): Promise<EventData[]>;
    findByStatus(status: string): Promise<EventData[]>;
    findUpcoming(days?: number): Promise<EventData[]>;
    getEnrollmentCount(eventId: string): Promise<number>;
    findByArea(area: string): Promise<EventData[]>;
    private mapToEventData;
}
//# sourceMappingURL=PrismaEventRepository.d.ts.map