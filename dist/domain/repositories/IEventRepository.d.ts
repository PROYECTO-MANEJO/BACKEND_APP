export interface IEventRepository {
    findById(id: string): Promise<any | null>;
    findAll(): Promise<any[]>;
    create(eventData: any): Promise<any>;
    update(id: string, eventData: any): Promise<any | null>;
    delete(id: string): Promise<void>;
    findByCategory(categoryId: string): Promise<any[]>;
    findByOrganizer(organizerId: string): Promise<any[]>;
}
export interface EventFilters {
    category?: number;
    organizer?: string;
    status?: string;
    audienceType?: string;
    isFree?: boolean;
}
//# sourceMappingURL=IEventRepository.d.ts.map