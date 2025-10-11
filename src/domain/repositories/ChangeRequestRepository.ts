/**
 * ChangeRequestRepository - Domain Repository Interface
 *
 * Interfaz para el repositorio de solicitudes de cambio.
 */

import {
  ChangeRequest,
  ChangeRequestStatus,
  Priority,
} from "../entities/ChangeRequest";

export interface ChangeRequestRepository {
  /**
   * Guarda una solicitud de cambio en el repositorio
   */
  save(changeRequest: ChangeRequest): Promise<ChangeRequest>;

  /**
   * Busca una solicitud de cambio por ID
   */
  findById(id: string): Promise<ChangeRequest | null>;

  /**
   * Busca solicitudes por estado
   */
  findByStatus(status: ChangeRequestStatus): Promise<ChangeRequest[]>;

  /**
   * Busca solicitudes por prioridad
   */
  findByPriority(priority: Priority): Promise<ChangeRequest[]>;

  /**
   * Busca solicitudes por solicitante
   */
  findByRequestedBy(userId: string): Promise<ChangeRequest[]>;

  /**
   * Busca solicitudes asignadas a un usuario
   */
  findByAssignedTo(userId: string): Promise<ChangeRequest[]>;

  /**
   * Busca solicitudes por revisor
   */
  findByReviewedBy(userId: string): Promise<ChangeRequest[]>;

  /**
   * Busca solicitudes por categoría
   */
  findByCategory(category: string): Promise<ChangeRequest[]>;

  /**
   * Busca solicitudes por rango de fechas de creación
   */
  findByCreationDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<ChangeRequest[]>;

  /**
   * Busca solicitudes con filtros múltiples
   */
  findWithFilters(filters: {
    status?: ChangeRequestStatus;
    priority?: Priority;
    requestedBy?: string;
    assignedTo?: string;
    reviewedBy?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
    tags?: string[];
    githubIssueNumber?: number;
  }): Promise<ChangeRequest[]>;

  /**
   * Busca solicitudes por etiquetas
   */
  findByTags(tags: string[]): Promise<ChangeRequest[]>;

  /**
   * Busca por número de issue de GitHub
   */
  findByGithubIssueNumber(issueNumber: number): Promise<ChangeRequest | null>;

  /**
   * Busca por URL del Pull Request
   */
  findByGithubPrUrl(prUrl: string): Promise<ChangeRequest | null>;

  /**
   * Cuenta solicitudes por estado
   */
  countByStatus(status: ChangeRequestStatus): Promise<number>;

  /**
   * Cuenta solicitudes por prioridad
   */
  countByPriority(priority: Priority): Promise<number>;

  /**
   * Obtiene estadísticas de solicitudes de cambio
   */
  getStatistics(): Promise<{
    total: number;
    byStatus: { [status: string]: number };
    byPriority: { [priority: string]: number };
    createdThisMonth: number;
    completedThisMonth: number;
    averageCompletionTimeInDays: number;
    pendingReview: number;
    inProgress: number;
  }>;

  /**
   * Actualiza una solicitud existente
   */
  update(changeRequest: ChangeRequest): Promise<ChangeRequest>;

  /**
   * Elimina una solicitud por ID
   */
  deleteById(id: string): Promise<boolean>;

  /**
   * Busca solicitudes vencidas (sin actividad por días)
   */
  findStaleRequests(daysInactive: number): Promise<ChangeRequest[]>;

  /**
   * Busca solicitudes urgentes (alta prioridad y antiguas)
   */
  findUrgentRequests(): Promise<ChangeRequest[]>;

  /**
   * Obtiene solicitudes asignadas sin actividad reciente
   */
  findInactiveAssignedRequests(
    daysSinceLastUpdate: number
  ): Promise<ChangeRequest[]>;

  /**
   * Busca solicitudes por complejidad estimada
   */
  findByEstimatedHours(
    minHours?: number,
    maxHours?: number
  ): Promise<ChangeRequest[]>;

  /**
   * Obtiene métricas de rendimiento del desarrollador
   */
  getDeveloperMetrics(userId: string): Promise<{
    totalAssigned: number;
    completed: number;
    inProgress: number;
    averageCompletionTime: number;
    completionRate: number;
  }>;

  /**
   * Busca solicitudes relacionadas por dependencias
   */
  findRelatedRequests(changeRequestId: string): Promise<ChangeRequest[]>;

  /**
   * Obtiene historial de cambios de estado
   */
  getStatusHistory(changeRequestId: string): Promise<
    Array<{
      fromStatus: ChangeRequestStatus;
      toStatus: ChangeRequestStatus;
      changedBy: string;
      changedAt: Date;
      comment?: string;
    }>
  >;

  /**
   * Busca solicitudes por texto en título o descripción
   */
  searchByText(searchText: string): Promise<ChangeRequest[]>;

  /**
   * Obtiene solicitudes más comentadas
   */
  getMostCommented(limit: number): Promise<ChangeRequest[]>;

  /**
   * Verifica si el usuario puede acceder a la solicitud
   */
  canUserAccess(changeRequestId: string, userId: string): Promise<boolean>;

  /**
   * Obtiene solicitudes que requieren atención del usuario
   */
  getRequiringUserAttention(userId: string): Promise<ChangeRequest[]>;
}
