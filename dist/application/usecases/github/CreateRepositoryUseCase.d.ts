/**
 * Create Repository Use Case
 *
 * Caso de uso para crear un nuevo repositorio de GitHub
 */
import { GitHubRepository } from "../../../domain/entities/github/GitHubRepository";
export interface CreateRepositoryRequest {
    name: string;
    description?: string;
    isPrivate?: boolean;
    organization?: string;
    template?: string;
    autoInit?: boolean;
    gitignoreTemplate?: string;
    licenseTemplate?: string;
}
export interface CreateRepositoryResponse {
    repository: GitHubRepository;
    success: boolean;
    message: string;
}
export interface IGitHubRepositoryRepository {
    create(repository: GitHubRepository): Promise<GitHubRepository>;
    findByName(name: string, organization?: string): Promise<GitHubRepository | null>;
    findById(id: string): Promise<GitHubRepository | null>;
    update(repository: GitHubRepository): Promise<GitHubRepository>;
    delete(id: string): Promise<void>;
    list(organization?: string): Promise<GitHubRepository[]>;
}
export interface IGitHubAPIService {
    createRepository(request: CreateRepositoryRequest): Promise<any>;
    getRepository(name: string, organization?: string): Promise<any>;
    updateRepository(name: string, data: any, organization?: string): Promise<any>;
    deleteRepository(name: string, organization?: string): Promise<void>;
    listRepositories(organization?: string): Promise<any[]>;
}
export declare class CreateRepositoryUseCase {
    private repositoryRepo;
    private githubAPI;
    constructor(repositoryRepo: IGitHubRepositoryRepository, githubAPI: IGitHubAPIService);
    execute(request: CreateRepositoryRequest): Promise<CreateRepositoryResponse>;
    private validateRequest;
    private determineRepositoryType;
}
//# sourceMappingURL=CreateRepositoryUseCase.d.ts.map