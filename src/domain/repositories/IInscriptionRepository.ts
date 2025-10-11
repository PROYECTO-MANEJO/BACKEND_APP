/**
 * IInscriptionRepository Interface - Domain Layer
 * 
 * Interfaz que define el contrato para el repositorio de inscripciones.
 * Maneja tanto inscripciones a eventos como a cursos.
 */

import { Inscription, InscriptionType } from '../entities/Inscription';

export interface IInscriptionRepository {
  // ✅ CRUD BÁSICO
  create(inscription: Inscription): Promise<Inscription>;
  findById(id: string): Promise<Inscription | null>;
  findAll(): Promise<Inscription[]>;
  update(id: string, inscription: Inscription): Promise<Inscription>;
  delete(id: string): Promise<void>;

  // ✅ CONSULTAS POR USUARIO
  findByUser(userId: string): Promise<Inscription[]>;
  findByUserAndType(userId: string, type: InscriptionType): Promise<Inscription[]>;
  findByUserAndTarget(userId: string, targetId: string, type: InscriptionType): Promise<Inscription | null>;
  getUserInscriptionCount(userId: string): Promise<number>;

  // ✅ CONSULTAS POR EVENTO/CURSO
  findByTarget(targetId: string, type: InscriptionType): Promise<Inscription[]>;
  findByEvent(eventId: string): Promise<Inscription[]>;
  findByCourse(courseId: string): Promise<Inscription[]>;
  countActiveByTarget(targetId: string, type: InscriptionType): Promise<number>;
  countApprovedByTarget(targetId: string, type: InscriptionType): Promise<number>;

  // ✅ CONSULTAS POR ESTADO DE PAGO
  findByPaymentStatus(status: string): Promise<Inscription[]>;
  findPendingApprovals(): Promise<Inscription[]>;
  findApprovedInscriptions(): Promise<Inscription[]>;
  findRejectedInscriptions(): Promise<Inscription[]>;
  findCancelledInscriptions(): Promise<Inscription[]>;

  // ✅ CONSULTAS POR TIPO
  findEventInscriptions(): Promise<Inscription[]>;
  findCourseInscriptions(): Promise<Inscription[]>;

  // ✅ CONSULTAS POR FECHA
  findByDateRange(startDate: Date, endDate: Date): Promise<Inscription[]>;
  findByInscriptionDate(date: Date): Promise<Inscription[]>;
  findRecentInscriptions(days: number): Promise<Inscription[]>;

  // ✅ CONSULTAS CON FILTROS AVANZADOS
  findWithFilters(filters: {
    userId?: string;
    targetId?: string;
    type?: InscriptionType;
    paymentStatus?: string;
    startDate?: Date;
    endDate?: Date;
    hasPaymentProof?: boolean;
    hasMotivationLetter?: boolean;
    approvedBy?: string;
  }): Promise<Inscription[]>;

  // ✅ CONSULTAS CON PAGINACIÓN
  findAllPaginated(page: number, limit: number): Promise<{
    inscriptions: Inscription[];
    total: number;
    totalPages: number;
    currentPage: number;
  }>;

  findByUserPaginated(userId: string, page: number, limit: number): Promise<{
    inscriptions: Inscription[];
    total: number;
    totalPages: number;
    currentPage: number;
  }>;

  findPendingPaginated(page: number, limit: number): Promise<{
    inscriptions: Inscription[];
    total: number;
    totalPages: number;
    currentPage: number;
  }>;

  // ✅ VALIDACIONES DE NEGOCIO
  existsByUserAndTarget(userId: string, targetId: string, type: InscriptionType): Promise<boolean>;
  hasActiveInscription(userId: string, targetId: string, type: InscriptionType): Promise<boolean>;
  canEnrollInTarget(userId: string, targetId: string, type: InscriptionType): Promise<boolean>;

  // ✅ ESTADÍSTICAS Y REPORTES
  getInscriptionStatistics(): Promise<{
    totalInscriptions: number;
    eventInscriptions: number;
    courseInscriptions: number;
    pendingApprovals: number;
    approvedInscriptions: number;
    rejectedInscriptions: number;
    cancelledInscriptions: number;
  }>;

  getTargetStatistics(targetId: string, type: InscriptionType): Promise<{
    totalInscriptions: number;
    approvedInscriptions: number;
    pendingInscriptions: number;
    rejectedInscriptions: number;
    cancelledInscriptions: number;
    averageProcessingTime?: number; // en días
  }>;

  getUserStatistics(userId: string): Promise<{
    totalInscriptions: number;
    eventInscriptions: number;
    courseInscriptions: number;
    approvedInscriptions: number;
    pendingInscriptions: number;
    cancelledInscriptions: number;
  }>;

  // ✅ CONSULTAS DE CAPACIDAD
  getApprovedCountForTarget(targetId: string, type: InscriptionType): Promise<number>;
  getPendingCountForTarget(targetId: string, type: InscriptionType): Promise<number>;
  getTotalActiveCountForTarget(targetId: string, type: InscriptionType): Promise<number>;

  // ✅ CONSULTAS DE COMPROBANTES DE PAGO
  findInscriptionsWithPaymentProof(): Promise<Inscription[]>;
  findInscriptionsWithoutPaymentProof(): Promise<Inscription[]>;
  findByPaymentMethod(method: string): Promise<Inscription[]>;

  // ✅ CONSULTAS ADMINISTRATIVAS
  findByApprover(approverUserId: string): Promise<Inscription[]>;
  findApprovalsByDateRange(startDate: Date, endDate: Date): Promise<Inscription[]>;
  findPendingOlderThan(days: number): Promise<Inscription[]>;

  // ✅ OPERACIONES EN LOTE
  approveMultiple(inscriptionIds: string[], approverUserId: string): Promise<Inscription[]>;
  rejectMultiple(inscriptionIds: string[]): Promise<Inscription[]>;
  deleteByUser(userId: string): Promise<void>;
  deleteByTarget(targetId: string, type: InscriptionType): Promise<void>;

  // ✅ BÚSQUEDA Y FILTROS AVANZADOS
  searchInscriptions(searchTerm: string): Promise<Inscription[]>;
  findDuplicateInscriptions(): Promise<Inscription[]>;
  findInscriptionsRequiringAction(): Promise<Inscription[]>;

  // ✅ EXPORTACIÓN Y REPORTES
  getInscriptionsForExport(filters?: {
    type?: InscriptionType;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Inscription[]>;

  // ✅ MANTENIMIENTO Y LIMPIEZA
  cleanupOldRejectedInscriptions(olderThanDays: number): Promise<number>;
  archiveCompletedInscriptions(olderThanDays: number): Promise<number>;
}