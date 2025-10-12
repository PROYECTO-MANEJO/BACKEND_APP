/**
 * Create Pull Request Use Case
 *
 * Caso de uso para crear un nuevo Pull Request de GitHub
 */
import { GitHubPullRequest } from "../../../domain/entities/github/GitHubPullRequest";
export interface CreatePullRequestRequest {
    title: string;
    body?: string;
    repositoryId: string;
    repositoryFullName: string;
    headBranch: string;
    baseBranch: string;
    changeRequestId?: string;
    isDraft?: boolean;
    assignees?: string[];
    reviewers?: string[];
    labels?: string[];
}
export interface CreatePullRequestResponse {
    pullRequest: GitHubPullRequest;
    success: boolean;
    message: string;
}
export interface IGitHubPullRequestRepository {
    create(pullRequest: GitHubPullRequest): Promise<GitHubPullRequest>;
    findByNumber(number: number, repositoryId: string): Promise<GitHubPullRequest | null>;
    findById(id: string): Promise<GitHubPullRequest | null>;
    findByRepository(repositoryId: string): Promise<GitHubPullRequest[]>;
    findByBranch(branchName: string, repositoryId: string): Promise<GitHubPullRequest[]>;
    findByChangeRequest(changeRequestId: string): Promise<GitHubPullRequest[]>;
    update(pullRequest: GitHubPullRequest): Promise<GitHubPullRequest>;
    delete(id: string): Promise<void>;
}
export interface IGitHubPullRequestAPIService {
    createPullRequest(request: CreatePullRequestRequest): Promise<any>;
    getPullRequest(number: number, repositoryFullName: string): Promise<any>;
    updatePullRequest(number: number, repositoryFullName: string, data: any): Promise<any>;
    closePullRequest(number: number, repositoryFullName: string): Promise<any>;
    mergePullRequest(number: number, repositoryFullName: string, mergeMethod?: string): Promise<any>;
    listPullRequests(repositoryFullName: string, state?: string): Promise<any[]>;
    requestReview(number: number, repositoryFullName: string, reviewers: string[]): Promise<void>;
    addAssignees(number: number, repositoryFullName: string, assignees: string[]): Promise<void>;
    addLabels(number: number, repositoryFullName: string, labels: string[]): Promise<void>;
}
export declare class CreatePullRequestUseCase {
    private pullRequestRepo;
    private githubAPI;
    constructor(pullRequestRepo: IGitHubPullRequestRepository, githubAPI: IGitHubPullRequestAPIService);
    execute(request: CreatePullRequestRequest): Promise<CreatePullRequestResponse>;
    private configurePostCreation;
    private validateRequest;
}
/**
 * Create Change Request Pull Request Use Case
 *
 * Caso de uso especializado para crear PRs desde solicitudes de cambio
 */
export declare class CreateChangeRequestPullRequestUseCase {
    private createPullRequestUseCase;
    constructor(createPullRequestUseCase: CreatePullRequestUseCase);
    execute(changeRequestId: string, changeRequestTitle: string, changeRequestDescription: string, repositoryId: string, repositoryFullName: string, headBranch: string, baseBranch?: string, assignees?: string[], reviewers?: string[]): Promise<CreatePullRequestResponse>;
    private generatePullRequestTitle;
    private generatePullRequestBody;
    private getChangeRequestLabels;
}
//# sourceMappingURL=CreatePullRequestUseCase.d.ts.map