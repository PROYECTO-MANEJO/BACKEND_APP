/**
 * Domain Entities - Index
 *
 * Exporta todas las entidades del dominio
 */

// GitHub Entities
export * from './github';

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