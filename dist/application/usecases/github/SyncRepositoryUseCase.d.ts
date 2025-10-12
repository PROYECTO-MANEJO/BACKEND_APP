/**
 * Sync Repository Use Case
 *
 * Caso de uso para sincronizar un repositorio de GitHub con el sistema local
 */
import { GitHubRepository } from "../../../domain/entities/github/GitHubRepository";
import { GitHubBranch } from "../../../domain/entities/github/GitHubBranch";
import { GitHubPullRequest } from "../../../domain/entities/github/GitHubPullRequest";
import { GitHubIssue } from "../../../domain/entities/github/GitHubIssue";
import { GitHubCommit } from "../../../domain/entities/github/GitHubCommit";
export interface SyncRepositoryRequest {
    repositoryId?: string;
    repositoryName?: string;
    organization?: string;
    syncBranches?: boolean;
    syncPullRequests?: boolean;
    syncIssues?: boolean;
    syncCommits?: boolean;
    maxCommits?: number;
}
export interface SyncRepositoryResponse {
    repository: GitHubRepository;
    syncStats: {
        branches: {
            synced: number;
            skipped: number;
            errors: number;
        };
        pullRequests: {
            synced: number;
            skipped: number;
            errors: number;
        };
        issues: {
            synced: number;
            skipped: number;
            errors: number;
        };
        commits: {
            synced: number;
            skipped: number;
            errors: number;
        };
    };
    success: boolean;
    message: string;
    errors: string[];
}
export interface IGitHubSyncAPIService {
    getRepository(name: string, organization?: string): Promise<any>;
    listBranches(repositoryFullName: string): Promise<any[]>;
    listPullRequests(repositoryFullName: string, state?: string): Promise<any[]>;
    listIssues(repositoryFullName: string, state?: string): Promise<any[]>;
    listCommits(repositoryFullName: string, branch?: string, maxCount?: number): Promise<any[]>;
}
export interface IGitHubRepositorySyncRepository {
    findByName(name: string, organization?: string): Promise<GitHubRepository | null>;
    findById(id: string): Promise<GitHubRepository | null>;
    create(repository: GitHubRepository): Promise<GitHubRepository>;
    update(repository: GitHubRepository): Promise<GitHubRepository>;
}
export interface IGitHubBranchSyncRepository {
    findByName(name: string, repositoryId: string): Promise<GitHubBranch | null>;
    findByRepository(repositoryId: string): Promise<GitHubBranch[]>;
    create(branch: GitHubBranch): Promise<GitHubBranch>;
    update(branch: GitHubBranch): Promise<GitHubBranch>;
    bulkCreate(branches: GitHubBranch[]): Promise<GitHubBranch[]>;
}
export interface IGitHubPullRequestSyncRepository {
    findByNumber(number: number, repositoryId: string): Promise<GitHubPullRequest | null>;
    findByRepository(repositoryId: string): Promise<GitHubPullRequest[]>;
    create(pullRequest: GitHubPullRequest): Promise<GitHubPullRequest>;
    update(pullRequest: GitHubPullRequest): Promise<GitHubPullRequest>;
    bulkCreate(pullRequests: GitHubPullRequest[]): Promise<GitHubPullRequest[]>;
}
export interface IGitHubIssueSyncRepository {
    findByNumber(number: number, repositoryId: string): Promise<GitHubIssue | null>;
    findByRepository(repositoryId: string): Promise<GitHubIssue[]>;
    create(issue: GitHubIssue): Promise<GitHubIssue>;
    update(issue: GitHubIssue): Promise<GitHubIssue>;
    bulkCreate(issues: GitHubIssue[]): Promise<GitHubIssue[]>;
}
export interface IGitHubCommitSyncRepository {
    findBySha(sha: string, repositoryId: string): Promise<GitHubCommit | null>;
    findByRepository(repositoryId: string): Promise<GitHubCommit[]>;
    create(commit: GitHubCommit): Promise<GitHubCommit>;
    update(commit: GitHubCommit): Promise<GitHubCommit>;
    bulkCreate(commits: GitHubCommit[]): Promise<GitHubCommit[]>;
}
export declare class SyncRepositoryUseCase {
    private githubAPI;
    private repositoryRepo;
    private branchRepo;
    private pullRequestRepo;
    private issueRepo;
    private commitRepo;
    constructor(githubAPI: IGitHubSyncAPIService, repositoryRepo: IGitHubRepositorySyncRepository, branchRepo: IGitHubBranchSyncRepository, pullRequestRepo: IGitHubPullRequestSyncRepository, issueRepo: IGitHubIssueSyncRepository, commitRepo: IGitHubCommitSyncRepository);
    execute(request: SyncRepositoryRequest): Promise<SyncRepositoryResponse>;
    private syncRepository;
    private syncBranches;
    private syncPullRequests;
    private syncIssues;
    private syncCommits;
    private getRepositoryNameFromId;
    private getBasicRepository;
    private determineRepositoryType;
    private validateRequest;
}
//# sourceMappingURL=SyncRepositoryUseCase.d.ts.map