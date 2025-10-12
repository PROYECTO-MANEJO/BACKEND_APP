/**
 * ChangeRequest Entity - Domain Layer
 *
 * Entidad de dominio que representa una solicitud de cambio en el sistema.
 * Maneja el flujo completo desde creación hasta implementación y cierre.
 */
export type ChangeRequestType = "FUNCIONALIDAD" | "CORRECCION" | "MEJORA" | "CONFIGURACION" | "SEGURIDAD" | "RENDIMIENTO" | "DOCUMENTACION";
export type Priority = "BAJA" | "MEDIA" | "ALTA" | "CRITICA";
export type Urgency = "NORMAL" | "URGENTE" | "INMEDIATA";
export type ChangeRequestStatus = "BORRADOR" | "PENDIENTE" | "EN_REVISION" | "APROBADA" | "RECHAZADA" | "ESPERANDO_INFORMACION" | "EN_DESARROLLO" | "EN_TESTING" | "EN_PAUSA" | "COMPLETADA" | "CERRADA" | "CANCELADA";
export interface GitHubIntegration {
    issueNumber?: number;
    issueUrl?: string;
    branchName?: string;
    pullRequestNumber?: number;
    pullRequestUrl?: string;
    commitHashes?: string[];
    repositoryName?: string;
    lastSyncDate?: Date;
}
export interface ChangeRequestData {
    id?: string;
    title: string;
    description: string;
    justification: string;
    changeType: ChangeRequestType;
    priority: Priority;
    urgency: Urgency;
    status: ChangeRequestStatus;
    requesterId: string;
    requesterName?: string;
    reviewerId?: string;
    reviewerName?: string;
    developerId?: string;
    developerName?: string;
    approverId?: string;
    approverName?: string;
    requestDate: Date;
    reviewDate?: Date;
    approvalDate?: Date;
    startDate?: Date;
    targetDate?: Date;
    completionDate?: Date;
    closedDate?: Date;
    technicalDetails?: string;
    acceptanceCriteria?: string[];
    estimatedHours?: number;
    actualHours?: number;
    comments?: string;
    reviewNotes?: string;
    rejectionReason?: string;
    implementationNotes?: string;
    githubIntegration?: GitHubIntegration;
    attachments?: string[];
    documentationLinks?: string[];
    businessImpact?: string;
    technicalRisk?: string;
    affectedSystems?: string[];
    effortPoints?: number;
    complexityScore?: number;
    customerSatisfactionScore?: number;
    version: number;
    parentRequestId?: string;
    relatedRequestIds?: string[];
    createdAt: Date;
    updatedAt: Date;
    requester?: any;
    reviewer?: any;
    developer?: any;
    approver?: any;
}
export declare class ChangeRequest {
    private data;
    private constructor();
    static create(title: string, description: string, justification: string, changeType: ChangeRequestType, requesterId: string, requesterName?: string, priority?: Priority, urgency?: Urgency): ChangeRequest;
    static fromData(data: ChangeRequestData): ChangeRequest;
    /**
     * Enviar solicitud para revisión
     */
    submit(): void;
    /**
     * Poner solicitud en revisión
     */
    startReview(reviewerId: string, reviewerName?: string): void;
    /**
     * Aprobar solicitud
     */
    approve(approverId: string, approverName?: string, estimatedHours?: number, targetDate?: Date, reviewNotes?: string): void;
    /**
     * Rechazar solicitud
     */
    reject(rejectionReason: string): void;
    /**
     * Asignar desarrollador y comenzar desarrollo
     */
    startDevelopment(developerId: string, developerName?: string, technicalDetails?: string): void;
    /**
     * Mover a pruebas
     */
    moveToTesting(implementationNotes?: string): void;
    /**
     * Marcar como implementada
     */
    markAsImplemented(actualHours?: number): void;
    /**
     * Cerrar solicitud
     */
    close(customerSatisfactionScore?: number): void;
    /**
     * Cancelar solicitud
     */
    cancel(reason?: string): void;
    /**
     * Actualizar información básica (solo si está en BORRADOR)
     */
    updateBasicInfo(updates: {
        title?: string;
        description?: string;
        justification?: string;
        changeType?: ChangeRequestType;
        priority?: Priority;
        urgency?: Urgency;
    }): void;
    /**
     * Agregar comentario
     */
    addComment(comment: string, userId: string): void;
    /**
     * Actualizar criterios de aceptación
     */
    updateAcceptanceCriteria(criteria: string[]): void;
    /**
     * Actualizar detalles técnicos
     */
    updateTechnicalDetails(technicalDetails: string): void;
    /**
     * Actualizar integración con GitHub
     */
    updateGitHubIntegration(integration: GitHubIntegration): void;
    /**
     * Agregar adjunto
     */
    addAttachment(filePath: string): void;
    /**
     * Quitar adjunto
     */
    removeAttachment(filePath: string): void;
    private validateData;
    private validateRequiredFieldsForSubmission;
    isDraft(): boolean;
    isSubmitted(): boolean;
    isUnderReview(): boolean;
    isApproved(): boolean;
    isRejected(): boolean;
    isInDevelopment(): boolean;
    isInTesting(): boolean;
    isImplemented(): boolean;
    isClosed(): boolean;
    isCancelled(): boolean;
    isActive(): boolean;
    canBeEdited(): boolean;
    canBeSubmitted(): boolean;
    canBeApproved(): boolean;
    canBeRejected(): boolean;
    canStartDevelopment(): boolean;
    canBeCancelled(): boolean;
    /**
     * Calcular progreso como porcentaje
     */
    getProgressPercentage(): number;
    /**
     * Obtener días transcurridos desde la solicitud
     */
    getDaysFromRequest(): number;
    /**
     * Verificar si está atrasada
     */
    isOverdue(): boolean;
    /**
     * Obtener resumen para dashboard
     */
    getSummary(): {
        id?: string;
        title: string;
        type: ChangeRequestType;
        status: ChangeRequestStatus;
        priority: Priority;
        urgency: Urgency;
        requestDate: Date;
        targetDate?: Date;
        progress: number;
        isOverdue: boolean;
        assignedTo?: string;
    };
    get id(): string | undefined;
    get title(): string;
    get description(): string;
    get changeType(): ChangeRequestType;
    get status(): ChangeRequestStatus;
    get priority(): Priority;
    get urgency(): Urgency;
    get requesterId(): string;
    get developerId(): string | undefined;
    get requestDate(): Date;
    get targetDate(): Date | undefined;
    get estimatedHours(): number | undefined;
    get actualHours(): number | undefined;
    get githubIntegration(): GitHubIntegration | undefined;
    get version(): number;
    get createdAt(): Date;
    get updatedAt(): Date;
    get reviewerId(): string | undefined;
    get approverId(): string | undefined;
    get completionDate(): Date | undefined;
    get closedDate(): Date | undefined;
    toPlainObject(): ChangeRequestData;
    toJSON(): ChangeRequestData;
}
//# sourceMappingURL=ChangeRequest.d.ts.map