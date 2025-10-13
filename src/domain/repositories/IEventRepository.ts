import { Event, EventData } from "../entities/Event";

export interface IEventRepository {
  findById(id: string): Promise<EventData | null>;
  findAll(): Promise<EventData[]>;
  create(eventData: EventData): Promise<EventData>;
  update(id: string, eventData: Partial<EventData>): Promise<EventData | null>;
  delete(id: string): Promise<void>;
  findByCategory(categoryId: number): Promise<EventData[]>;
  findByOrganizer(organizerId: string): Promise<EventData[]>;
}

export interface EventFilters {
  category?: number;
  organizer?: string;
  status?: string;
  audienceType?: string;
  isFree?: boolean;
}
