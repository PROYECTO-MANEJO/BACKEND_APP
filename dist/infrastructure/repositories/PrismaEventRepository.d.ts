/**
 * Event Repository Implementation - Infrastructure Layer
 *
 * ✅ SRP: Responsabilidad única - Persistencia de datos de eventos
 * Implementación básica que funciona con EventData del dominio
 */
import { PrismaClient } from "@prisma/client";
import { EventData } from "../../domain/entities/Event";
import { IEventRepository } from "../../domain/repositories/IEventRepository";
export declare class PrismaEventRepository implements IEventRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(eventData: EventData): Promise<EventData>;
    findById(id: string): Promise<EventData | null>;
    findAll(): Promise<EventData[]>;
    update(id: string, eventData: Partial<EventData>): Promise<EventData | null>;
    delete(id: string): Promise<void>;
    findByCategory(categoryId: number): Promise<EventData[]>;
    findByOrganizer(organizerId: string): Promise<EventData[]>;
    private mapToEventData;
}
//# sourceMappingURL=PrismaEventRepository.d.ts.map