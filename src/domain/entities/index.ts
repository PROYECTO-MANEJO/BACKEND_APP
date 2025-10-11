/**
 * Domain Entities - Index
 *
 * Exporta todas las entidades del dominio
 */

// GitHub Entities
export * from './github';

// GitHub Entities
export * from './github';

// Administration Entities (with namespace to avoid conflicts)
import * as AdminEntities from './administration';
export { AdminEntities };

// Homepage Entities (with namespace to avoid conflicts) 
import * as HomepageEntities from './homepage';
export { HomepageEntities };

// Participation Entities (with namespace to avoid conflicts)
import * as ParticipationEntities from './participation';
export { ParticipationEntities };

// Events Entities (with namespace to avoid conflicts)
import * as EventEntities from './events';
export { EventEntities };

// Courses Entities (with namespace to avoid conflicts)
import * as CourseEntities from './courses';
export { CourseEntities };

// Re-export main entities directly for convenience
export { HomepageContent, HomepageDashboard } from './homepage';
export { Participation, Enrollment } from './participation';
export { Event, EventCategory } from './events';  
export { Course, CourseCategory } from './courses';

// Base Entity Types
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

// Common Domain Types
export type EntityId = string;
export type EntityTimestamp = Date;
export type EntityStatus = "ACTIVE" | "INACTIVE" | "DELETED";

// Domain Events (for future implementation)
export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateVersion: number;
  eventData: Record<string, any>;
  occurredAt: Date;
}

// Value Objects (for future implementation)
export interface Email {
  value: string;
  isValid(): boolean;
}

export interface Phone {
  value: string;
  countryCode?: string;
  isValid(): boolean;
}
