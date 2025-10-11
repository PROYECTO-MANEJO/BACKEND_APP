/**
 * ChangeRequest Entity - Domain Layer
 *
 * Entidad de dominio que representa una solicitud de cambio en el sistema.
 * Maneja el flujo completo desde creación hasta implementación y cierre.
 */

export type ChangeRequestType =
  | "FUNCIONALIDAD"
  | "CORRECCION"
  | "MEJORA"
  | "CONFIGURACION"
  | "SEGURIDAD"
  | "RENDIMIENTO"
  | "DOCUMENTACION";

export type Priority = "BAJA" | "MEDIA" | "ALTA" | "CRITICA";

export type Urgency = "NORMAL" | "URGENTE" | "INMEDIATA";

export type ChangeRequestStatus =
  | "BORRADOR"
  | "PENDIENTE"
  | "EN_REVISION"
  | "APROBADA"
  | "RECHAZADA"
  | "ESPERANDO_INFORMACION"
  | "EN_DESARROLLO"
  | "EN_TESTING"
  | "EN_PAUSA"
  | "COMPLETADA"
  | "CERRADA"
  | "CANCELADA";

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

  // Información básica
  title: string;
  description: string;
  justification: string;
  changeType: ChangeRequestType;
  priority: Priority;
  urgency: Urgency;
  status: ChangeRequestStatus;

  // Solicitante
  requesterId: string;
  requesterName?: string;

  // Asignación y aprobación
  reviewerId?: string;
  reviewerName?: string;
  developerId?: string;
  developerName?: string;
  approverId?: string;
  approverName?: string;

  // Fechas importantes
  requestDate: Date;
  reviewDate?: Date;
  approvalDate?: Date;
  startDate?: Date;
  targetDate?: Date;
  completionDate?: Date;
  closedDate?: Date;

  // Detalles técnicos
  technicalDetails?: string;
  acceptanceCriteria?: string[];
  estimatedHours?: number;
  actualHours?: number;

  // Comunicación
  comments?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  implementationNotes?: string;

  // Integración con GitHub
  githubIntegration?: GitHubIntegration;

  // Documentos y archivos
  attachments?: string[];
  documentationLinks?: string[];

  // Impacto y riesgos
  businessImpact?: string;
  technicalRisk?: string;
  affectedSystems?: string[];

  // Métricas y seguimiento
  effortPoints?: number;
  complexityScore?: number;
  customerSatisfactionScore?: number;

  // Control de versiones
  version: number;
  parentRequestId?: string;
  relatedRequestIds?: string[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Relaciones (para mapeo desde BD)
  requester?: any;
  reviewer?: any;
  developer?: any;
  approver?: any;
}

export class ChangeRequest {
  private constructor(private data: ChangeRequestData) {
    this.validateData();
  }

  // ✅ FACTORY METHODS

