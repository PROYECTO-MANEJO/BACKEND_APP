/**
 * Tipos básicos de la aplicación
 */

/**
 * Tipos para identificadores
 */
export type ID = number;
export type StringID = string;
export type UUID = string;

/**
 * Tipos para paginación
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Tipos para filtros
 */
export interface BaseFilter {
  searchTerm?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Estados comunes de la aplicación
 */
export enum EntityStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
  DELETED = "DELETED",
}

/**
 * Tipos para respuestas HTTP
 */
export type HttpStatusCode =
  | 200
  | 201
  | 400
  | 401
  | 403
  | 404
  | 409
  | 422
  | 500;

/**
 * Tipos de logs
 */
export enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

/**
 * Configuración de environment
 */
export interface AppConfig {
  port: number;
  nodeEnv: "development" | "production" | "test";
  dbUrl: string;
  jwtSecret: string;
  jwtExpiration: string;
}

/**
 * Metadata para auditoría
 */
export interface AuditMetadata {
  createdBy?: number;
  updatedBy?: number;
  createdAt: Date;
  updatedAt: Date;
  version?: number;
}
