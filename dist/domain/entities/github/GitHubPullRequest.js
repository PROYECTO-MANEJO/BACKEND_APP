"use strict";
/**
 * GitHub Pull Request Entity - Domain Layer
 *
 * Representa un Pull Request en GitHub asociado a una solicitud de cambio
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubPullRequest = void 0;
class GitHubPullRequest {
    constructor(data) {
        this.data = data;
        this.validateData();
    }
    static create(number, title, repositoryId, repositoryFullName, sourceBranch, targetBranch, authorId, authorLogin, changeRequestId, description, isDraft = false) {
        const pullRequestData = {
            id: `${repositoryId}/pr/${number}`,
            number,
            title: title.trim(),
            description: description?.trim(),
            repositoryId,
            repositoryFullName,
            sourceBranch,
            targetBranch,
            state: "OPEN",
            status: isDraft ? "PENDING_REVIEW" : "PENDING_REVIEW",
            isDraft,
            mergeable: true,
            changeRequestId,
            authorId,
            authorLogin,
            reviewers: [],
            requiredReviewers: 1, // Por defecto requiere al menos 1 revisor
            approvalCount: 0,
            htmlUrl: `https://github.com/${repositoryFullName}/pull/${number}`,
            diffUrl: `https://github.com/${repositoryFullName}/pull/${number}.diff`,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return new GitHubPullRequest(pullRequestData);
    }
    static fromGitHubAPI(apiData, repositoryId, changeRequestId) {
        const reviewers = [];
        // Procesar revisores de la API
        if (apiData.requested_reviewers) {
            reviewers.push(...apiData.requested_reviewers.map((reviewer) => ({
                id: reviewer.id.toString(),
                login: reviewer.login,
                status: "PENDING"
            })));
        }
        const pullRequestData = {
            id: `${repositoryId}/pr/${apiData.number}`,
            number: apiData.number,
            title: apiData.title,
            description: apiData.body,
            repositoryId,
            repositoryFullName: apiData.base.repo.full_name,
            sourceBranch: apiData.head.ref,
            targetBranch: apiData.base.ref,
            state: apiData.state.toUpperCase(),
            status: GitHubPullRequest.determineStatus(apiData),
            isDraft: apiData.draft || false,
            mergeable: apiData.mergeable !== false,
            changeRequestId,
            authorId: apiData.user.id.toString(),
            authorLogin: apiData.user.login,
            reviewers,
            requiredReviewers: 1,
            approvalCount: 0,
            htmlUrl: apiData.html_url,
            diffUrl: apiData.diff_url,
            createdAt: new Date(apiData.created_at),
            updatedAt: new Date(apiData.updated_at),
            closedAt: apiData.closed_at ? new Date(apiData.closed_at) : undefined,
            mergedAt: apiData.merged_at ? new Date(apiData.merged_at) : undefined,
            additionsCount: apiData.additions,
            deletionsCount: apiData.deletions,
            changedFilesCount: apiData.changed_files,
            commitCount: apiData.commits
        };
        return new GitHubPullRequest(pullRequestData);
    }
    static determineStatus(apiData) {
        if (apiData.draft)
            return "PENDING_REVIEW";
        if (apiData.state === "closed")
            return apiData.merged ? "READY_TO_MERGE" : "REJECTED";
        if (apiData.mergeable === false)
            return "CHANGES_REQUESTED";
        // Aquí se podría implementar lógica más compleja basada en reviews
        return "PENDING_REVIEW";
    }
    validateData() {
        if (!this.data.title || this.data.title.trim().length === 0) {
            throw new Error("El título del Pull Request es requerido");
        }
        if (!this.data.sourceBranch || this.data.sourceBranch.trim().length === 0) {
            throw new Error("La rama de origen es requerida");
        }
        if (!this.data.targetBranch || this.data.targetBranch.trim().length === 0) {
            throw new Error("La rama de destino es requerida");
        }
        if (this.data.sourceBranch === this.data.targetBranch) {
            throw new Error("La rama de origen no puede ser igual a la rama de destino");
        }
        if (!this.data.authorId || this.data.authorId.trim().length === 0) {
            throw new Error("El autor del Pull Request es requerido");
        }
        if (this.data.number <= 0) {
            throw new Error("El número del Pull Request debe ser positivo");
        }
    }
    // Getters
    getId() {
        return this.data.id;
    }
    getNumber() {
        return this.data.number;
    }
    getTitle() {
        return this.data.title;
    }
    getDescription() {
        return this.data.description;
    }
    getRepositoryId() {
        return this.data.repositoryId;
    }
    getRepositoryFullName() {
        return this.data.repositoryFullName;
    }
    getSourceBranch() {
        return this.data.sourceBranch;
    }
    getTargetBranch() {
        return this.data.targetBranch;
    }
    getState() {
        return this.data.state;
    }
    getStatus() {
        return this.data.status;
    }
    isDraft() {
        return this.data.isDraft;
    }
    isMergeable() {
        return this.data.mergeable;
    }
    getChangeRequestId() {
        return this.data.changeRequestId;
    }
    getAuthorId() {
        return this.data.authorId;
    }
    getAuthorLogin() {
        return this.data.authorLogin;
    }
    getReviewers() {
        return [...this.data.reviewers];
    }
    getApprovalCount() {
        return this.data.approvalCount;
    }
    getRequiredReviewers() {
        return this.data.requiredReviewers;
    }
    getHtmlUrl() {
        return this.data.htmlUrl;
    }
    getDiffUrl() {
        return this.data.diffUrl;
    }
    getCreatedAt() {
        return this.data.createdAt;
    }
    getUpdatedAt() {
        return this.data.updatedAt;
    }
    getClosedAt() {
        return this.data.closedAt;
    }
    getMergedAt() {
        return this.data.mergedAt;
    }
    // Business Methods
    isOpen() {
        return this.data.state === "OPEN";
    }
    isClosed() {
        return this.data.state === "CLOSED";
    }
    isMerged() {
        return this.data.state === "MERGED";
    }
    hasRequiredApprovals() {
        return this.data.approvalCount >= this.data.requiredReviewers;
    }
    needsReview() {
        return this.data.status === "PENDING_REVIEW" && !this.data.isDraft;
    }
    hasChangesRequested() {
        return this.data.status === "CHANGES_REQUESTED";
    }
    isReadyToMerge() {
        return this.data.state === "OPEN" &&
            this.data.status === "APPROVED" &&
            this.data.mergeable &&
            this.hasRequiredApprovals() &&
            !this.data.isDraft;
    }
    canBeReviewed() {
        return this.data.state === "OPEN" && !this.data.isDraft;
    }
    isAuthor(userId) {
        return this.data.authorId === userId;
    }
    hasReviewer(reviewerId) {
        return this.data.reviewers.some(reviewer => reviewer.id === reviewerId);
    }
    // Actions
    addReviewer(reviewerId, reviewerLogin) {
        if (this.hasReviewer(reviewerId)) {
            throw new Error("El revisor ya está asignado a este Pull Request");
        }
        const newReviewer = {
            id: reviewerId,
            login: reviewerLogin,
            status: "PENDING"
        };
        const updatedData = {
            ...this.data,
            reviewers: [...this.data.reviewers, newReviewer],
            updatedAt: new Date()
        };
        return new GitHubPullRequest(updatedData);
    }
    removeReviewer(reviewerId) {
        const updatedReviewers = this.data.reviewers.filter(r => r.id !== reviewerId);
        const updatedData = {
            ...this.data,
            reviewers: updatedReviewers,
            updatedAt: new Date()
        };
        return new GitHubPullRequest(updatedData);
    }
    updateReview(reviewerId, status, comments) {
        const updatedReviewers = this.data.reviewers.map(reviewer => reviewer.id === reviewerId
            ? { ...reviewer, status, comments, reviewedAt: new Date() }
            : reviewer);
        // Recalcular aprobaciones
        const approvalCount = updatedReviewers.filter(r => r.status === "APPROVED").length;
        const hasChangesRequested = updatedReviewers.some(r => r.status === "CHANGES_REQUESTED");
        let newStatus = this.data.status;
        if (hasChangesRequested) {
            newStatus = "CHANGES_REQUESTED";
        }
        else if (approvalCount >= this.data.requiredReviewers) {
            newStatus = "APPROVED";
        }
        else {
            newStatus = "PENDING_REVIEW";
        }
        const updatedData = {
            ...this.data,
            reviewers: updatedReviewers,
            approvalCount,
            status: newStatus,
            updatedAt: new Date()
        };
        return new GitHubPullRequest(updatedData);
    }
    markAsReadyForReview() {
        const updatedData = {
            ...this.data,
            isDraft: false,
            status: "PENDING_REVIEW",
            updatedAt: new Date()
        };
        return new GitHubPullRequest(updatedData);
    }
    close() {
        const updatedData = {
            ...this.data,
            state: "CLOSED",
            status: "REJECTED",
            closedAt: new Date(),
            updatedAt: new Date()
        };
        return new GitHubPullRequest(updatedData);
    }
    merge() {
        if (!this.isReadyToMerge()) {
            throw new Error("El Pull Request no está listo para hacer merge");
        }
        const updatedData = {
            ...this.data,
            state: "MERGED",
            status: "READY_TO_MERGE",
            mergedAt: new Date(),
            updatedAt: new Date()
        };
        return new GitHubPullRequest(updatedData);
    }
    updateMetrics(additionsCount, deletionsCount, changedFilesCount, commitCount) {
        const updatedData = {
            ...this.data,
            additionsCount,
            deletionsCount,
            changedFilesCount,
            commitCount,
            updatedAt: new Date()
        };
        return new GitHubPullRequest(updatedData);
    }
    updateChecksStatus(checksStatus, ciStatus) {
        const updatedData = {
            ...this.data,
            checksStatus,
            ciStatus: ciStatus || this.data.ciStatus,
            updatedAt: new Date()
        };
        return new GitHubPullRequest(updatedData);
    }
    // Serialization
    toPlainObject() {
        return { ...this.data };
    }
    toJSON() {
        return this.toPlainObject();
    }
}
exports.GitHubPullRequest = GitHubPullRequest;
//# sourceMappingURL=GitHubPullRequest.js.map