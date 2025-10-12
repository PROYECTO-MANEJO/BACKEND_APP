"use strict";
/**
 * Sync Repository Use Case
 *
 * Caso de uso para sincronizar un repositorio de GitHub con el sistema local
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncRepositoryUseCase = void 0;
const GitHubRepository_1 = require("../../../domain/entities/github/GitHubRepository");
const GitHubBranch_1 = require("../../../domain/entities/github/GitHubBranch");
const GitHubPullRequest_1 = require("../../../domain/entities/github/GitHubPullRequest");
const GitHubIssue_1 = require("../../../domain/entities/github/GitHubIssue");
const GitHubCommit_1 = require("../../../domain/entities/github/GitHubCommit");
class SyncRepositoryUseCase {
    constructor(githubAPI, repositoryRepo, branchRepo, pullRequestRepo, issueRepo, commitRepo) {
        this.githubAPI = githubAPI;
        this.repositoryRepo = repositoryRepo;
        this.branchRepo = branchRepo;
        this.pullRequestRepo = pullRequestRepo;
        this.issueRepo = issueRepo;
        this.commitRepo = commitRepo;
    }
    async execute(request) {
        const errors = [];
        const syncStats = {
            branches: { synced: 0, skipped: 0, errors: 0 },
            pullRequests: { synced: 0, skipped: 0, errors: 0 },
            issues: { synced: 0, skipped: 0, errors: 0 },
            commits: { synced: 0, skipped: 0, errors: 0 },
        };
        try {
            // Validar entrada
            this.validateRequest(request);
            // Determinar el repositorio a sincronizar
            const repositoryName = request.repositoryName ||
                (await this.getRepositoryNameFromId(request.repositoryId));
            const repositoryFullName = request.organization
                ? `${request.organization}/${repositoryName}`
                : repositoryName;
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
            const totalSynced = syncStats.branches.synced +
                syncStats.pullRequests.synced +
                syncStats.issues.synced +
                syncStats.commits.synced;
            const totalErrors = syncStats.branches.errors +
                syncStats.pullRequests.errors +
                syncStats.issues.errors +
                syncStats.commits.errors;
            return {
                repository: updatedRepo,
                syncStats,
                success: totalErrors === 0,
                message: `Sincronización completada: ${totalSynced} elementos sincronizados${totalErrors > 0 ? `, ${totalErrors} errores` : ""}`,
                errors,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            errors.push(errorMessage);
            return {
                repository: await this.getBasicRepository(request),
                syncStats,
                success: false,
                message: `Error durante la sincronización: ${errorMessage}`,
                errors,
            };
        }
    }
    async syncRepository(githubRepoData, existingId) {
        try {
            // Determinar el tipo de repositorio
            const repositoryType = this.determineRepositoryType(githubRepoData.name, githubRepoData.description);
            if (existingId) {
                // Actualizar repositorio existente
                const existingRepo = await this.repositoryRepo.findById(existingId);
                if (existingRepo) {
                    const updatedRepo = GitHubRepository_1.GitHubRepository.fromGitHubAPI(githubRepoData, repositoryType);
                    return await this.repositoryRepo.update(updatedRepo);
                }
            }
            // Crear nuevo repositorio
            const newRepo = GitHubRepository_1.GitHubRepository.fromGitHubAPI(githubRepoData, repositoryType);
            return await this.repositoryRepo.create(newRepo);
        }
        catch (error) {
            throw new Error(`Error sincronizando repositorio: ${error instanceof Error ? error.message : "Error desconocido"}`);
        }
    }
    async syncBranches(repositoryId, repositoryFullName) {
        let synced = 0, skipped = 0, errors = 0;
        try {
            const githubBranches = await this.githubAPI.listBranches(repositoryFullName);
            for (const branchData of githubBranches) {
                try {
                    const existingBranch = await this.branchRepo.findByName(branchData.name, repositoryId);
                    if (existingBranch) {
                        // Verificar si necesita actualización (por ejemplo, si el SHA cambió)
                        if (existingBranch.getSha() !== branchData.commit?.sha) {
                            const updatedBranch = GitHubBranch_1.GitHubBranch.fromGitHubAPI(branchData, repositoryId, repositoryFullName);
                            await this.branchRepo.update(updatedBranch);
                            synced++;
                        }
                        else {
                            skipped++;
                        }
                    }
                    else {
                        // Crear nueva rama
                        const newBranch = GitHubBranch_1.GitHubBranch.fromGitHubAPI(branchData, repositoryId, repositoryFullName);
                        await this.branchRepo.create(newBranch);
                        synced++;
                    }
                }
                catch (error) {
                    errors++;
                    console.warn(`Error sincronizando rama ${branchData.name}:`, error);
                }
            }
        }
        catch (error) {
            errors++;
            console.error("Error listando ramas:", error);
        }
        return { synced, skipped, errors };
    }
    async syncPullRequests(repositoryId, repositoryFullName) {
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
                            const updatedPR = GitHubPullRequest_1.GitHubPullRequest.fromGitHubAPI(prData, repositoryId);
                            await this.pullRequestRepo.update(updatedPR);
                            synced++;
                        }
                        else {
                            skipped++;
                        }
                    }
                    else {
                        // Crear nuevo PR
                        const newPR = GitHubPullRequest_1.GitHubPullRequest.fromGitHubAPI(prData, repositoryId);
                        await this.pullRequestRepo.create(newPR);
                        synced++;
                    }
                }
                catch (error) {
                    errors++;
                    console.warn(`Error sincronizando PR #${prData.number}:`, error);
                }
            }
        }
        catch (error) {
            errors++;
            console.error("Error listando pull requests:", error);
        }
        return { synced, skipped, errors };
    }
    async syncIssues(repositoryId, repositoryFullName) {
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
                            const updatedIssue = GitHubIssue_1.GitHubIssue.fromGitHubAPI(issueData, repositoryId);
                            await this.issueRepo.update(updatedIssue);
                            synced++;
                        }
                        else {
                            skipped++;
                        }
                    }
                    else {
                        // Crear nuevo issue
                        const newIssue = GitHubIssue_1.GitHubIssue.fromGitHubAPI(issueData, repositoryId);
                        await this.issueRepo.create(newIssue);
                        synced++;
                    }
                }
                catch (error) {
                    errors++;
                    console.warn(`Error sincronizando issue #${issueData.number}:`, error);
                }
            }
        }
        catch (error) {
            errors++;
            console.error("Error listando issues:", error);
        }
        return { synced, skipped, errors };
    }
    async syncCommits(repositoryId, repositoryFullName, maxCommits = 100) {
        let synced = 0, skipped = 0, errors = 0;
        try {
            const commits = await this.githubAPI.listCommits(repositoryFullName, undefined, maxCommits);
            for (const commitData of commits) {
                try {
                    const existingCommit = await this.commitRepo.findBySha(commitData.sha, repositoryId);
                    if (existingCommit) {
                        skipped++;
                    }
                    else {
                        // Crear nuevo commit
                        const newCommit = GitHubCommit_1.GitHubCommit.fromGitHubAPI(commitData, repositoryId);
                        await this.commitRepo.create(newCommit);
                        synced++;
                    }
                }
                catch (error) {
                    errors++;
                    console.warn(`Error sincronizando commit ${commitData.sha}:`, error);
                }
            }
        }
        catch (error) {
            errors++;
            console.error("Error listando commits:", error);
        }
        return { synced, skipped, errors };
    }
    async getRepositoryNameFromId(repositoryId) {
        const repository = await this.repositoryRepo.findById(repositoryId);
        if (!repository) {
            throw new Error(`Repositorio con ID ${repositoryId} no encontrado`);
        }
        return repository.getName();
    }
    async getBasicRepository(request) {
        if (request.repositoryId) {
            const existing = await this.repositoryRepo.findById(request.repositoryId);
            if (existing)
                return existing;
        }
        // Crear repositorio básico como fallback
        return GitHubRepository_1.GitHubRepository.create(request.repositoryName || "unknown", request.organization || "unknown", "OTHER");
    }
    determineRepositoryType(name, description) {
        const lowerName = name.toLowerCase();
        const lowerDesc = description?.toLowerCase() || "";
        if (lowerName.includes("frontend") ||
            lowerName.includes("client") ||
            lowerName.includes("ui") ||
            lowerDesc.includes("frontend") ||
            lowerDesc.includes("react") ||
            lowerDesc.includes("angular")) {
            return "FRONTEND";
        }
        if (lowerName.includes("backend") ||
            lowerName.includes("server") ||
            lowerName.includes("api") ||
            lowerDesc.includes("backend") ||
            lowerDesc.includes("server") ||
            lowerDesc.includes("api")) {
            return "BACKEND";
        }
        if (lowerName.includes("shared") ||
            lowerName.includes("common") ||
            lowerName.includes("lib") ||
            lowerDesc.includes("shared") ||
            lowerDesc.includes("library") ||
            lowerDesc.includes("common")) {
            return "SHARED";
        }
        return "OTHER";
    }
    validateRequest(request) {
        if (!request.repositoryId && !request.repositoryName) {
            throw new Error("Debe especificar repositoryId o repositoryName");
        }
        if (request.maxCommits &&
            (request.maxCommits < 1 || request.maxCommits > 1000)) {
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
exports.SyncRepositoryUseCase = SyncRepositoryUseCase;
//# sourceMappingURL=SyncRepositoryUseCase.js.map