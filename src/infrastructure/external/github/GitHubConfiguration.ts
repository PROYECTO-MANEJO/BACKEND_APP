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
  
  // Basic GitHub settings
  defaultRepository: string;
  organization?: string;
  
  // Authentication
  credentials: GitHubAPICredentials;
  
  // Webhook configuration
  webhook: GitHubWebhookConfig;
  
  // Automation settings
  automation: GitHubAutomationSettings;
  
  // Branch protection
  branchProtection: Record<string, GitHubBranchProtection>;
  
  // Default branch settings
  defaultBranch: string;
  
  // Repository settings
  repositoryTemplate?: string;
  repositoryDescription?: string;
  repositoryVisibility: "PUBLIC" | "PRIVATE";
  
  // Labels configuration
  defaultLabels: string[];
  
  // Assignee rules
  defaultAssignees: string[];
  autoAssignPullRequests: boolean;
  
  // Notification settings
  notifyOnPullRequest: boolean;
  notifyOnIssue: boolean;
  notifyOnCommit: boolean;
  
  // Rate limiting
  rateLimitPerHour: number;
  
  // Status
  enabled: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastSyncAt?: Date;
}

export class GitHubConfiguration {
  constructor(private data: GitHubConfigurationData) {
    this.validateData();
  }

  public static create(
    projectId: string,
    defaultRepository: string,
    credentials: GitHubAPICredentials,
    organization?: string
  ): GitHubConfiguration {
    const configData: GitHubConfigurationData = {
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

  private static createDefaultBranchProtection(): GitHubBranchProtection {
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

  private validateData(): void {
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

  private validateCredentials(): void {
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

  private validateRateLimit(): void {
    if (this.data.rateLimitPerHour < 1 || this.data.rateLimitPerHour > 10000) {
      throw new Error("El límite de tasa debe estar entre 1 y 10000 por hora");
    }
  }

  // Getters
  public getId(): string {
    return this.data.id;
  }

  public getProjectId(): string {
    return this.data.projectId;
  }

  public getDefaultRepository(): string {
    return this.data.defaultRepository;
  }

  public getOrganization(): string | undefined {
    return this.data.organization;
  }

  public getCredentials(): GitHubAPICredentials {
    return { ...this.data.credentials };
  }

  public getWebhookConfig(): GitHubWebhookConfig {
    return { ...this.data.webhook };
  }

  public getAutomationSettings(): GitHubAutomationSettings {
    return { ...this.data.automation };
  }

  public getBranchProtection(branchName: string): GitHubBranchProtection | undefined {
    const protection = this.data.branchProtection[branchName];
    return protection ? { ...protection } : undefined;
  }

  public getAllBranchProtections(): Record<string, GitHubBranchProtection> {
    const protections: Record<string, GitHubBranchProtection> = {};
    for (const [branch, protection] of Object.entries(this.data.branchProtection)) {
      protections[branch] = { ...protection };
    }
    return protections;
  }

  public getDefaultBranch(): string {
    return this.data.defaultBranch;
  }

  public getRepositoryTemplate(): string | undefined {
    return this.data.repositoryTemplate;
  }

  public getRepositoryDescription(): string | undefined {
    return this.data.repositoryDescription;
  }

  public getRepositoryVisibility(): "PUBLIC" | "PRIVATE" {
    return this.data.repositoryVisibility;
  }

  public getDefaultLabels(): string[] {
    return [...this.data.defaultLabels];
  }

  public getDefaultAssignees(): string[] {
    return [...this.data.defaultAssignees];
  }

  public getRateLimitPerHour(): number {
    return this.data.rateLimitPerHour;
  }

  public isEnabled(): boolean {
    return this.data.enabled;
  }

  public getCreatedAt(): Date {
    return this.data.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.data.updatedAt;
  }

  public getLastSyncAt(): Date | undefined {
    return this.data.lastSyncAt;
  }

  // Business Methods
  public hasValidCredentials(): boolean {
    try {
      this.validateCredentials();
      return true;
    } catch {
      return false;
    }
  }

  public isWebhookEnabled(): boolean {
    return this.data.webhook.enabled && this.data.webhook.active;
  }

  public isAutomationEnabled(): boolean {
    return this.data.automation.autoCreateBranches || 
           this.data.automation.autoCreatePullRequests ||
           this.data.automation.autoMerge;
  }

  public isBranchProtected(branchName: string): boolean {
    const protection = this.data.branchProtection[branchName];
    return protection?.enabled || false;
  }

  public requiresReviews(): boolean {
    return this.data.automation.requireReviews;
  }

  public getMinimumReviews(): number {
    return this.data.automation.minimumReviews;
  }

  public shouldAutoMerge(): boolean {
    return this.data.automation.autoMerge;
  }

  public shouldDeleteFeatureBranches(): boolean {
    return this.data.automation.deleteFeatureBranches;
  }

  public shouldSquashMerge(): boolean {
    return this.data.automation.squashMerge;
  }

  public shouldAutoAssignPullRequests(): boolean {
    return this.data.autoAssignPullRequests;
  }

  public hasNotifications(): boolean {
    return this.data.notifyOnPullRequest || 
           this.data.notifyOnIssue || 
           this.data.notifyOnCommit;
  }

  public isWithinRateLimit(currentUsage: number): boolean {
    return currentUsage < this.data.rateLimitPerHour;
  }

  public needsSync(): boolean {
    if (!this.data.lastSyncAt) return true;
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return this.data.lastSyncAt < oneDayAgo;
  }

  // Actions
  public updateCredentials(credentials: GitHubAPICredentials): GitHubConfiguration {
    const updatedData = {
      ...this.data,
      credentials: { ...credentials },
      updatedAt: new Date()
    };

    return new GitHubConfiguration(updatedData);
  }

  public updateWebhookConfig(webhookConfig: Partial<GitHubWebhookConfig>): GitHubConfiguration {
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

  public updateAutomationSettings(automationSettings: Partial<GitHubAutomationSettings>): GitHubConfiguration {
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

  public setBranchProtection(branchName: string, protection: GitHubBranchProtection): GitHubConfiguration {
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

  public removeBranchProtection(branchName: string): GitHubConfiguration {
    const updatedProtections = { ...this.data.branchProtection };
    delete updatedProtections[branchName];

    const updatedData = {
      ...this.data,
      branchProtection: updatedProtections,
      updatedAt: new Date()
    };

    return new GitHubConfiguration(updatedData);
  }

  public updateDefaultRepository(repositoryName: string): GitHubConfiguration {
    const updatedData = {
      ...this.data,
      defaultRepository: repositoryName.trim(),
      updatedAt: new Date()
    };

    return new GitHubConfiguration(updatedData);
  }

  public updateDefaultBranch(branchName: string): GitHubConfiguration {
    const updatedData = {
      ...this.data,
      defaultBranch: branchName.trim(),
      updatedAt: new Date()
    };

    return new GitHubConfiguration(updatedData);
  }

  public addDefaultLabel(label: string): GitHubConfiguration {
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

  public removeDefaultLabel(label: string): GitHubConfiguration {
    const updatedLabels = this.data.defaultLabels.filter(l => l !== label);

    const updatedData = {
      ...this.data,
      defaultLabels: updatedLabels,
      updatedAt: new Date()
    };

    return new GitHubConfiguration(updatedData);
  }

  public addDefaultAssignee(assignee: string): GitHubConfiguration {
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

  public removeDefaultAssignee(assignee: string): GitHubConfiguration {
    const updatedAssignees = this.data.defaultAssignees.filter(a => a !== assignee);

    const updatedData = {
      ...this.data,
      defaultAssignees: updatedAssignees,
      updatedAt: new Date()
    };

    return new GitHubConfiguration(updatedData);
  }

  public updateRateLimit(limit: number): GitHubConfiguration {
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

  public enable(): GitHubConfiguration {
    const updatedData = {
      ...this.data,
      enabled: true,
      updatedAt: new Date()
    };

    return new GitHubConfiguration(updatedData);
  }

  public disable(): GitHubConfiguration {
    const updatedData = {
      ...this.data,
      enabled: false,
      updatedAt: new Date()
    };

    return new GitHubConfiguration(updatedData);
  }

  public markAsSynced(): GitHubConfiguration {
    const updatedData = {
      ...this.data,
      lastSyncAt: new Date(),
      updatedAt: new Date()
    };

    return new GitHubConfiguration(updatedData);
  }

  // Repository Management
  public getFullRepositoryName(): string {
    if (this.data.organization) {
      return `${this.data.organization}/${this.data.defaultRepository}`;
    }
    return this.data.defaultRepository;
  }

  public getRepositoryUrl(): string {
    return `https://github.com/${this.getFullRepositoryName()}`;
  }

  public getWebhookUrl(): string | undefined {
    return this.data.webhook.url;
  }

  // Serialization
  public toPlainObject(): GitHubConfigurationData {
    return { ...this.data };
  }

  public toJSON(): GitHubConfigurationData {
    return this.toPlainObject();
  }

  // Security - Remove sensitive data for logging/display
  public toSafeObject(): Omit<GitHubConfigurationData, 'credentials'> & { credentials: { type: GitHubAuthType } } {
    const { credentials, ...safeData } = this.data;
    return {
      ...safeData,
      credentials: {
        type: credentials.type
      }
    };
  }
}