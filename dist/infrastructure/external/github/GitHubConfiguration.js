"use strict";
/**
 * GitHub Configuration Entity - Domain Layer
 *
 * Representa la configuración de GitHub para un proyecto específico
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubConfiguration = void 0;
class GitHubConfiguration {
    constructor(data) {
        this.data = data;
        this.validateData();
    }
    static create(projectId, defaultRepository, credentials, organization) {
        const configData = {
            id: `github-config-${projectId}`,
            projectId,
            defaultRepository: defaultRepository.trim(),
            organization: organization?.trim(),
            credentials,
            webhook: {
                enabled: false,
                events: ["push", "pull_request", "issues"],
                active: false
            },
            automation: {
                autoCreateBranches: true,
                autoCreatePullRequests: true,
                autoMerge: false,
                requireReviews: true,
                minimumReviews: 1,
                requireStatusChecks: false,
                deleteFeatureBranches: true,
                squashMerge: false
            },
            branchProtection: {
                main: GitHubConfiguration.createDefaultBranchProtection(),
                develop: GitHubConfiguration.createDefaultBranchProtection()
            },
            defaultBranch: "main",
            repositoryVisibility: "PRIVATE",
            defaultLabels: ["bug", "enhancement", "documentation", "question"],
            defaultAssignees: [],
            autoAssignPullRequests: false,
            notifyOnPullRequest: true,
            notifyOnIssue: true,
            notifyOnCommit: false,
            rateLimitPerHour: 5000,
            enabled: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return new GitHubConfiguration(configData);
    }
    static createDefaultBranchProtection() {
        return {
            enabled: true,
            enforceAdmins: false,
            requirePullRequestReviews: true,
            requiredReviewers: 1,
            dismissStaleReviews: true,
            requireCodeOwnerReviews: false,
            requireStatusChecks: false,
            strictStatusChecks: false,
            requiredStatusChecks: [],
            restrictPushAccess: false,
            pushAccessUsers: [],
            pushAccessTeams: []
        };
    }
    validateData() {
        if (!this.data.projectId || this.data.projectId.trim().length === 0) {
            throw new Error("El ID del proyecto es requerido");
        }
        if (!this.data.defaultRepository || this.data.defaultRepository.trim().length === 0) {
            throw new Error("El repositorio por defecto es requerido");
        }
        if (!this.data.credentials || !this.data.credentials.type) {
            throw new Error("Las credenciales de GitHub son requeridas");
        }
        this.validateCredentials();
        this.validateRateLimit();
    }
    validateCredentials() {
        const { credentials } = this.data;
        switch (credentials.type) {
            case "TOKEN":
                if (!credentials.token || credentials.token.trim().length === 0) {
                    throw new Error("El token de GitHub es requerido para autenticación TOKEN");
                }
                break;
            case "APP":
                if (!credentials.appId || !credentials.privateKey) {
                    throw new Error("El App ID y Private Key son requeridos para autenticación APP");
                }
                break;
            case "OAUTH":
                if (!credentials.clientId || !credentials.clientSecret) {
                    throw new Error("El Client ID y Client Secret son requeridos para autenticación OAUTH");
                }
                break;
        }
    }
    validateRateLimit() {
        if (this.data.rateLimitPerHour < 1 || this.data.rateLimitPerHour > 10000) {
            throw new Error("El límite de tasa debe estar entre 1 y 10000 por hora");
        }
    }
    // Getters
    getId() {
        return this.data.id;
    }
    getProjectId() {
        return this.data.projectId;
    }
    getDefaultRepository() {
        return this.data.defaultRepository;
    }
    getOrganization() {
        return this.data.organization;
    }
    getCredentials() {
        return { ...this.data.credentials };
    }
    getWebhookConfig() {
        return { ...this.data.webhook };
    }
    getAutomationSettings() {
        return { ...this.data.automation };
    }
    getBranchProtection(branchName) {
        const protection = this.data.branchProtection[branchName];
        return protection ? { ...protection } : undefined;
    }
    getAllBranchProtections() {
        const protections = {};
        for (const [branch, protection] of Object.entries(this.data.branchProtection)) {
            protections[branch] = { ...protection };
        }
        return protections;
    }
    getDefaultBranch() {
        return this.data.defaultBranch;
    }
    getRepositoryTemplate() {
        return this.data.repositoryTemplate;
    }
    getRepositoryDescription() {
        return this.data.repositoryDescription;
    }
    getRepositoryVisibility() {
        return this.data.repositoryVisibility;
    }
    getDefaultLabels() {
        return [...this.data.defaultLabels];
    }
    getDefaultAssignees() {
        return [...this.data.defaultAssignees];
    }
    getRateLimitPerHour() {
        return this.data.rateLimitPerHour;
    }
    isEnabled() {
        return this.data.enabled;
    }
    getCreatedAt() {
        return this.data.createdAt;
    }
    getUpdatedAt() {
        return this.data.updatedAt;
    }
    getLastSyncAt() {
        return this.data.lastSyncAt;
    }
    // Business Methods
    hasValidCredentials() {
        try {
            this.validateCredentials();
            return true;
        }
        catch {
            return false;
        }
    }
    isWebhookEnabled() {
        return this.data.webhook.enabled && this.data.webhook.active;
    }
    isAutomationEnabled() {
        return this.data.automation.autoCreateBranches ||
            this.data.automation.autoCreatePullRequests ||
            this.data.automation.autoMerge;
    }
    isBranchProtected(branchName) {
        const protection = this.data.branchProtection[branchName];
        return protection?.enabled || false;
    }
    requiresReviews() {
        return this.data.automation.requireReviews;
    }
    getMinimumReviews() {
        return this.data.automation.minimumReviews;
    }
    shouldAutoMerge() {
        return this.data.automation.autoMerge;
    }
    shouldDeleteFeatureBranches() {
        return this.data.automation.deleteFeatureBranches;
    }
    shouldSquashMerge() {
        return this.data.automation.squashMerge;
    }
    shouldAutoAssignPullRequests() {
        return this.data.autoAssignPullRequests;
    }
    hasNotifications() {
        return this.data.notifyOnPullRequest ||
            this.data.notifyOnIssue ||
            this.data.notifyOnCommit;
    }
    isWithinRateLimit(currentUsage) {
        return currentUsage < this.data.rateLimitPerHour;
    }
    needsSync() {
        if (!this.data.lastSyncAt)
            return true;
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return this.data.lastSyncAt < oneDayAgo;
    }
    // Actions
    updateCredentials(credentials) {
        const updatedData = {
            ...this.data,
            credentials: { ...credentials },
            updatedAt: new Date()
        };
        return new GitHubConfiguration(updatedData);
    }
    updateWebhookConfig(webhookConfig) {
        const updatedWebhook = {
            ...this.data.webhook,
            ...webhookConfig
        };
        const updatedData = {
            ...this.data,
            webhook: updatedWebhook,
            updatedAt: new Date()
        };
        return new GitHubConfiguration(updatedData);
    }
    updateAutomationSettings(automationSettings) {
        const updatedAutomation = {
            ...this.data.automation,
            ...automationSettings
        };
        const updatedData = {
            ...this.data,
            automation: updatedAutomation,
            updatedAt: new Date()
        };
        return new GitHubConfiguration(updatedData);
    }
    setBranchProtection(branchName, protection) {
        const updatedProtections = {
            ...this.data.branchProtection,
            [branchName]: { ...protection }
        };
        const updatedData = {
            ...this.data,
            branchProtection: updatedProtections,
            updatedAt: new Date()
        };
        return new GitHubConfiguration(updatedData);
    }
    removeBranchProtection(branchName) {
        const updatedProtections = { ...this.data.branchProtection };
        delete updatedProtections[branchName];
        const updatedData = {
            ...this.data,
            branchProtection: updatedProtections,
            updatedAt: new Date()
        };
        return new GitHubConfiguration(updatedData);
    }
    updateDefaultRepository(repositoryName) {
        const updatedData = {
            ...this.data,
            defaultRepository: repositoryName.trim(),
            updatedAt: new Date()
        };
        return new GitHubConfiguration(updatedData);
    }
    updateDefaultBranch(branchName) {
        const updatedData = {
            ...this.data,
            defaultBranch: branchName.trim(),
            updatedAt: new Date()
        };
        return new GitHubConfiguration(updatedData);
    }
    addDefaultLabel(label) {
        if (this.data.defaultLabels.includes(label)) {
            return this;
        }
        const updatedData = {
            ...this.data,
            defaultLabels: [...this.data.defaultLabels, label.trim()],
            updatedAt: new Date()
        };
        return new GitHubConfiguration(updatedData);
    }
    removeDefaultLabel(label) {
        const updatedLabels = this.data.defaultLabels.filter(l => l !== label);
        const updatedData = {
            ...this.data,
            defaultLabels: updatedLabels,
            updatedAt: new Date()
        };
        return new GitHubConfiguration(updatedData);
    }
    addDefaultAssignee(assignee) {
        if (this.data.defaultAssignees.includes(assignee)) {
            return this;
        }
        const updatedData = {
            ...this.data,
            defaultAssignees: [...this.data.defaultAssignees, assignee.trim()],
            updatedAt: new Date()
        };
        return new GitHubConfiguration(updatedData);
    }
    removeDefaultAssignee(assignee) {
        const updatedAssignees = this.data.defaultAssignees.filter(a => a !== assignee);
        const updatedData = {
            ...this.data,
            defaultAssignees: updatedAssignees,
            updatedAt: new Date()
        };
        return new GitHubConfiguration(updatedData);
    }
    updateRateLimit(limit) {
        if (limit < 1 || limit > 10000) {
            throw new Error("El límite de tasa debe estar entre 1 y 10000 por hora");
        }
        const updatedData = {
            ...this.data,
            rateLimitPerHour: limit,
            updatedAt: new Date()
        };
        return new GitHubConfiguration(updatedData);
    }
    enable() {
        const updatedData = {
            ...this.data,
            enabled: true,
            updatedAt: new Date()
        };
        return new GitHubConfiguration(updatedData);
    }
    disable() {
        const updatedData = {
            ...this.data,
            enabled: false,
            updatedAt: new Date()
        };
        return new GitHubConfiguration(updatedData);
    }
    markAsSynced() {
        const updatedData = {
            ...this.data,
            lastSyncAt: new Date(),
            updatedAt: new Date()
        };
        return new GitHubConfiguration(updatedData);
    }
    // Repository Management
    getFullRepositoryName() {
        if (this.data.organization) {
            return `${this.data.organization}/${this.data.defaultRepository}`;
        }
        return this.data.defaultRepository;
    }
    getRepositoryUrl() {
        return `https://github.com/${this.getFullRepositoryName()}`;
    }
    getWebhookUrl() {
        return this.data.webhook.url;
    }
    // Serialization
    toPlainObject() {
        return { ...this.data };
    }
    toJSON() {
        return this.toPlainObject();
    }
    // Security - Remove sensitive data for logging/display
    toSafeObject() {
        const { credentials, ...safeData } = this.data;
        return {
            ...safeData,
            credentials: {
                type: credentials.type
            }
        };
    }
}
exports.GitHubConfiguration = GitHubConfiguration;
//# sourceMappingURL=GitHubConfiguration.js.map