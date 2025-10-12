/**
 * GitHub API Service
 *
 * Servicio de infraestructura para interactuar con la API de GitHub
 */
import { IGitHubAPIService, CreateRepositoryRequest } from "../../../application/usecases/github/CreateRepositoryUseCase";
import { IGitHubBranchAPIService, CreateBranchRequest } from "../../../application/usecases/github/CreateBranchUseCase";
import { IGitHubPullRequestAPIService, CreatePullRequestRequest } from "../../../application/usecases/github/CreatePullRequestUseCase";
import { IGitHubSyncAPIService } from "../../../application/usecases/github/SyncRepositoryUseCase";
export declare class GitHubAPIService implements IGitHubAPIService, IGitHubBranchAPIService, IGitHubPullRequestAPIService, IGitHubSyncAPIService {
    private token;
    private readonly baseURL;
    private readonly headers;
    constructor(token: string);
    createRepository(request: CreateRepositoryRequest): Promise<any>;
    getRepository(name: string, organization?: string): Promise<any>;
    updateRepository(name: string, data: any, organization?: string): Promise<any>;
    deleteRepository(name: string, organization?: string): Promise<void>;
    listRepositories(organization?: string): Promise<any[]>;
    createBranch(request: CreateBranchRequest): Promise<any>;
    getBranch(name: string, repositoryFullName: string): Promise<any>;
    deleteBranch(name: string, repositoryFullName: string): Promise<void>;
    listBranches(repositoryFullName: string): Promise<any[]>;
    getDefaultBranch(repositoryFullName: string): Promise<string>;
    private getBranchReference;
    createPullRequest(request: CreatePullRequestRequest): Promise<any>;
    getPullRequest(number: number, repositoryFullName: string): Promise<any>;
    updatePullRequest(number: number, repositoryFullName: string, data: any): Promise<any>;
    closePullRequest(number: number, repositoryFullName: string): Promise<any>;
    mergePullRequest(number: number, repositoryFullName: string, mergeMethod?: string): Promise<any>;
    listPullRequests(repositoryFullName: string, state?: string): Promise<any[]>;
    requestReview(number: number, repositoryFullName: string, reviewers: string[]): Promise<void>;
    addAssignees(number: number, repositoryFullName: string, assignees: string[]): Promise<void>;
    addLabels(number: number, repositoryFullName: string, labels: string[]): Promise<void>;
    listIssues(repositoryFullName: string, state?: string): Promise<any[]>;
    listCommits(repositoryFullName: string, branch?: string, maxCount?: number): Promise<any[]>;
    createWebhook(repositoryFullName: string, webhookUrl: string, secret: string, events: string[]): Promise<any>;
    updateWebhook(repositoryFullName: string, webhookId: number, webhookUrl: string, secret: string, events: string[]): Promise<any>;
    deleteWebhook(repositoryFullName: string, webhookId: number): Promise<void>;
    listWebhooks(repositoryFullName: string): Promise<any[]>;
    getRateLimit(): Promise<any>;
    getCurrentUser(): Promise<any>;
    private makeRequest;
    validateToken(): Promise<boolean>;
    getRepositoryInfo(repositoryFullName: string): Promise<{
        name: string;
        fullName: string;
        description: string;
        isPrivate: boolean;
        defaultBranch: string;
        starsCount: number;
        forksCount: number;
        openIssuesCount: number;
        language: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
//# sourceMappingURL=GitHubAPIService.d.ts.map