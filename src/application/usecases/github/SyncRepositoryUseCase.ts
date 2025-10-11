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
    branches: { synced: number; skipped: number; errors: number };
    pullRequests: { synced: number; skipped: number; errors: number };
    issues: { synced: number; skipped: number; errors: number };
    commits: { synced: number; skipped: number; errors: number };
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

export class SyncRepositoryUseCase {
  constructor(
    private githubAPI: IGitHubSyncAPIService,
    private repositoryRepo: IGitHubRepositorySyncRepository,
    private branchRepo: IGitHubBranchSyncRepository,
    private pullRequestRepo: IGitHubPullRequestSyncRepository,
    private issueRepo: IGitHubIssueSyncRepository,
    private commitRepo: IGitHubCommitSyncRepository
  ) {}

  public async execute(request: SyncRepositoryRequest): Promise<SyncRepositoryResponse> {
    const errors: string[] = [];
    const syncStats = {
      branches: { synced: 0, skipped: 0, errors: 0 },
      pullRequests: { synced: 0, skipped: 0, errors: 0 },
      issues: { synced: 0, skipped: 0, errors: 0 },
      commits: { synced: 0, skipped: 0, errors: 0 }
    };

    try {
      // Validar entrada
      this.validateRequest(request);

      // Determinar el repositorio a sincronizar
      const repositoryName = request.repositoryName || await this.getRepositoryNameFromId(request.repositoryId!);
      const repositoryFullName = request.organization ? `${request.organization}/${repositoryName}` : repositoryName;

      // Obtener datos del repositorio desde GitHub
      const githubRepoData = await this.githubAPI.getRepository(repositoryName, request.organization);
      
      // Sincronizar el repositorio base
      const repository = await this.syncRepository(githubRepoData, request.repositoryId);

      // Sincronizar entidades relacionadas
      if (request.syncBranches !== false) {
        const branchStats = await this.syncBranches(repository.getId(), repositoryFullName);
        syncStats.branches = branchStats;
      }

      if (request.syncPullRequests !== false) {
        const prStats = await this.syncPullRequests(repository.getId(), repositoryFullName);
        syncStats.pullRequests = prStats;
      }

      if (request.syncIssues !== false) {
        const issueStats = await this.syncIssues(repository.getId(), repositoryFullName);
        syncStats.issues = issueStats;
      }

      if (request.syncCommits !== false) {
        const commitStats = await this.syncCommits(repository.getId(), repositoryFullName, request.maxCommits);
        syncStats.commits = commitStats;
      }

      // Marcar repositorio como sincronizado
      const updatedRepo = repository.markAsSynced();
      await this.repositoryRepo.update(updatedRepo);

      const totalSynced = syncStats.branches.synced + syncStats.pullRequests.synced + 
                         syncStats.issues.synced + syncStats.commits.synced;
      const totalErrors = syncStats.branches.errors + syncStats.pullRequests.errors + 
                         syncStats.issues.errors + syncStats.commits.errors;

      return {
        repository: updatedRepo,
        syncStats,
        success: totalErrors === 0,
        message: `Sincronización completada: ${totalSynced} elementos sincronizados${totalErrors > 0 ? `, ${totalErrors} errores` : ''}`,
        errors
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      errors.push(errorMessage);

      return {
        repository: await this.getBasicRepository(request),
        syncStats,
        success: false,
        message: `Error durante la sincronización: ${errorMessage}`,
        errors
      };
    }
  }

  private async syncRepository(githubRepoData: any, existingId?: string): Promise<GitHubRepository> {
    try {
      // Determinar el tipo de repositorio
      const repositoryType = this.determineRepositoryType(githubRepoData.name, githubRepoData.description);
      
      if (existingId) {
        // Actualizar repositorio existente
        const existingRepo = await this.repositoryRepo.findById(existingId);
        if (existingRepo) {
          const updatedRepo = GitHubRepository.fromGitHubAPI(githubRepoData, repositoryType);
          return await this.repositoryRepo.update(updatedRepo);
        }
      }

      // Crear nuevo repositorio
      const newRepo = GitHubRepository.fromGitHubAPI(githubRepoData, repositoryType);
      return await this.repositoryRepo.create(newRepo);

    } catch (error) {
      throw new Error(`Error sincronizando repositorio: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private async syncBranches(repositoryId: string, repositoryFullName: string): Promise<{ synced: number; skipped: number; errors: number }> {
    let synced = 0, skipped = 0, errors = 0;

    try {
      const githubBranches = await this.githubAPI.listBranches(repositoryFullName);
      
      for (const branchData of githubBranches) {
        try {
          const existingBranch = await this.branchRepo.findByName(branchData.name, repositoryId);
          
          if (existingBranch) {
            // Verificar si necesita actualización (por ejemplo, si el SHA cambió)
            if (existingBranch.getSha() !== branchData.commit?.sha) {
              const updatedBranch = GitHubBranch.fromGitHubAPI(branchData, repositoryId, repositoryFullName);
              await this.branchRepo.update(updatedBranch);
              synced++;
            } else {
              skipped++;
            }
          } else {
            // Crear nueva rama
            const newBranch = GitHubBranch.fromGitHubAPI(branchData, repositoryId, repositoryFullName);
            await this.branchRepo.create(newBranch);
            synced++;
          }
        } catch (error) {
          errors++;
          console.warn(`Error sincronizando rama ${branchData.name}:`, error);
        }
      }
    } catch (error) {
      errors++;
      console.error("Error listando ramas:", error);
    }

    return { synced, skipped, errors };
  }

  private async syncPullRequests(repositoryId: string, repositoryFullName: string): Promise<{ synced: number; skipped: number; errors: number }> {
    let synced = 0, skipped = 0, errors = 0;

    try {
      // Sincronizar PRs abiertos y cerrados
      const openPRs = await this.githubAPI.listPullRequests(repositoryFullName, "open");
      const closedPRs = await this.githubAPI.listPullRequests(repositoryFullName, "closed");
      const allPRs = [...openPRs, ...closedPRs.slice(0, 50)]; // Limitar PRs cerrados

      for (const prData of allPRs) {
        try {
          const existingPR = await this.pullRequestRepo.findByNumber(prData.number, repositoryId);
          
          if (existingPR) {
            // Verificar si necesita actualización
            const currentUpdatedAt = new Date(prData.updated_at);
            if (existingPR.getUpdatedAt() < currentUpdatedAt) {
              const updatedPR = GitHubPullRequest.fromGitHubAPI(prData, repositoryId);
              await this.pullRequestRepo.update(updatedPR);
              synced++;
            } else {
              skipped++;
            }
          } else {
            // Crear nuevo PR
            const newPR = GitHubPullRequest.fromGitHubAPI(prData, repositoryId);
            await this.pullRequestRepo.create(newPR);
            synced++;
          }
        } catch (error) {
          errors++;
          console.warn(`Error sincronizando PR #${prData.number}:`, error);
        }
      }
    } catch (error) {
      errors++;
      console.error("Error listando pull requests:", error);
    }

    return { synced, skipped, errors };
  }

