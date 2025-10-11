import { ChangeRequest } from "@domain/entities/ChangeRequest";

export interface ChangeRequestFilters {
  status?: string;
  changeType?: string;
  priority?: string;
  urgency?: string;
  requesterId?: string;
  developerId?: string;
  assignedTo?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  page?: number;
  limit?: number;
}

export interface ChangeRequestRepository {
  /**
   * Crear una nueva solicitud de cambio
   */
  create(changeRequest: ChangeRequest): Promise<ChangeRequest>;

  /**
   * Obtener solicitud por ID
   */
  findById(id: string): Promise<ChangeRequest | null>;

  /**
   * Obtener todas las solicitudes con filtros
   */
  findAll(filters?: ChangeRequestFilters): Promise<{
    items: ChangeRequest[];
    total: number;
    page: number;
    totalPages: number;
  }>;

  /**
   * Obtener solicitudes de un usuario específico
   */
  findByRequesterId(
    requesterId: string,
    filters?: ChangeRequestFilters
  ): Promise<{
    items: ChangeRequest[];
    total: number;
  }>;

  /**
   * Obtener solicitudes asignadas a un desarrollador
   */
  findByDeveloperId(
    developerId: string,
    filters?: ChangeRequestFilters
  ): Promise<{
    items: ChangeRequest[];
    total: number;
  }>;

  /**
   * Actualizar solicitud de cambio
   */
  update(changeRequest: ChangeRequest): Promise<ChangeRequest>;

  /**
   * Eliminar solicitud de cambio
   */
  delete(id: string): Promise<void>;

  /**
   * Obtener estadísticas generales
   */
  getStatistics(): Promise<{
    totalRequests: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
    averageResolutionTime: number;
    pendingRequests: number;
    completedThisMonth: number;
  }>;

  /**
   * Obtener solicitudes que requieren aprobación de planes técnicos
   */
  findPendingTechnicalPlanApproval(): Promise<ChangeRequest[]>;

  /**
   * Verificar si el usuario puede editar la solicitud
   */
  canUserEdit(requestId: string, userId: string): Promise<boolean>;

  /**
   * Obtener desarrolladores disponibles para asignación
   */
  getAvailableDevelopers(): Promise<
    Array<{
      id: string;
      name: string;
      currentWorkload: number;
      skills: string[];
    }>
  >;

  /**
   * Validar transición de estado
   */
  validateStatusTransition(
    currentStatus: string,
    newStatus: string,
    userRole: string
  ): Promise<boolean>;

  /**
   * Obtener historial de cambios de una solicitud
   */
  getChangeHistory(requestId: string): Promise<
    Array<{
      timestamp: Date;
      action: string;
      user: string;
      details: string;
      oldValue?: string;
      newValue?: string;
    }>
  >;
}
