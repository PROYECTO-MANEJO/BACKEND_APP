"use strict";
/**
 * GitHub Issue Entity - Domain Layer
 *
 * Representa un Issue de GitHub asociado a una solicitud de cambio
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubIssue = void 0;
class GitHubIssue {
    constructor(data) {
        this.data = data;
        this.validateData();
    }
    static create(number, title, repositoryId, repositoryFullName, authorId, authorLogin, issueType = "OTHER", changeRequestId, body) {
        const issueData = {
            id: `${repositoryId}/issue/${number}`,
            number,
            title: title.trim(),
            body: body?.trim(),
            repositoryId,
            repositoryFullName,
            issueType,
            labels: [],
            state: "OPEN",
            locked: false,
            changeRequestId,
            authorId,
            authorLogin,
            assignees: [],
            htmlUrl: `https://github.com/${repositoryFullName}/issues/${number}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            commentsCount: 0
        };
        return new GitHubIssue(issueData);
    }
    static createFromChangeRequest(number, changeRequestId, changeRequestTitle, changeRequestDescription, repositoryId, repositoryFullName, authorId, authorLogin, issueType = "FEATURE") {
        const title = `[CR-${changeRequestId}] ${changeRequestTitle}`;
        const body = `**Solicitud de Cambio:** ${changeRequestId}\n\n${changeRequestDescription}\n\n---\n*Este issue fue creado automáticamente desde una solicitud de cambio.*`;
        return GitHubIssue.create(number, title, repositoryId, repositoryFullName, authorId, authorLogin, issueType, changeRequestId, body);
    }
    static fromGitHubAPI(apiData, repositoryId, changeRequestId) {
        const labels = apiData.labels?.map((label) => ({
            id: label.id.toString(),
            name: label.name,
            color: label.color,
            description: label.description
        })) || [];
        const assignees = apiData.assignees?.map((assignee) => ({
            id: assignee.id.toString(),
            login: assignee.login,
            assignedAt: new Date() // GitHub API no proporciona esta fecha
        })) || [];
        const issueType = GitHubIssue.determineIssueType(labels);
        const issueData = {
            id: `${repositoryId}/issue/${apiData.number}`,
            number: apiData.number,
            title: apiData.title,
            body: apiData.body,
            repositoryId,
            repositoryFullName: apiData.repository?.full_name || "unknown/unknown",
            issueType,
            labels,
            state: apiData.state.toUpperCase(),
            locked: apiData.locked || false,
            changeRequestId,
            authorId: apiData.user.id.toString(),
            authorLogin: apiData.user.login,
            assignees,
            htmlUrl: apiData.html_url,
            createdAt: new Date(apiData.created_at),
            updatedAt: new Date(apiData.updated_at),
            closedAt: apiData.closed_at ? new Date(apiData.closed_at) : undefined,
            commentsCount: apiData.comments || 0,
            reactionsCount: apiData.reactions?.total_count,
            milestoneTitle: apiData.milestone?.title,
            milestoneNumber: apiData.milestone?.number
        };
        return new GitHubIssue(issueData);
    }
    static determineIssueType(labels) {
        const labelNames = labels.map(l => l.name.toLowerCase());
        if (labelNames.includes("bug") || labelNames.includes("error"))
            return "BUG";
        if (labelNames.includes("feature") || labelNames.includes("enhancement"))
            return "FEATURE";
        if (labelNames.includes("documentation") || labelNames.includes("docs"))
            return "DOCUMENTATION";
        if (labelNames.includes("question") || labelNames.includes("help"))
            return "QUESTION";
        return "OTHER";
    }
    validateData() {
        if (!this.data.title || this.data.title.trim().length === 0) {
            throw new Error("El título del Issue es requerido");
        }
        if (!this.data.authorId || this.data.authorId.trim().length === 0) {
            throw new Error("El autor del Issue es requerido");
        }
        if (!this.data.repositoryId || this.data.repositoryId.trim().length === 0) {
            throw new Error("El ID del repositorio es requerido");
        }
        if (this.data.number <= 0) {
            throw new Error("El número del Issue debe ser positivo");
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
    getBody() {
        return this.data.body;
    }
    getRepositoryId() {
        return this.data.repositoryId;
    }
    getRepositoryFullName() {
        return this.data.repositoryFullName;
    }
    getIssueType() {
        return this.data.issueType;
    }
    getLabels() {
        return [...this.data.labels];
    }
    getState() {
        return this.data.state;
    }
    isLocked() {
        return this.data.locked;
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
    getAssignees() {
        return [...this.data.assignees];
    }
    getHtmlUrl() {
        return this.data.htmlUrl;
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
    getCommentsCount() {
        return this.data.commentsCount;
    }
    getReactionsCount() {
        return this.data.reactionsCount;
    }
    // Business Methods
    isOpen() {
        return this.data.state === "OPEN";
    }
    isClosed() {
        return this.data.state === "CLOSED";
    }
    isBug() {
        return this.data.issueType === "BUG";
    }
    isFeature() {
        return this.data.issueType === "FEATURE";
    }
    isDocumentation() {
        return this.data.issueType === "DOCUMENTATION";
    }
    hasAssignees() {
        return this.data.assignees.length > 0;
    }
    isAssignedTo(userId) {
        return this.data.assignees.some(assignee => assignee.id === userId);
    }
    isAuthor(userId) {
        return this.data.authorId === userId;
    }
    hasLabel(labelName) {
        return this.data.labels.some(label => label.name.toLowerCase() === labelName.toLowerCase());
    }
    isAssociatedWithChangeRequest() {
        return this.data.changeRequestId !== undefined;
    }
    canBeClosed() {
        return this.data.state === "OPEN" && !this.data.locked;
    }
    canBeReopened() {
        return this.data.state === "CLOSED" && !this.data.locked;
    }
    // Actions
    addLabel(label) {
        if (this.hasLabel(label.name)) {
            throw new Error(`El label '${label.name}' ya existe en este Issue`);
        }
        const updatedData = {
            ...this.data,
            labels: [...this.data.labels, label],
            updatedAt: new Date()
        };
        return new GitHubIssue(updatedData);
    }
    removeLabel(labelName) {
        const updatedLabels = this.data.labels.filter(label => label.name.toLowerCase() !== labelName.toLowerCase());
        const updatedData = {
            ...this.data,
            labels: updatedLabels,
            updatedAt: new Date()
        };
        return new GitHubIssue(updatedData);
    }
    assignTo(userId, userLogin) {
        if (this.isAssignedTo(userId)) {
            throw new Error("El usuario ya está asignado a este Issue");
        }
        const newAssignee = {
            id: userId,
            login: userLogin,
            assignedAt: new Date()
        };
        const updatedData = {
            ...this.data,
            assignees: [...this.data.assignees, newAssignee],
            updatedAt: new Date()
        };
        return new GitHubIssue(updatedData);
    }
    unassignFrom(userId) {
        const updatedAssignees = this.data.assignees.filter(assignee => assignee.id !== userId);
        const updatedData = {
            ...this.data,
            assignees: updatedAssignees,
            updatedAt: new Date()
        };
        return new GitHubIssue(updatedData);
    }
    updateTitle(newTitle) {
        if (!newTitle || newTitle.trim().length === 0) {
            throw new Error("El título no puede estar vacío");
        }
        const updatedData = {
            ...this.data,
            title: newTitle.trim(),
            updatedAt: new Date()
        };
        return new GitHubIssue(updatedData);
    }
    updateBody(newBody) {
        const updatedData = {
            ...this.data,
            body: newBody.trim() || undefined,
            updatedAt: new Date()
        };
        return new GitHubIssue(updatedData);
    }
    close() {
        if (!this.canBeClosed()) {
            throw new Error("El Issue no puede ser cerrado en su estado actual");
        }
        const updatedData = {
            ...this.data,
            state: "CLOSED",
            closedAt: new Date(),
            updatedAt: new Date()
        };
        return new GitHubIssue(updatedData);
    }
    reopen() {
        if (!this.canBeReopened()) {
            throw new Error("El Issue no puede ser reabierto en su estado actual");
        }
        const updatedData = {
            ...this.data,
            state: "OPEN",
            closedAt: undefined,
            updatedAt: new Date()
        };
        return new GitHubIssue(updatedData);
    }
    lock() {
        const updatedData = {
            ...this.data,
            locked: true,
            updatedAt: new Date()
        };
        return new GitHubIssue(updatedData);
    }
    unlock() {
        const updatedData = {
            ...this.data,
            locked: false,
            updatedAt: new Date()
        };
        return new GitHubIssue(updatedData);
    }
    updateCommentCount(count) {
        const updatedData = {
            ...this.data,
            commentsCount: Math.max(0, count),
            updatedAt: new Date()
        };
        return new GitHubIssue(updatedData);
    }
    // Serialization
    toPlainObject() {
        return { ...this.data };
    }
    toJSON() {
        return this.toPlainObject();
    }
}
exports.GitHubIssue = GitHubIssue;
//# sourceMappingURL=GitHubIssue.js.map