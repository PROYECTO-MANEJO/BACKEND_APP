/**
 * Create Branch Use Case
 *
 * Caso de uso para crear una nueva rama de GitHub
 */
import { GitHubBranch } from "../../../domain/entities/github/GitHubBranch";
export interface CreateBranchRequest {
    name: string;
    repositoryId: string;
    repositoryFullName: string;
    baseBranch?: string;
    changeRequestId?: string;
    description?: string;
}
export interface CreateBranchResponse {
    branch: GitHubBranch;
    success: boolean;
    message: string;
}
export interface IGitHubBranchRepository {
    create(branch: GitHubBranch): Promise<GitHubBranch>;
    findByName(name: string, repositoryId: string): Promise<GitHubBranch | null>;
    findById(id: string): Promise<GitHubBranch | null>;
    findByRepository(repositoryId: string): Promise<GitHubBranch[]>;
    update(branch: GitHubBranch): Promise<GitHubBranch>;
    delete(id: string): Promise<void>;
}
export interface IGitHubBranchAPIService {
    createBranch(request: CreateBranchRequest): Promise<any>;
    getBranch(name: string, repositoryFullName: string): Promise<any>;
    deleteBranch(name: string, repositoryFullName: string): Promise<void>;
    listBranches(repositoryFullName: string): Promise<any[]>;
    getDefaultBranch(repositoryFullName: string): Promise<string>;
}
export declare class CreateBranchUseCase {
    private branchRepo;
    private githubAPI;
    constructor(branchRepo: IGitHubBranchRepository, githubAPI: IGitHubBranchAPIService);
    execute(request: CreateBranchRequest): Promise<CreateBranchResponse>;
    private getDefaultBaseBranch;
    private validateRequest;
    private determineBranchType;
}
/**
 * Create Feature Branch Use Case
 *
 * Caso de uso especializado para crear ramas de feature siguiendo GitFlow
 */
export declare class CreateFeatureBranchUseCase {
    private createBranchUseCase;
    constructor(createBranchUseCase: CreateBranchUseCase);
    execute(featureName: string, repositoryId: string, repositoryFullName: string, changeRequestId?: string, description?: string): Promise<CreateBranchResponse>;
    private generateFeatureBranchName;
}
/**
 * Create Hotfix Branch Use Case
 *
 * Caso de uso especializado para crear ramas de hotfix siguiendo GitFlow
 */
export declare class CreateHotfixBranchUseCase {
    private createBranchUseCase;
    constructor(createBranchUseCase: CreateBranchUseCase);
    execute(hotfixName: string, repositoryId: string, repositoryFullName: string, version?: string, changeRequestId?: string, description?: string): Promise<CreateBranchResponse>;
    private generateHotfixBranchName;
}
//# sourceMappingURL=CreateBranchUseCase.d.ts.map