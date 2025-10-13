/**
 * GitHub Configuration Entity - Domain Layer
 *
 * Representa la configuración de GitHub para un proyecto específico
 */
export type GitHubAuthType = "TOKEN" | "APP" | "OAUTH";
export interface GitHubAPICredentials {
    type: GitHubAuthType;
    token?: string;
    appId?: string;
    privateKey?: string;
    clientId?: string;
    clientSecret?: string;
}
export interface GitHubWebhookConfig {
    enabled: boolean;
    url?: string;
    secret?: string;
    events: string[];
    active: boolean;
}
export interface GitHubAutomationSettings {
    autoCreateBranches: boolean;
    autoCreatePullRequests: boolean;
    autoMerge: boolean;
    requireReviews: boolean;
    minimumReviews: number;
    requireStatusChecks: boolean;
    deleteFeatureBranches: boolean;
    squashMerge: boolean;
}
export interface GitHubBranchProtection {
    enabled: boolean;
    enforceAdmins: boolean;
    requirePullRequestReviews: boolean;
    requiredReviewers: number;
    dismissStaleReviews: boolean;
    requireCodeOwnerReviews: boolean;
    requireStatusChecks: boolean;
    strictStatusChecks: boolean;
    requiredStatusChecks: string[];
    restrictPushAccess: boolean;
    pushAccessUsers: string[];
    pushAccessTeams: string[];
}
export interface GitHubConfigurationData {
    id: string;
    projectId: string;
    defaultRepository: string;
    organization?: string;
    credentials: GitHubAPICredentials;
    webhook: GitHubWebhookConfig;
    automation: GitHubAutomationSettings;
    branchProtection: Record<string, GitHubBranchProtection>;
    defaultBranch: string;
    repositoryTemplate?: string;
    repositoryDescription?: string;
    repositoryVisibility: "PUBLIC" | "PRIVATE";
    defaultLabels: string[];
    defaultAssignees: string[];
    autoAssignPullRequests: boolean;
    notifyOnPullRequest: boolean;
    notifyOnIssue: boolean;
    notifyOnCommit: boolean;
    rateLimitPerHour: number;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastSyncAt?: Date;
}
export declare class GitHubConfiguration {
    private data;
    constructor(data: GitHubConfigurationData);
    static create(projectId: string, defaultRepository: string, credentials: GitHubAPICredentials, organization?: string): GitHubConfiguration;
    private static createDefaultBranchProtection;
    private validateData;
    private validateCredentials;
    private validateRateLimit;
    getId(): string;
    getProjectId(): string;
    getDefaultRepository(): string;
    getOrganization(): string | undefined;
    getCredentials(): GitHubAPICredentials;
    getWebhookConfig(): GitHubWebhookConfig;
    getAutomationSettings(): GitHubAutomationSettings;
    getBranchProtection(branchName: string): GitHubBranchProtection | undefined;
    getAllBranchProtections(): Record<string, GitHubBranchProtection>;
    getDefaultBranch(): string;
    getRepositoryTemplate(): string | undefined;
    getRepositoryDescription(): string | undefined;
    getRepositoryVisibility(): "PUBLIC" | "PRIVATE";
    getDefaultLabels(): string[];
    getDefaultAssignees(): string[];
    getRateLimitPerHour(): number;
    isEnabled(): boolean;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    getLastSyncAt(): Date | undefined;
    hasValidCredentials(): boolean;
    isWebhookEnabled(): boolean;
    isAutomationEnabled(): boolean;
    isBranchProtected(branchName: string): boolean;
    requiresReviews(): boolean;
    getMinimumReviews(): number;
    shouldAutoMerge(): boolean;
    shouldDeleteFeatureBranches(): boolean;
    shouldSquashMerge(): boolean;
    shouldAutoAssignPullRequests(): boolean;
    hasNotifications(): boolean;
    isWithinRateLimit(currentUsage: number): boolean;
    needsSync(): boolean;
    updateCredentials(credentials: GitHubAPICredentials): GitHubConfiguration;
    updateWebhookConfig(webhookConfig: Partial<GitHubWebhookConfig>): GitHubConfiguration;
    updateAutomationSettings(automationSettings: Partial<GitHubAutomationSettings>): GitHubConfiguration;
    setBranchProtection(branchName: string, protection: GitHubBranchProtection): GitHubConfiguration;
    removeBranchProtection(branchName: string): GitHubConfiguration;
    updateDefaultRepository(repositoryName: string): GitHubConfiguration;
    updateDefaultBranch(branchName: string): GitHubConfiguration;
    addDefaultLabel(label: string): GitHubConfiguration;
    removeDefaultLabel(label: string): GitHubConfiguration;
    addDefaultAssignee(assignee: string): GitHubConfiguration;
    removeDefaultAssignee(assignee: string): GitHubConfiguration;
    updateRateLimit(limit: number): GitHubConfiguration;
    enable(): GitHubConfiguration;
    disable(): GitHubConfiguration;
    markAsSynced(): GitHubConfiguration;
    getFullRepositoryName(): string;
    getRepositoryUrl(): string;
    getWebhookUrl(): string | undefined;
    toPlainObject(): GitHubConfigurationData;
    toJSON(): GitHubConfigurationData;
    toSafeObject(): Omit<GitHubConfigurationData, 'credentials'> & {
        credentials: {
            type: GitHubAuthType;
        };
    };
}
//# sourceMappingURL=GitHubConfiguration.d.ts.map