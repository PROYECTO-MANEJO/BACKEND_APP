/**
 * EventRepository - Infrastructure Layer
 *
 * Implementación del repositorio de eventos usando Prisma ORM
 * para operaciones de persistencia de datos.
 */
import { PrismaClient } from "@prisma/client";
import { Event } from "../../../domain/entities/Event";
import { IEventRepository, EventFilters } from "../../../domain/services/EventManagementService";
export declare class EventRepository implements IEventRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    findAll(filters?: EventFilters): Promise<Event[]>;
    findById(id: string): Promise<Event | null>;
    findByOrganizer(cedOrganizador: string, filters?: EventFilters): Promise<Event[]>;
    findAvailableEvents(filters?: EventFilters): Promise<Event[]>;
    findUserEvents(cedUsuario: string, filters?: EventFilters): Promise<Event[]>;
    create(event: Event): Promise<Event>;
    update(id: string, event: Event): Promise<Event>;
    delete(id: string): Promise<boolean>;
    existsById(id: string): Promise<boolean>;
    existsByName(nombre: string, excludeId?: string): Promise<boolean>;
    count(filters?: EventFilters): Promise<number>;
    findPaginated(page: number, limit: number, filters?: EventFilters): Promise<{
        events: Event[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    private buildWhereClause;
    private toDomainEntity;
}
//# sourceMappingURL=EventRepository.d.ts.map