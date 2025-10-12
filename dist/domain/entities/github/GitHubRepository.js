"use strict";
/**
 * GitHub Repository Entity - Domain Layer
 *
 * Representa un repositorio de GitHub con sus configuraciones y metadatos
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubRepository = void 0;
class GitHubRepository {
    constructor(data) {
        this.data = data;
        this.validateData();
    }
    static create(name, owner, repositoryType, isPrivate = false, defaultBranch = "main") {
        const repositoryData = {
            id: `${owner}/${name}`,
            name: name.trim(),
            fullName: `${owner}/${name}`.toLowerCase(),
            owner: owner.trim(),
            isPrivate,
            defaultBranch,
            url: `https://github.com/${owner}/${name}`,
            cloneUrl: `https://github.com/${owner}/${name}.git`,
            topics: [],
            repositoryType,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return new GitHubRepository(repositoryData);
    }
    static fromGitHubAPI(apiData, repositoryType) {
        const repositoryData = {
            id: apiData.id?.toString() || `${apiData.owner.login}/${apiData.name}`,
            name: apiData.name,
            fullName: apiData.full_name,
            owner: apiData.owner.login,
            description: apiData.description,
            isPrivate: apiData.private,
            defaultBranch: apiData.default_branch || "main",
            url: apiData.html_url,
            cloneUrl: apiData.clone_url,
            language: apiData.language,
            topics: apiData.topics || [],
            repositoryType,
            isActive: true,
            createdAt: new Date(apiData.created_at),
            updatedAt: new Date(apiData.updated_at),
            starCount: apiData.stargazers_count,
            forkCount: apiData.forks_count,
            issueCount: apiData.open_issues_count
        };
        return new GitHubRepository(repositoryData);
    }
    validateData() {
        if (!this.data.name || this.data.name.trim().length === 0) {
            throw new Error("El nombre del repositorio es requerido");
        }
        if (!this.data.owner || this.data.owner.trim().length === 0) {
            throw new Error("El propietario del repositorio es requerido");
        }
        if (!this.data.defaultBranch || this.data.defaultBranch.trim().length === 0) {
            throw new Error("La rama por defecto es requerida");
        }
        // Validar nombre del repositorio (GitHub naming rules)
        const validNameRegex = /^[a-zA-Z0-9._-]+$/;
        if (!validNameRegex.test(this.data.name)) {
            throw new Error("El nombre del repositorio contiene caracteres inválidos");
        }
    }
    // Getters
    getId() {
        return this.data.id;
    }
    getName() {
        return this.data.name;
    }
    getFullName() {
        return this.data.fullName;
    }
    getOwner() {
        return this.data.owner;
    }
    getDefaultBranch() {
        return this.data.defaultBranch;
    }
    getUrl() {
        return this.data.url;
    }
    getCloneUrl() {
        return this.data.cloneUrl;
    }
    getRepositoryType() {
        return this.data.repositoryType;
    }
    isActive() {
        return this.data.isActive;
    }
    isPrivate() {
        return this.data.isPrivate;
    }
    getTopics() {
        return [...this.data.topics];
    }
    getCreatedAt() {
        return this.data.createdAt;
    }
    getUpdatedAt() {
        return this.data.updatedAt;
    }
    getLastSyncDate() {
        return this.data.lastSyncDate;
    }
    // Business Methods
    needsSync() {
        if (!this.data.lastSyncDate) {
            return true;
        }
        const hoursSinceLastSync = (new Date().getTime() - this.data.lastSyncDate.getTime()) / (1000 * 60 * 60);
        return hoursSinceLastSync > 24; // Sincronizar cada 24 horas
    }
    canCreateBranches() {
        return this.data.isActive && !this.data.isPrivate; // Simplificado
    }
    canCreateIssues() {
        return this.data.isActive;
    }
    canCreatePullRequests() {
        return this.data.isActive;
    }
    // Actions
    updateMetadata(description, language, topics) {
        const updatedData = {
            ...this.data,
            description: description !== undefined ? description : this.data.description,
            language: language !== undefined ? language : this.data.language,
            topics: topics !== undefined ? [...topics] : this.data.topics,
            updatedAt: new Date()
        };
        return new GitHubRepository(updatedData);
    }
    markAsSynced() {
        const updatedData = {
            ...this.data,
            lastSyncDate: new Date(),
            updatedAt: new Date()
        };
        return new GitHubRepository(updatedData);
    }
    updateStatistics(starCount, forkCount, issueCount, pullRequestCount) {
        const updatedData = {
            ...this.data,
            starCount,
            forkCount,
            issueCount,
            pullRequestCount,
            updatedAt: new Date()
        };
        return new GitHubRepository(updatedData);
    }
    deactivate() {
        const updatedData = {
            ...this.data,
            isActive: false,
            updatedAt: new Date()
        };
        return new GitHubRepository(updatedData);
    }
    activate() {
        const updatedData = {
            ...this.data,
            isActive: true,
            updatedAt: new Date()
        };
        return new GitHubRepository(updatedData);
    }
    // Serialization
    toPlainObject() {
        return { ...this.data };
    }
    toJSON() {
        return this.toPlainObject();
    }
}
exports.GitHubRepository = GitHubRepository;
//# sourceMappingURL=GitHubRepository.js.map