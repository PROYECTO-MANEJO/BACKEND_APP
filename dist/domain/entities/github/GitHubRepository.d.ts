/**
 * GitHub Repository Entity - Domain Layer
 *
 * Representa un repositorio de GitHub con sus configuraciones y metadatos
 */
export interface GitHubRepositoryData {
    id: string;
    name: string;
    fullName: string;
    owner: string;
    description?: string;
    isPrivate: boolean;
    defaultBranch: string;
    url: string;
    cloneUrl: string;
    language?: string;
    topics: string[];
    repositoryType: "FRONTEND" | "BACKEND" | "SHARED" | "OTHER";
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastSyncDate?: Date;
    starCount?: number;
    forkCount?: number;
    issueCount?: number;
    pullRequestCount?: number;
}
export declare class GitHubRepository {
    private data;
    constructor(data: GitHubRepositoryData);
    static create(name: string, owner: string, repositoryType: "FRONTEND" | "BACKEND" | "SHARED" | "OTHER", isPrivate?: boolean, defaultBranch?: string): GitHubRepository;
    static fromGitHubAPI(apiData: any, repositoryType: "FRONTEND" | "BACKEND" | "SHARED" | "OTHER"): GitHubRepository;
    private validateData;
    getId(): string;
    getName(): string;
    getFullName(): string;
    getOwner(): string;
    getDefaultBranch(): string;
    getUrl(): string;
    getCloneUrl(): string;
    getRepositoryType(): "FRONTEND" | "BACKEND" | "SHARED" | "OTHER";
    isActive(): boolean;
    isPrivate(): boolean;
    getTopics(): string[];
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    getLastSyncDate(): Date | undefined;
    needsSync(): boolean;
    canCreateBranches(): boolean;
    canCreateIssues(): boolean;
    canCreatePullRequests(): boolean;
    updateMetadata(description?: string, language?: string, topics?: string[]): GitHubRepository;
    markAsSynced(): GitHubRepository;
    updateStatistics(starCount: number, forkCount: number, issueCount: number, pullRequestCount?: number): GitHubRepository;
    deactivate(): GitHubRepository;
    activate(): GitHubRepository;
    toPlainObject(): GitHubRepositoryData;
    toJSON(): GitHubRepositoryData;
}
//# sourceMappingURL=GitHubRepository.d.ts.map