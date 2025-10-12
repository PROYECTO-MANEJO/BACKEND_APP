/**
 * Domain Entities - Index
 *
 * Exporta todas las entidades del dominio
 */
export * from "./github";
export * from "./github";
import * as AdminEntities from "./administration";
export { AdminEntities };
import * as HomepageEntities from "./homepage";
export { HomepageEntities };
import * as ParticipationEntities from "./participation";
export { ParticipationEntities };
import * as EventEntities from "./events";
export { EventEntities };
import * as CourseEntities from "./courses";
export { CourseEntities };
export { HomepageContent, HomepageDashboard } from "./homepage";
export { Participation, Enrollment } from "./participation";
export { Event, EventCategory } from "./events";
export { Course, CourseCategory } from "./courses";
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface EntityWithStatus<T> extends BaseEntity {
    status: T;
}
export interface EntityWithMetadata extends BaseEntity {
    metadata?: Record<string, any>;
}
export type EntityId = string;
export type EntityTimestamp = Date;
export type EntityStatus = "ACTIVE" | "INACTIVE" | "DELETED";
export interface DomainEvent {
    id: string;
    type: string;
    aggregateId: string;
    aggregateVersion: number;
    eventData: Record<string, any>;
    occurredAt: Date;
}
export interface Email {
    value: string;
    isValid(): boolean;
}
export interface Phone {
    value: string;
    countryCode?: string;
    isValid(): boolean;
}
//# sourceMappingURL=index.d.ts.map