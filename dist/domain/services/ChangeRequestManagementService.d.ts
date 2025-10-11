/**
 * ChangeRequestManagementService - Domain Layer
 *
 * Servicio de dominio que maneja la lógica de negocio compleja
 * para la gestión de solicitudes de cambio y su integración con GitHub.
 */
import { ChangeRequest, ChangeRequestType, Priority, Urgency, GitHubIntegration } from "../entities/ChangeRequest";
export interface IChangeRequestRepository {
    create(changeRequest: ChangeRequest): Promise<ChangeRequest>;
    findById(id: string): Promise<ChangeRequest | null>;
    findAll(): Promise<ChangeRequest[]>;
    update(id: string, changeRequest: ChangeRequest): Promise<ChangeRequest>;
    delete(id: string): Promise<void>;
    findByRequester(requesterId: string): Promise<ChangeRequest[]>;
    findByReviewer(reviewerId: string): Promise<ChangeRequest[]>;
    findByDeveloper(developerId: string): Promise<ChangeRequest[]>;
    findByStatus(status: string): Promise<ChangeRequest[]>;
    findByType(changeType: ChangeRequestType): Promise<ChangeRequest[]>;
    findByPriority(priority: Priority): Promise<ChangeRequest[]>;
    findPendingReview(): Promise<ChangeRequest[]>;
    findApprovedAwaitingDevelopment(): Promise<ChangeRequest[]>;
    findInDevelopment(): Promise<ChangeRequest[]>;
    findOverdue(): Promise<ChangeRequest[]>;
    findWithFilters(filters: {
        requesterId?: string;
        reviewerId?: string;
        developerId?: string;
        status?: string;
        changeType?: ChangeRequestType;
        priority?: Priority;
        urgency?: Urgency;
        startDate?: Date;
        endDate?: Date;
        hasGitHubIntegration?: boolean;
    }): Promise<ChangeRequest[]>;
}
export interface IGitHubIntegrationService {
    createIssue(changeRequest: ChangeRequest): Promise<{
        issueNumber: number;
        issueUrl: string;
    }>;
    updateIssue(issueNumber: number, changeRequest: ChangeRequest): Promise<void>;
    closeIssue(issueNumber: number, reason?: string): Promise<void>;
    createBranch(changeRequestId: string, baseBranch?: string): Promise<{
        branchName: string;
    }>;
    createPullRequest(changeRequest: ChangeRequest, branchName: string): Promise<{
        pullRequestNumber: number;
        pullRequestUrl: string;
    }>;
    mergePullRequest(pullRequestNumber: number): Promise<void>;
    syncChangeRequestWithGitHub(changeRequestId: string): Promise<GitHubIntegration>;
    handleWebhook(payload: any): Promise<void>;
}
export interface IUserRepository {
    findById(id: string): Promise<any | null>;
    findByRole(role: string): Promise<any[]>;
    exists(id: string): Promise<boolean>;
}
export interface INotificationService {
    notifyReviewerAssigned(changeRequestId: string, reviewerId: string): Promise<void>;
    notifyDeveloperAssigned(changeRequestId: string, developerId: string): Promise<void>;
    notifyStatusChange(changeRequestId: string, newStatus: string, targetUserId?: string): Promise<void>;
    notifyCommentAdded(changeRequestId: string, commentAuthor: string, targetUserId?: string): Promise<void>;
}
export declare class ChangeRequestManagementService {
    private changeRequestRepository;
    private gitHubService;
    private userRepository;
    private notificationService;
    constructor(changeRequestRepository: IChangeRequestRepository, gitHubService: IGitHubIntegrationService, userRepository: IUserRepository, notificationService: INotificationService);
    /**
     * Crear nueva solicitud de cambio
     */
    createChangeRequest(title: string, description: string, justification: string, changeType: ChangeRequestType, requesterId: string, priority?: Priority, urgency?: Urgency): Promise<ChangeRequest>;
    /**
     * Enviar solicitud para revisión
     */
    submitChangeRequest(changeRequestId: string): Promise<ChangeRequest>;
    /**
     * Actualizar información básica (solo en borrador)
     */
    updateChangeRequest(changeRequestId: string, updates: {
        title?: string;
        description?: string;
        justification?: string;
        changeType?: ChangeRequestType;
        priority?: Priority;
        urgency?: Urgency;
    }, userId: string): Promise<ChangeRequest>;
    /**
     * Asignar revisor y comenzar revisión
     */
    assignReviewer(changeRequestId: string, reviewerId: string, assignedBy: string): Promise<ChangeRequest>;
    /**
     * Aprobar solicitud
     */
    approveChangeRequest(changeRequestId: string, approverId: string, estimatedHours?: number, targetDate?: Date, reviewNotes?: string, createGitHubIssue?: boolean): Promise<ChangeRequest>;
    /**
     * Rechazar solicitud
     */
    rejectChangeRequest(changeRequestId: string, rejectionReason: string, rejectedBy: string): Promise<ChangeRequest>;
    /**
     * Asignar desarrollador y comenzar desarrollo
     */
    assignDeveloper(changeRequestId: string, developerId: string, assignedBy: string, technicalDetails?: string, createBranch?: boolean): Promise<ChangeRequest>;
    /**
     * Mover a pruebas
     */
    moveToTesting(changeRequestId: string, developerId: string, implementationNotes?: string, createPullRequest?: boolean): Promise<ChangeRequest>;
    /**
     * Marcar como implementada
     */
    markAsImplemented(changeRequestId: string, implementedBy: string, actualHours?: number, mergePullRequest?: boolean): Promise<ChangeRequest>;
    /**
     * Cerrar solicitud
     */
    closeChangeRequest(changeRequestId: string, closedBy: string, customerSatisfactionScore?: number): Promise<ChangeRequest>;
    /**
     * Agregar comentario a la solicitud
     */
    addComment(changeRequestId: string, comment: string, userId: string): Promise<ChangeRequest>;
    /**
     * Actualizar criterios de aceptación
     */
    updateAcceptanceCriteria(changeRequestId: string, criteria: string[], userId: string): Promise<ChangeRequest>;
    /**
     * Sincronizar solicitud con GitHub
     */
    syncWithGitHub(changeRequestId: string): Promise<ChangeRequest>;
    /**
     * Obtener solicitudes por desarrollador
     */
    getDeveloperAssignments(developerId: string, includeCompleted?: boolean): Promise<ChangeRequest[]>;
    /**
     * Obtener solicitudes pendientes de revisión
     */
    getPendingReviews(): Promise<ChangeRequest[]>;
    /**
     * Obtener solicitudes atrasadas
     */
    getOverdueRequests(): Promise<ChangeRequest[]>;
    /**
     * Obtener estadísticas de solicitudes
     */
    getChangeRequestStatistics(filters?: {
        startDate?: Date;
        endDate?: Date;
        developerId?: string;
    }): Promise<{
        totalRequests: number;
        byStatus: Record<string, number>;
        byType: Record<ChangeRequestType, number>;
        byPriority: Record<Priority, number>;
        averageCompletionTime: number;
        overdueCount: number;
    }>;
    /**
     * Obtener solicitud por ID con validación
     */
    private getChangeRequestById;
    /**
     * Formatear nombre de usuario
     */
    private formatUserName;
    /**
     * Notificar a revisores disponibles
     */
    private notifyAvailableReviewers;
}
//# sourceMappingURL=ChangeRequestManagementService.d.ts.map