  private async syncIssues(repositoryId: string, repositoryFullName: string): Promise<{ synced: number; skipped: number; errors: number }> {
    let synced = 0, skipped = 0, errors = 0;

    try {
      // Sincronizar issues abiertos y algunos cerrados recientes
      const openIssues = await this.githubAPI.listIssues(repositoryFullName, "open");
      const closedIssues = await this.githubAPI.listIssues(repositoryFullName, "closed");
      const allIssues = [...openIssues, ...closedIssues.slice(0, 30)]; // Limitar issues cerrados

      for (const issueData of allIssues) {
        try {
          // Filtrar pull requests (GitHub API incluye PRs en issues)
          if (issueData.pull_request) {
            continue;
          }

          const existingIssue = await this.issueRepo.findByNumber(issueData.number, repositoryId);
          
          if (existingIssue) {
            // Verificar si necesita actualización
            const currentUpdatedAt = new Date(issueData.updated_at);
            if (existingIssue.getUpdatedAt() < currentUpdatedAt) {
              const updatedIssue = GitHubIssue.fromGitHubAPI(issueData, repositoryId);
              await this.issueRepo.update(updatedIssue);
              synced++;
            } else {
              skipped++;
            }
          } else {
            // Crear nuevo issue
            const newIssue = GitHubIssue.fromGitHubAPI(issueData, repositoryId);
            await this.issueRepo.create(newIssue);
            synced++;
          }
        } catch (error) {
          errors++;
          console.warn(`Error sincronizando issue #${issueData.number}:`, error);
        }
      }
    } catch (error) {
      errors++;
      console.error("Error listando issues:", error);
    }

    return { synced, skipped, errors };
  }

