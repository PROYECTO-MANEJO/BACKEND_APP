"use strict";
/**
 * ChangeRequest Entity - Domain Layer
 *
 * Entidad de dominio que representa una solicitud de cambio en el sistema.
 * Maneja el flujo completo desde creación hasta implementación y cierre.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeRequest = void 0;
class ChangeRequest {
    constructor(data) {
        this.data = data;
        this.validateData();
    }
    // ✅ FACTORY METHODS
    static create(title, description, justification, changeType, requesterId, requesterName, priority = "MEDIA", urgency = "NORMAL") {
        const changeRequestData = {
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
    static fromData(data) {
        return new ChangeRequest(data);
    }
    // ✅ BUSINESS LOGIC METHODS - FLUJO DE ESTADOS
    /**
     * Enviar solicitud para revisión
     */
    submit() {
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
    startReview(reviewerId, reviewerName) {
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
    approve(approverId, approverName, estimatedHours, targetDate, reviewNotes) {
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
    reject(rejectionReason) {
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
    startDevelopment(developerId, developerName, technicalDetails) {
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
    moveToTesting(implementationNotes) {
        if (this.data.status !== "EN_DESARROLLO") {
            throw new Error("Solo se pueden enviar a pruebas solicitudes en desarrollo");
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
    markAsImplemented(actualHours) {
        if (this.data.status !== "EN_TESTING") {
            throw new Error("Solo se pueden implementar solicitudes que han pasado pruebas");
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
    close(customerSatisfactionScore) {
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
    cancel(reason) {
        const cancellableStatuses = [
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
            this.data.comments = `${this.data.comments || ""}\nCANCELADO: ${reason}`.trim();
        }
        this.data.updatedAt = new Date();
    }
    // ✅ MODIFICATION METHODS
    /**
     * Actualizar información básica (solo si está en BORRADOR)
     */
    updateBasicInfo(updates) {
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
    addComment(comment, userId) {
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
    updateAcceptanceCriteria(criteria) {
        if (this.data.status === "COMPLETADA" || this.data.status === "CERRADA") {
            throw new Error("No se pueden modificar criterios de aceptación en solicitudes completadas");
        }
        this.data.acceptanceCriteria = criteria
            .filter((c) => c.trim())
            .map((c) => c.trim());
        this.data.updatedAt = new Date();
    }
    /**
     * Actualizar detalles técnicos
     */
    updateTechnicalDetails(technicalDetails) {
        if (this.data.status === "COMPLETADA" || this.data.status === "CERRADA") {
            throw new Error("No se pueden modificar detalles técnicos en solicitudes completadas");
        }
        this.data.technicalDetails = technicalDetails.trim();
        this.data.updatedAt = new Date();
    }
    /**
     * Actualizar integración con GitHub
     */
    updateGitHubIntegration(integration) {
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
    addAttachment(filePath) {
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
    removeAttachment(filePath) {
        if (this.data.attachments) {
            this.data.attachments = this.data.attachments.filter((a) => a !== filePath);
            this.data.updatedAt = new Date();
        }
    }
    // ✅ VALIDATION METHODS
    validateData() {
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
        if (this.data.estimatedHours !== undefined &&
            this.data.estimatedHours < 0) {
            throw new Error("Las horas estimadas no pueden ser negativas");
        }
        if (this.data.actualHours !== undefined && this.data.actualHours < 0) {
            throw new Error("Las horas reales no pueden ser negativas");
        }
        if (this.data.customerSatisfactionScore !== undefined) {
            if (this.data.customerSatisfactionScore < 1 ||
                this.data.customerSatisfactionScore > 10) {
                throw new Error("La puntuación de satisfacción debe estar entre 1 y 10");
            }
        }
    }
    validateRequiredFieldsForSubmission() {
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
    isDraft() {
        return this.data.status === "BORRADOR";
    }
    isSubmitted() {
        return this.data.status === "PENDIENTE";
    }
    isUnderReview() {
        return this.data.status === "EN_REVISION";
    }
    isApproved() {
        return this.data.status === "APROBADA";
    }
    isRejected() {
        return this.data.status === "RECHAZADA";
    }
    isInDevelopment() {
        return this.data.status === "EN_DESARROLLO";
    }
    isInTesting() {
        return this.data.status === "EN_TESTING";
    }
    isImplemented() {
        return this.data.status === "COMPLETADA";
    }
    isClosed() {
        return this.data.status === "CERRADA";
    }
    isCancelled() {
        return this.data.status === "CANCELADA";
    }
    isActive() {
        return !["CERRADA", "CANCELADA", "RECHAZADA"].includes(this.data.status);
    }
    canBeEdited() {
        return this.isDraft();
    }
    canBeSubmitted() {
        return this.isDraft();
    }
    canBeApproved() {
        return this.isUnderReview();
    }
    canBeRejected() {
        return this.isUnderReview();
    }
    canStartDevelopment() {
        return this.isApproved();
    }
    canBeCancelled() {
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
    getProgressPercentage() {
        const statusWeights = {
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
    getDaysFromRequest() {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - this.data.requestDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    /**
     * Verificar si está atrasada
     */
    isOverdue() {
        if (!this.data.targetDate || this.isClosed() || this.isCancelled()) {
            return false;
        }
        return new Date() > this.data.targetDate;
    }
    /**
     * Obtener resumen para dashboard
     */
    getSummary() {
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
    get id() {
        return this.data.id;
    }
    get title() {
        return this.data.title;
    }
    get description() {
        return this.data.description;
    }
    get changeType() {
        return this.data.changeType;
    }
    get status() {
        return this.data.status;
    }
    get priority() {
        return this.data.priority;
    }
    get urgency() {
        return this.data.urgency;
    }
    get requesterId() {
        return this.data.requesterId;
    }
    get developerId() {
        return this.data.developerId;
    }
    get requestDate() {
        return this.data.requestDate;
    }
    get targetDate() {
        return this.data.targetDate;
    }
    get estimatedHours() {
        return this.data.estimatedHours;
    }
    get actualHours() {
        return this.data.actualHours;
    }
    get githubIntegration() {
        return this.data.githubIntegration;
    }
    get version() {
        return this.data.version;
    }
    get createdAt() {
        return this.data.createdAt;
    }
    get updatedAt() {
        return this.data.updatedAt;
    }
    get reviewerId() {
        return this.data.reviewerId;
    }
    get approverId() {
        return this.data.approverId;
    }
    get completionDate() {
        return this.data.completionDate;
    }
    get closedDate() {
        return this.data.closedDate;
    }
    // ✅ SERIALIZATION
    toPlainObject() {
        return { ...this.data };
    }
    toJSON() {
        return this.toPlainObject();
    }
}
exports.ChangeRequest = ChangeRequest;
//# sourceMappingURL=ChangeRequest.js.map