  static create(
    title: string,
    description: string,
    justification: string,
    changeType: ChangeRequestType,
    requesterId: string,
    requesterName?: string,
    priority: Priority = "MEDIA",
    urgency: Urgency = "NORMAL"
  ): ChangeRequest {
    const changeRequestData: ChangeRequestData = {
      title: title.trim(),
      description: description.trim(),
      justification: justification.trim(),
      changeType,
      priority,
      urgency,
      status: "BORRADOR",
      requesterId,
      requesterName,
      requestDate: new Date(),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new ChangeRequest(changeRequestData);
  }

  static fromData(data: ChangeRequestData): ChangeRequest {
    return new ChangeRequest(data);
  }

  // ✅ BUSINESS LOGIC METHODS - FLUJO DE ESTADOS

  /**
   * Enviar solicitud para revisión
   */
  submit(): void {
    if (this.data.status !== "BORRADOR") {
      throw new Error("Solo se pueden enviar solicitudes en borrador");
    }

    this.validateRequiredFieldsForSubmission();

    this.data.status = "PENDIENTE";
    this.data.updatedAt = new Date();
  }

  /**
   * Poner solicitud en revisión
   */
  startReview(reviewerId: string, reviewerName?: string): void {
    if (this.data.status !== "PENDIENTE") {
      throw new Error("Solo se pueden revisar solicitudes enviadas");
    }

    this.data.status = "EN_REVISION";
    this.data.reviewerId = reviewerId;
    this.data.reviewerName = reviewerName;
    this.data.reviewDate = new Date();
    this.data.updatedAt = new Date();
  }

  /**
   * Aprobar solicitud
   */
  approve(
    approverId: string,
    approverName?: string,
    estimatedHours?: number,
    targetDate?: Date,
    reviewNotes?: string
  ): void {
    if (this.data.status !== "EN_REVISION") {
      throw new Error("Solo se pueden aprobar solicitudes en revisión");
    }

    this.data.status = "APROBADA";
    this.data.approverId = approverId;
    this.data.approverName = approverName;
    this.data.approvalDate = new Date();
    this.data.estimatedHours = estimatedHours;
    this.data.targetDate = targetDate;
    this.data.reviewNotes = reviewNotes;
    this.data.updatedAt = new Date();
  }

  /**
   * Rechazar solicitud
   */
  reject(rejectionReason: string): void {
    if (this.data.status !== "EN_REVISION") {
      throw new Error("Solo se pueden rechazar solicitudes en revisión");
    }

    if (!rejectionReason?.trim()) {
      throw new Error("La razón de rechazo es obligatoria");
    }

    this.data.status = "RECHAZADA";
    this.data.rejectionReason = rejectionReason.trim();
    this.data.updatedAt = new Date();
  }

  /**
   * Asignar desarrollador y comenzar desarrollo
   */
  startDevelopment(
    developerId: string,
    developerName?: string,
    technicalDetails?: string
  ): void {
    if (this.data.status !== "APROBADA") {
      throw new Error("Solo se pueden desarrollar solicitudes aprobadas");
    }

    this.data.status = "EN_DESARROLLO";
    this.data.developerId = developerId;
    this.data.developerName = developerName;
    this.data.startDate = new Date();
    if (technicalDetails) {
      this.data.technicalDetails = technicalDetails;
    }
    this.data.updatedAt = new Date();
  }

  /**
   * Mover a pruebas
   */
  moveToTesting(implementationNotes?: string): void {
    if (this.data.status !== "EN_DESARROLLO") {
      throw new Error(
        "Solo se pueden enviar a pruebas solicitudes en desarrollo"
      );
    }

    this.data.status = "EN_TESTING";
    if (implementationNotes) {
      this.data.implementationNotes = implementationNotes;
    }
    this.data.updatedAt = new Date();
  }

  /**
   * Marcar como implementada
   */
  markAsImplemented(actualHours?: number): void {
    if (this.data.status !== "EN_TESTING") {
      throw new Error(
        "Solo se pueden implementar solicitudes que han pasado pruebas"
      );
    }

    this.data.status = "COMPLETADA";
    this.data.completionDate = new Date();
    if (actualHours !== undefined) {
      this.data.actualHours = actualHours;
    }
    this.data.updatedAt = new Date();
  }

  /**
   * Cerrar solicitud
   */
  close(customerSatisfactionScore?: number): void {
    if (this.data.status !== "COMPLETADA") {
      throw new Error("Solo se pueden cerrar solicitudes implementadas");
    }

    this.data.status = "CERRADA";
    this.data.closedDate = new Date();
    if (customerSatisfactionScore !== undefined) {
      this.data.customerSatisfactionScore = customerSatisfactionScore;
    }
    this.data.updatedAt = new Date();
  }

  /**
   * Cancelar solicitud
   */
  cancel(reason?: string): void {
    const cancellableStatuses: ChangeRequestStatus[] = [
      "BORRADOR",
      "PENDIENTE",
      "EN_REVISION",
      "APROBADA",
      "EN_DESARROLLO",
    ];

    if (!cancellableStatuses.includes(this.data.status)) {
      throw new Error("No se puede cancelar una solicitud en este estado");
    }

    this.data.status = "CANCELADA";
    if (reason) {
      this.data.comments = `${
        this.data.comments || ""
      }\nCANCELADO: ${reason}`.trim();
    }
    this.data.updatedAt = new Date();
  }

  // ✅ MODIFICATION METHODS

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
  }): void {
    if (this.data.status !== "BORRADOR") {
      throw new Error("Solo se puede modificar información básica en borrador");
    }

    if (updates.title !== undefined) {
      if (!updates.title.trim()) {
        throw new Error("El título no puede estar vacío");
      }
      this.data.title = updates.title.trim();
    }

    if (updates.description !== undefined) {
      if (!updates.description.trim()) {
        throw new Error("La descripción no puede estar vacía");
      }
      this.data.description = updates.description.trim();
    }

    if (updates.justification !== undefined) {
      if (!updates.justification.trim()) {
        throw new Error("La justificación no puede estar vacía");
      }
      this.data.justification = updates.justification.trim();
    }

    if (updates.changeType !== undefined) {
      this.data.changeType = updates.changeType;
    }

    if (updates.priority !== undefined) {
      this.data.priority = updates.priority;
    }

    if (updates.urgency !== undefined) {
      this.data.urgency = updates.urgency;
    }

    this.data.updatedAt = new Date();
  }

  /**
   * Agregar comentario
   */
  addComment(comment: string, userId: string): void {
    if (!comment?.trim()) {
      throw new Error("El comentario no puede estar vacío");
    }

    const timestamp = new Date().toISOString();
    const newComment = `[${timestamp}] ${userId}: ${comment.trim()}`;

    this.data.comments = this.data.comments
      ? `${this.data.comments}\n${newComment}`
      : newComment;

    this.data.updatedAt = new Date();
  }

  /**
   * Actualizar criterios de aceptación
   */
  updateAcceptanceCriteria(criteria: string[]): void {
    if (this.data.status === "COMPLETADA" || this.data.status === "CERRADA") {
      throw new Error(
        "No se pueden modificar criterios de aceptación en solicitudes completadas"
      );
    }

    this.data.acceptanceCriteria = criteria
      .filter((c) => c.trim())
      .map((c) => c.trim());
    this.data.updatedAt = new Date();
  }

  /**
   * Actualizar detalles técnicos
   */
  updateTechnicalDetails(technicalDetails: string): void {
    if (this.data.status === "COMPLETADA" || this.data.status === "CERRADA") {
      throw new Error(
        "No se pueden modificar detalles técnicos en solicitudes completadas"
      );
    }

    this.data.technicalDetails = technicalDetails.trim();
    this.data.updatedAt = new Date();
  }

  /**
   * Actualizar integración con GitHub
   */
  updateGitHubIntegration(integration: GitHubIntegration): void {
    this.data.githubIntegration = {
      ...this.data.githubIntegration,
      ...integration,
      lastSyncDate: new Date(),
    };
    this.data.updatedAt = new Date();
  }

  /**
   * Agregar adjunto
   */
  addAttachment(filePath: string): void {
    if (!this.data.attachments) {
      this.data.attachments = [];
    }

    if (!this.data.attachments.includes(filePath)) {
      this.data.attachments.push(filePath);
      this.data.updatedAt = new Date();
    }
  }

  /**
   * Quitar adjunto
   */
  removeAttachment(filePath: string): void {
    if (this.data.attachments) {
      this.data.attachments = this.data.attachments.filter(
        (a) => a !== filePath
      );
      this.data.updatedAt = new Date();
    }
  }

  // ✅ VALIDATION METHODS

  private validateData(): void {
    if (!this.data.title?.trim()) {
      throw new Error("El título es obligatorio");
    }

    if (!this.data.description?.trim()) {
      throw new Error("La descripción es obligatoria");
    }

    if (!this.data.justification?.trim()) {
      throw new Error("La justificación es obligatoria");
    }

    if (!this.data.requesterId?.trim()) {
      throw new Error("El ID del solicitante es obligatorio");
    }

    if (this.data.version <= 0) {
      throw new Error("La versión debe ser mayor a 0");
    }

    if (
      this.data.estimatedHours !== undefined &&
      this.data.estimatedHours < 0
    ) {
      throw new Error("Las horas estimadas no pueden ser negativas");
    }

    if (this.data.actualHours !== undefined && this.data.actualHours < 0) {
      throw new Error("Las horas reales no pueden ser negativas");
    }

    if (this.data.customerSatisfactionScore !== undefined) {
      if (
        this.data.customerSatisfactionScore < 1 ||
        this.data.customerSatisfactionScore > 10
      ) {
        throw new Error(
          "La puntuación de satisfacción debe estar entre 1 y 10"
        );
      }
    }
  }

  private validateRequiredFieldsForSubmission(): void {
    if (!this.data.title?.trim()) {
      throw new Error("El título es requerido para enviar la solicitud");
    }

    if (!this.data.description?.trim()) {
      throw new Error("La descripción es requerida para enviar la solicitud");
    }

    if (!this.data.justification?.trim()) {
      throw new Error("La justificación es requerida para enviar la solicitud");
    }
  }

  // ✅ STATUS METHODS

  isDraft(): boolean {
    return this.data.status === "BORRADOR";
  }

  isSubmitted(): boolean {
    return this.data.status === "PENDIENTE";
  }

  isUnderReview(): boolean {
    return this.data.status === "EN_REVISION";
  }

  isApproved(): boolean {
    return this.data.status === "APROBADA";
  }

  isRejected(): boolean {
    return this.data.status === "RECHAZADA";
  }

  isInDevelopment(): boolean {
    return this.data.status === "EN_DESARROLLO";
  }

  isInTesting(): boolean {
    return this.data.status === "EN_TESTING";
  }

  isImplemented(): boolean {
    return this.data.status === "COMPLETADA";
  }

  isClosed(): boolean {
    return this.data.status === "CERRADA";
  }

  isCancelled(): boolean {
    return this.data.status === "CANCELADA";
  }

  isActive(): boolean {
    return !["CERRADA", "CANCELADA", "RECHAZADA"].includes(this.data.status);
  }

  canBeEdited(): boolean {
    return this.isDraft();
  }

  canBeSubmitted(): boolean {
    return this.isDraft();
  }

  canBeApproved(): boolean {
    return this.isUnderReview();
  }

  canBeRejected(): boolean {
    return this.isUnderReview();
  }

  canStartDevelopment(): boolean {
    return this.isApproved();
  }

  canBeCancelled(): boolean {
    return [
      "BORRADOR",
      "ENVIADA",
      "EN_REVISION",
      "APROBADA",
      "EN_DESARROLLO",
    ].includes(this.data.status);
  }

  // ✅ UTILITY METHODS

  /**
   * Calcular progreso como porcentaje
   */
  getProgressPercentage(): number {
    const statusWeights: Record<ChangeRequestStatus, number> = {
      BORRADOR: 0,
      PENDIENTE: 10,
      EN_REVISION: 20,
      ESPERANDO_INFORMACION: 15,
      APROBADA: 30,
      EN_DESARROLLO: 60,
      EN_TESTING: 80,
      EN_PAUSA: 50,
      COMPLETADA: 90,
      CERRADA: 100,
      CANCELADA: 0,
      RECHAZADA: 0,
    };

    return statusWeights[this.data.status] || 0;
  }

  /**
   * Obtener días transcurridos desde la solicitud
   */
  getDaysFromRequest(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.data.requestDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Verificar si está atrasada
   */
  isOverdue(): boolean {
    if (!this.data.targetDate || this.isClosed() || this.isCancelled()) {
      return false;
    }
    return new Date() > this.data.targetDate;
  }

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
  } {
    return {
      id: this.data.id,
      title: this.data.title,
      type: this.data.changeType,
      status: this.data.status,
      priority: this.data.priority,
      urgency: this.data.urgency,
      requestDate: this.data.requestDate,
      targetDate: this.data.targetDate,
      progress: this.getProgressPercentage(),
      isOverdue: this.isOverdue(),
      assignedTo: this.data.developerName || this.data.reviewerName,
    };
  }

  // ✅ GETTERS
  get id(): string | undefined {
    return this.data.id;
  }

  get title(): string {
    return this.data.title;
  }

  get description(): string {
    return this.data.description;
  }

  get changeType(): ChangeRequestType {
    return this.data.changeType;
  }

  get status(): ChangeRequestStatus {
    return this.data.status;
  }

  get priority(): Priority {
    return this.data.priority;
  }

  get urgency(): Urgency {
    return this.data.urgency;
  }

  get requesterId(): string {
    return this.data.requesterId;
  }

  get developerId(): string | undefined {
    return this.data.developerId;
  }

  get requestDate(): Date {
    return this.data.requestDate;
  }

  get targetDate(): Date | undefined {
    return this.data.targetDate;
  }

  get estimatedHours(): number | undefined {
    return this.data.estimatedHours;
  }

  get actualHours(): number | undefined {
    return this.data.actualHours;
  }

  get githubIntegration(): GitHubIntegration | undefined {
    return this.data.githubIntegration;
  }

  get version(): number {
    return this.data.version;
  }

  get createdAt(): Date {
    return this.data.createdAt;
  }

  get updatedAt(): Date {
    return this.data.updatedAt;
  }

  get reviewerId(): string | undefined {
    return this.data.reviewerId;
  }

  get approverId(): string | undefined {
    return this.data.approverId;
  }

  get completionDate(): Date | undefined {
    return this.data.completionDate;
  }

  get closedDate(): Date | undefined {
    return this.data.closedDate;
  }

  // ✅ SERIALIZATION
  toPlainObject(): ChangeRequestData {
    return { ...this.data };
  }

  toJSON(): ChangeRequestData {
    return this.toPlainObject();
  }
}