  private async syncCommits(repositoryId: string, repositoryFullName: string, maxCommits: number = 100): Promise<{ synced: number; skipped: number; errors: number }> {
    let synced = 0, skipped = 0, errors = 0;

    try {
      const commits = await this.githubAPI.listCommits(repositoryFullName, undefined, maxCommits);

      for (const commitData of commits) {
        try {
          const existingCommit = await this.commitRepo.findBySha(commitData.sha, repositoryId);
          
          if (existingCommit) {
            skipped++;
          } else {
            // Crear nuevo commit
            const newCommit = GitHubCommit.fromGitHubAPI(commitData, repositoryId);
            await this.commitRepo.create(newCommit);
            synced++;
          }
        } catch (error) {
          errors++;
          console.warn(`Error sincronizando commit ${commitData.sha}:`, error);
        }
      }
    } catch (error) {
      errors++;
      console.error("Error listando commits:", error);
    }

    return { synced, skipped, errors };
  }

  private async getRepositoryNameFromId(repositoryId: string): Promise<string> {
    const repository = await this.repositoryRepo.findById(repositoryId);
    if (!repository) {
      throw new Error(`Repositorio con ID ${repositoryId} no encontrado`);
    }
    return repository.getName();
  }

  private async getBasicRepository(request: SyncRepositoryRequest): Promise<GitHubRepository> {
    if (request.repositoryId) {
      const existing = await this.repositoryRepo.findById(request.repositoryId);
      if (existing) return existing;
    }

    // Crear repositorio básico como fallback
    return GitHubRepository.create(
      request.repositoryName || "unknown",
      request.organization || "unknown",
      "OTHER"
    );
  }

  private determineRepositoryType(name: string, description?: string): "FRONTEND" | "BACKEND" | "SHARED" | "OTHER" {
    const lowerName = name.toLowerCase();
    const lowerDesc = description?.toLowerCase() || "";

    if (lowerName.includes("frontend") || lowerName.includes("client") || lowerName.includes("ui") || 
        lowerDesc.includes("frontend") || lowerDesc.includes("react") || lowerDesc.includes("angular")) {
      return "FRONTEND";
    }

    if (lowerName.includes("backend") || lowerName.includes("server") || lowerName.includes("api") || 
        lowerDesc.includes("backend") || lowerDesc.includes("server") || lowerDesc.includes("api")) {
      return "BACKEND";
    }

    if (lowerName.includes("shared") || lowerName.includes("common") || lowerName.includes("lib") || 
        lowerDesc.includes("shared") || lowerDesc.includes("library") || lowerDesc.includes("common")) {
      return "SHARED";
    }

    return "OTHER";
  }

  private validateRequest(request: SyncRepositoryRequest): void {
    if (!request.repositoryId && !request.repositoryName) {
      throw new Error("Debe especificar repositoryId o repositoryName");
    }

    if (request.maxCommits && (request.maxCommits < 1 || request.maxCommits > 1000)) {
      throw new Error("maxCommits debe estar entre 1 y 1000");
    }

    if (request.repositoryName) {
      const namePattern = /^[a-zA-Z0-9._-]+$/;
      if (!namePattern.test(request.repositoryName)) {
        throw new Error("El nombre del repositorio contiene caracteres inválidos");
      }
    }

    if (request.organization) {
      const orgPattern = /^[a-zA-Z0-9._-]+$/;
      if (!orgPattern.test(request.organization)) {
        throw new Error("El nombre de la organización contiene caracteres inválidos");
      }
    }
  }
}