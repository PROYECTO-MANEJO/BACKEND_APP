"use strict";
/**
 * ChangeRequestManagementService - Domain Layer
 *
 * Servicio de dominio que maneja la lógica de negocio compleja
 * para la gestión de solicitudes de cambio y su integración con GitHub.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeRequestManagementService = void 0;
const ChangeRequest_1 = require("../entities/ChangeRequest");
class ChangeRequestManagementService {
    constructor(changeRequestRepository, gitHubService, userRepository, notificationService) {
        this.changeRequestRepository = changeRequestRepository;
        this.gitHubService = gitHubService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }
    // ✅ CREACIÓN Y GESTIÓN BÁSICA
    /**
     * Crear nueva solicitud de cambio
     */
    async createChangeRequest(title, description, justification, changeType, requesterId, priority = "MEDIA", urgency = "NORMAL") {
        // Validar que el usuario existe
        const requester = await this.userRepository.findById(requesterId);
        if (!requester) {
            throw new Error("Usuario solicitante no encontrado");
        }
        // Crear la solicitud
        const changeRequest = ChangeRequest_1.ChangeRequest.create(title, description, justification, changeType, requesterId, this.formatUserName(requester), priority, urgency);
        return await this.changeRequestRepository.create(changeRequest);
    }
    /**
     * Enviar solicitud para revisión
     */
    async submitChangeRequest(changeRequestId) {
        const changeRequest = await this.getChangeRequestById(changeRequestId);
        if (!changeRequest.canBeSubmitted()) {
            throw new Error("La solicitud no puede ser enviada en su estado actual");
        }
        changeRequest.submit();
        // Notificar a revisores disponibles
        await this.notifyAvailableReviewers(changeRequest);
        return await this.changeRequestRepository.update(changeRequestId, changeRequest);
    }
    /**
     * Actualizar información básica (solo en borrador)
     */
    async updateChangeRequest(changeRequestId, updates, userId) {
        const changeRequest = await this.getChangeRequestById(changeRequestId);
        // Validar permisos
        if (changeRequest.requesterId !== userId) {
            throw new Error("Solo el creador puede modificar la solicitud");
        }
        changeRequest.updateBasicInfo(updates);
        return await this.changeRequestRepository.update(changeRequestId, changeRequest);
    }
    // ✅ FLUJO DE REVISIÓN
    /**
     * Asignar revisor y comenzar revisión
     */
    async assignReviewer(changeRequestId, reviewerId, assignedBy) {
        const changeRequest = await this.getChangeRequestById(changeRequestId);
        // Validar que el revisor existe
        const reviewer = await this.userRepository.findById(reviewerId);
        if (!reviewer) {
            throw new Error("Revisor no encontrado");
        }
        if (!changeRequest.isSubmitted()) {
            throw new Error("Solo se pueden asignar revisores a solicitudes enviadas");
        }
        changeRequest.startReview(reviewerId, this.formatUserName(reviewer));
        // Notificar al revisor
        await this.notificationService.notifyReviewerAssigned(changeRequestId, reviewerId);
        return await this.changeRequestRepository.update(changeRequestId, changeRequest);
    }
    /**
     * Aprobar solicitud
     */
    async approveChangeRequest(changeRequestId, approverId, estimatedHours, targetDate, reviewNotes, createGitHubIssue = true) {
        const changeRequest = await this.getChangeRequestById(changeRequestId);
        if (!changeRequest.canBeApproved()) {
            throw new Error("La solicitud no puede ser aprobada en su estado actual");
        }
        // Validar que el aprobador existe
        const approver = await this.userRepository.findById(approverId);
        if (!approver) {
            throw new Error("Aprobador no encontrado");
        }
        changeRequest.approve(approverId, this.formatUserName(approver), estimatedHours, targetDate, reviewNotes);
        // Crear issue en GitHub si está habilitado
        if (createGitHubIssue) {
            try {
                const githubResult = await this.gitHubService.createIssue(changeRequest);
                changeRequest.updateGitHubIntegration({
                    issueNumber: githubResult.issueNumber,
                    issueUrl: githubResult.issueUrl,
                    repositoryName: "main-repository", // Configurar según necesidades
                });
            }
            catch (error) {
                console.error("Error creando issue en GitHub:", error);
                // No fallar la aprobación por error de GitHub
            }
        }
        // Notificar al solicitante
        await this.notificationService.notifyStatusChange(changeRequestId, "APROBADA", changeRequest.requesterId);
        return await this.changeRequestRepository.update(changeRequestId, changeRequest);
    }
    /**
     * Rechazar solicitud
     */
    async rejectChangeRequest(changeRequestId, rejectionReason, rejectedBy) {
        const changeRequest = await this.getChangeRequestById(changeRequestId);
        if (!changeRequest.canBeRejected()) {
            throw new Error("La solicitud no puede ser rechazada en su estado actual");
        }
        changeRequest.reject(rejectionReason);
        // Notificar al solicitante
        await this.notificationService.notifyStatusChange(changeRequestId, "RECHAZADA", changeRequest.requesterId);
        return await this.changeRequestRepository.update(changeRequestId, changeRequest);
    }
    // ✅ FLUJO DE DESARROLLO
    /**
     * Asignar desarrollador y comenzar desarrollo
     */
    async assignDeveloper(changeRequestId, developerId, assignedBy, technicalDetails, createBranch = true) {
        const changeRequest = await this.getChangeRequestById(changeRequestId);
        // Validar que el desarrollador existe
        const developer = await this.userRepository.findById(developerId);
        if (!developer) {
            throw new Error("Desarrollador no encontrado");
        }
        if (!changeRequest.canStartDevelopment()) {
            throw new Error("La solicitud no puede iniciar desarrollo en su estado actual");
        }
        changeRequest.startDevelopment(developerId, this.formatUserName(developer), technicalDetails);
        // Crear branch en GitHub si está habilitado
        if (createBranch && changeRequest.githubIntegration?.issueNumber) {
            try {
                const branchResult = await this.gitHubService.createBranch(changeRequestId);
                changeRequest.updateGitHubIntegration({
                    ...changeRequest.githubIntegration,
                    branchName: branchResult.branchName,
                });
            }
            catch (error) {
                console.error("Error creando branch en GitHub:", error);
            }
        }
        // Notificar al desarrollador
        await this.notificationService.notifyDeveloperAssigned(changeRequestId, developerId);
        return await this.changeRequestRepository.update(changeRequestId, changeRequest);
    }
    /**
     * Mover a pruebas
     */
    async moveToTesting(changeRequestId, developerId, implementationNotes, createPullRequest = true) {
        const changeRequest = await this.getChangeRequestById(changeRequestId);
        // Validar permisos
        if (changeRequest.developerId !== developerId) {
            throw new Error("Solo el desarrollador asignado puede mover a pruebas");
        }
        if (changeRequest.status !== "EN_DESARROLLO") {
            throw new Error("Solo se pueden mover a pruebas solicitudes en desarrollo");
        }
        changeRequest.moveToTesting(implementationNotes);
        // Crear pull request en GitHub si está habilitado
        if (createPullRequest && changeRequest.githubIntegration?.branchName) {
            try {
                const prResult = await this.gitHubService.createPullRequest(changeRequest, changeRequest.githubIntegration.branchName);
                changeRequest.updateGitHubIntegration({
                    ...changeRequest.githubIntegration,
                    pullRequestNumber: prResult.pullRequestNumber,
                    pullRequestUrl: prResult.pullRequestUrl,
                });
            }
            catch (error) {
                console.error("Error creando pull request en GitHub:", error);
            }
        }
        // Notificar cambio de estado
        await this.notificationService.notifyStatusChange(changeRequestId, "EN_PRUEBAS");
        return await this.changeRequestRepository.update(changeRequestId, changeRequest);
    }
    /**
     * Marcar como implementada
     */
    async markAsImplemented(changeRequestId, implementedBy, actualHours, mergePullRequest = true) {
        const changeRequest = await this.getChangeRequestById(changeRequestId);
        if (changeRequest.status !== "EN_TESTING") {
            throw new Error("Solo se pueden implementar solicitudes que han pasado pruebas");
        }
        changeRequest.markAsImplemented(actualHours);
        // Mergear pull request en GitHub si está habilitado
        if (mergePullRequest &&
            changeRequest.githubIntegration?.pullRequestNumber) {
            try {
                await this.gitHubService.mergePullRequest(changeRequest.githubIntegration.pullRequestNumber);
            }
            catch (error) {
                console.error("Error mergeando pull request en GitHub:", error);
            }
        }
        // Notificar al solicitante
        await this.notificationService.notifyStatusChange(changeRequestId, "IMPLEMENTADA", changeRequest.requesterId);
        return await this.changeRequestRepository.update(changeRequestId, changeRequest);
    }
    /**
     * Cerrar solicitud
     */
    async closeChangeRequest(changeRequestId, closedBy, customerSatisfactionScore) {
        const changeRequest = await this.getChangeRequestById(changeRequestId);
        if (!changeRequest.isImplemented()) {
            throw new Error("Solo se pueden cerrar solicitudes implementadas");
        }
        changeRequest.close(customerSatisfactionScore);
        // Cerrar issue en GitHub si existe
        if (changeRequest.githubIntegration?.issueNumber) {
            try {
                await this.gitHubService.closeIssue(changeRequest.githubIntegration.issueNumber, "Completed");
            }
            catch (error) {
                console.error("Error cerrando issue en GitHub:", error);
            }
        }
        // Notificar cierre
        await this.notificationService.notifyStatusChange(changeRequestId, "CERRADA");
        return await this.changeRequestRepository.update(changeRequestId, changeRequest);
    }
    // ✅ GESTIÓN DE COMENTARIOS Y COMUNICACIÓN
    /**
     * Agregar comentario a la solicitud
     */
    async addComment(changeRequestId, comment, userId) {
        const changeRequest = await this.getChangeRequestById(changeRequestId);
        // Validar que el usuario existe
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("Usuario no encontrado");
        }
        changeRequest.addComment(comment, this.formatUserName(user));
        // Notificar a los involucrados
        const targetUsers = [
            changeRequest.requesterId,
            changeRequest.developerId,
            changeRequest.reviewerId,
        ].filter((id) => id && id !== userId);
        for (const targetUserId of targetUsers) {
            if (targetUserId) {
                await this.notificationService.notifyCommentAdded(changeRequestId, userId, targetUserId);
            }
        }
        return await this.changeRequestRepository.update(changeRequestId, changeRequest);
    }
    /**
     * Actualizar criterios de aceptación
     */
    async updateAcceptanceCriteria(changeRequestId, criteria, userId) {
        const changeRequest = await this.getChangeRequestById(changeRequestId);
        // Validar permisos (creador, revisor o desarrollador)
        const hasPermission = changeRequest.requesterId === userId ||
            changeRequest.reviewerId === userId ||
            changeRequest.developerId === userId;
        if (!hasPermission) {
            throw new Error("No tienes permisos para modificar los criterios de aceptación");
        }
        changeRequest.updateAcceptanceCriteria(criteria);
        return await this.changeRequestRepository.update(changeRequestId, changeRequest);
    }
    // ✅ INTEGRACIÓN CON GITHUB
    /**
     * Sincronizar solicitud con GitHub
     */
    async syncWithGitHub(changeRequestId) {
        const changeRequest = await this.getChangeRequestById(changeRequestId);
        try {
            const integration = await this.gitHubService.syncChangeRequestWithGitHub(changeRequestId);
            changeRequest.updateGitHubIntegration(integration);
            return await this.changeRequestRepository.update(changeRequestId, changeRequest);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            throw new Error(`Error sincronizando con GitHub: ${errorMessage}`);
        }
    }
    // ✅ CONSULTAS Y REPORTES
    /**
     * Obtener solicitudes por desarrollador
     */
    async getDeveloperAssignments(developerId, includeCompleted = false) {
        const assignments = await this.changeRequestRepository.findByDeveloper(developerId);
        if (!includeCompleted) {
            return assignments.filter((cr) => cr.isActive());
        }
        return assignments;
    }
    /**
     * Obtener solicitudes pendientes de revisión
     */
    async getPendingReviews() {
        return await this.changeRequestRepository.findPendingReview();
    }
    /**
     * Obtener solicitudes atrasadas
     */
    async getOverdueRequests() {
        return await this.changeRequestRepository.findOverdue();
    }
    /**
     * Obtener estadísticas de solicitudes
     */
    async getChangeRequestStatistics(filters) {
        const requests = await this.changeRequestRepository.findWithFilters(filters || {});
        const stats = {
            totalRequests: requests.length,
            byStatus: {},
            byType: {},
            byPriority: {},
            averageCompletionTime: 0,
            overdueCount: 0,
        };
        // Agrupar estadísticas
        requests.forEach((request) => {
            // Por estado
            stats.byStatus[request.status] =
                (stats.byStatus[request.status] || 0) + 1;
            // Por tipo
            stats.byType[request.changeType] =
                (stats.byType[request.changeType] || 0) + 1;
            // Por prioridad
            stats.byPriority[request.priority] =
                (stats.byPriority[request.priority] || 0) + 1;
            // Contar atrasadas
            if (request.isOverdue()) {
                stats.overdueCount++;
            }
        });
        // Calcular tiempo promedio de completado
        const completedRequests = requests.filter((r) => r.isClosed() && r.completionDate);
        if (completedRequests.length > 0) {
            const totalDays = completedRequests.reduce((sum, request) => {
                return sum + request.getDaysFromRequest();
            }, 0);
            stats.averageCompletionTime = Math.round(totalDays / completedRequests.length);
        }
        return stats;
    }
    // ✅ MÉTODOS AUXILIARES
    /**
     * Obtener solicitud por ID con validación
     */
    async getChangeRequestById(id) {
        const changeRequest = await this.changeRequestRepository.findById(id);
        if (!changeRequest) {
            throw new Error("Solicitud de cambio no encontrada");
        }
        return changeRequest;
    }
    /**
     * Formatear nombre de usuario
     */
    formatUserName(user) {
        if (user.nom_usu1 && user.ape_usu1) {
            const nombres = [user.nom_usu1, user.nom_usu2].filter(Boolean).join(" ");
            const apellidos = [user.ape_usu1, user.ape_usu2]
                .filter(Boolean)
                .join(" ");
            return `${nombres} ${apellidos}`.trim();
        }
        return user.username || user.email || "Usuario";
    }
    /**
     * Notificar a revisores disponibles
     */
    async notifyAvailableReviewers(changeRequest) {
        try {
            // Obtener revisores disponibles (por rol)
            const reviewers = await this.userRepository.findByRole("REVIEWER");
            for (const reviewer of reviewers) {
                await this.notificationService.notifyStatusChange(changeRequest.id, "ENVIADA", reviewer.id_usu);
            }
        }
        catch (error) {
            console.error("Error notificando a revisores:", error);
        }
    }
}
exports.ChangeRequestManagementService = ChangeRequestManagementService;
//# sourceMappingURL=ChangeRequestManagementService.js.map