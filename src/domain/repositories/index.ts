/**
 * Domain Repositories - Centralized Exports
 *
 * Todas las interfaces de repositorios del dominio exportadas desde un punto central
 * para facilitar imports y mantener organización
 */

// ✅ Repositorios existentes
export type { IUserRepository } from "./IUserRepository";
export type { ICourseRepository } from "./ICourseRepository";
export type { IEventRepository } from "./IEventRepository";
export type { ICertificateRepository } from "./ICertificateRepository";
export type { IEnrollmentRepository } from "./IEnrollmentRepository";
export type { DeveloperRepository } from "./IDeveloperRepository";
export type { ChangeRequestRepository } from "./IChangeRequestRepository";
export type { IAuthenticationRepository } from "./IAuthenticationRepository";
export type { IEmailService } from "./IEmailService";

// ✅ Nuevos repositorios implementados siguiendo principios SOLID
export type { IOrganizerRepository } from "./IOrganizerRepository";
export type { ICategoryRepository } from "./ICategoryRepository";
export type { IParticipationRepository } from "./IParticipationRepository";
export type { IDocumentRepository } from "./IDocumentRepository";
export type { IReportRepository } from "./IReportRepository";
export type { ICareerRepository } from "./ICareerRepository";

// Exportar tipos y filtros
export type { OrganizerFilters } from "./IOrganizerRepository";
export type { CategoryFilters } from "./ICategoryRepository";
export type {
  ParticipationFilters,
  CertificateData,
  ParticipationStats,
} from "./IParticipationRepository";
export type {
  DocumentFilters,
  DocumentData,
  DocumentInfo,
  UserDocuments,
  DocumentStats,
} from "./IDocumentRepository";
export type {
  ReportFilters,
  PaymentFilters,
  ReportMetrics,
  DashboardData,
} from "./IReportRepository";
export type {
  CareerFilters,
  CareerRelationsCount,
  CareerStats,
} from "./ICareerRepository";
