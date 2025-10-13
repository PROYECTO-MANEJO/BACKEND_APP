/**
 * GitHub Branch Entity - Domain Layer
 *
 * Representa una rama de Git en el sistema con su flujo de trabajo (GitFlow)
 */
export type BranchType = "MAIN" | "DEVELOP" | "FEATURE" | "HOTFIX" | "BUGFIX" | "RELEASE" | "OTHER";
export type BranchStatus = "ACTIVE" | "MERGED" | "DELETED" | "STALE" | "PROTECTED";
export interface GitHubBranchData {
    id: string;
    name: string;
    repositoryId: string;
    repositoryFullName: string;
    branchType: BranchType;
    baseBranch?: string;
    targetBranch?: string;
    sha: string;
    protected: boolean;
    changeRequestId?: string;
    purpose?: string;
    description?: string;
    status: BranchStatus;
    createdBy?: string;
    assignedTo?: string;
    createdAt: Date;
    updatedAt: Date;
    lastCommitDate?: Date;
    mergedAt?: Date;
    commitCount?: number;
    behindBy?: number;
    aheadBy?: number;
}
export declare class GitHubBranch {
    private data;
    constructor(data: GitHubBranchData);
    static create(name: string, repositoryId: string, repositoryFullName: string, branchType: BranchType, sha: string, baseBranch?: string, changeRequestId?: string, createdBy?: string): GitHubBranch;
    static createFeatureBranch(repositoryId: string, repositoryFullName: string, featureName: string, sha: string, changeRequestId: string, developerId: string, baseBranch?: string): GitHubBranch;
    static createHotfixBranch(repositoryId: string, repositoryFullName: string, hotfixName: string, sha: string, changeRequestId: string, developerId: string, baseBranch?: string): GitHubBranch;
    static fromGitHubAPI(apiData: any, repositoryId: string, repositoryFullName: string, changeRequestId?: string): GitHubBranch;
    private static determineBranchType;
    private validateData;
    getId(): string;
    getName(): string;
    getRepositoryId(): string;
    getRepositoryFullName(): string;
    getBranchType(): BranchType;
    getBaseBranch(): string | undefined;
    getTargetBranch(): string | undefined;
    getSha(): string;
    isProtected(): boolean;
    getChangeRequestId(): string | undefined;
    getStatus(): BranchStatus;
    getCreatedBy(): string | undefined;
    getAssignedTo(): string | undefined;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    getLastCommitDate(): Date | undefined;
    getMergedAt(): Date | undefined;
    getCommitCount(): number | undefined;
    isMainBranch(): boolean;
    isDevelopBranch(): boolean;
    isFeatureBranch(): boolean;
    isHotfixBranch(): boolean;
    canBeDeleted(): boolean;
    canBeMerged(): boolean;
    isStale(): boolean;
    needsSync(): boolean;
    updateSha(newSha: string): GitHubBranch;
    assignTo(developerId: string): GitHubBranch;
    updateMetrics(commitCount: number, behindBy: number, aheadBy: number): GitHubBranch;
    markAsMerged(targetBranch?: string): GitHubBranch;
    markAsDeleted(): GitHubBranch;
    markAsStale(): GitHubBranch;
    updateDescription(description: string, purpose?: string): GitHubBranch;
    toPlainObject(): GitHubBranchData;
    toJSON(): GitHubBranchData;
}
//# sourceMappingURL=GitHubBranch.d.ts.map