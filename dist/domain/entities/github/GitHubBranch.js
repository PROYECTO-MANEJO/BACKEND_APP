"use strict";
/**
 * GitHub Branch Entity - Domain Layer
 *
 * Representa una rama de Git en el sistema con su flujo de trabajo (GitFlow)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubBranch = void 0;
class GitHubBranch {
    constructor(data) {
        this.data = data;
        this.validateData();
    }
    static create(name, repositoryId, repositoryFullName, branchType, sha, baseBranch, changeRequestId, createdBy) {
        const branchData = {
            id: `${repositoryId}/${name}`,
            name: name.trim(),
            repositoryId,
            repositoryFullName,
            branchType,
            baseBranch,
            sha,
            protected: branchType === "MAIN" || branchType === "DEVELOP",
            changeRequestId,
            status: "ACTIVE",
            createdBy,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return new GitHubBranch(branchData);
    }
    static createFeatureBranch(repositoryId, repositoryFullName, featureName, sha, changeRequestId, developerId, baseBranch = "develop") {
        const branchName = `feature/${featureName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        return GitHubBranch.create(branchName, repositoryId, repositoryFullName, "FEATURE", sha, baseBranch, changeRequestId, developerId);
    }
    static createHotfixBranch(repositoryId, repositoryFullName, hotfixName, sha, changeRequestId, developerId, baseBranch = "main") {
        const branchName = `hotfix/${hotfixName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        return GitHubBranch.create(branchName, repositoryId, repositoryFullName, "HOTFIX", sha, baseBranch, changeRequestId, developerId);
    }
    static fromGitHubAPI(apiData, repositoryId, repositoryFullName, changeRequestId) {
        const branchType = GitHubBranch.determineBranchType(apiData.name);
        const branchData = {
            id: `${repositoryId}/${apiData.name}`,
            name: apiData.name,
            repositoryId,
            repositoryFullName,
            branchType,
            sha: apiData.commit.sha,
            protected: apiData.protected || false,
            changeRequestId,
            status: "ACTIVE",
            createdAt: new Date(),
            updatedAt: new Date(),
            lastCommitDate: apiData.commit.commit.committer?.date
                ? new Date(apiData.commit.commit.committer.date)
                : undefined
        };
        return new GitHubBranch(branchData);
    }
    static determineBranchType(branchName) {
        const name = branchName.toLowerCase();
        if (name === "main" || name === "master")
            return "MAIN";
        if (name === "develop" || name === "dev")
            return "DEVELOP";
        if (name.startsWith("feature/"))
            return "FEATURE";
        if (name.startsWith("hotfix/"))
            return "HOTFIX";
        if (name.startsWith("bugfix/"))
            return "BUGFIX";
        if (name.startsWith("release/"))
            return "RELEASE";
        return "OTHER";
    }
    validateData() {
        if (!this.data.name || this.data.name.trim().length === 0) {
            throw new Error("El nombre de la rama es requerido");
        }
        if (!this.data.repositoryId || this.data.repositoryId.trim().length === 0) {
            throw new Error("El ID del repositorio es requerido");
        }
        if (!this.data.sha || this.data.sha.trim().length === 0) {
            throw new Error("El SHA del commit es requerido");
        }
        // Validar nombres de rama según convenciones Git
        const validBranchRegex = /^[a-zA-Z0-9._/-]+$/;
        if (!validBranchRegex.test(this.data.name)) {
            throw new Error("El nombre de la rama contiene caracteres inválidos");
        }
        // No permitir nombres de rama reservados
        const reservedNames = ["HEAD", "refs", "origin"];
        if (reservedNames.some(reserved => this.data.name.includes(reserved))) {
            throw new Error("El nombre de la rama usa palabras reservadas");
        }
    }
    // Getters
    getId() {
        return this.data.id;
    }
    getName() {
        return this.data.name;
    }
    getRepositoryId() {
        return this.data.repositoryId;
    }
    getRepositoryFullName() {
        return this.data.repositoryFullName;
    }
    getBranchType() {
        return this.data.branchType;
    }
    getBaseBranch() {
        return this.data.baseBranch;
    }
    getTargetBranch() {
        return this.data.targetBranch;
    }
    getSha() {
        return this.data.sha;
    }
    isProtected() {
        return this.data.protected;
    }
    getChangeRequestId() {
        return this.data.changeRequestId;
    }
    getStatus() {
        return this.data.status;
    }
    getCreatedBy() {
        return this.data.createdBy;
    }
    getAssignedTo() {
        return this.data.assignedTo;
    }
    getCreatedAt() {
        return this.data.createdAt;
    }
    getUpdatedAt() {
        return this.data.updatedAt;
    }
    getLastCommitDate() {
        return this.data.lastCommitDate;
    }
    getMergedAt() {
        return this.data.mergedAt;
    }
    getCommitCount() {
        return this.data.commitCount;
    }
    // Business Methods
    isMainBranch() {
        return this.data.branchType === "MAIN";
    }
    isDevelopBranch() {
        return this.data.branchType === "DEVELOP";
    }
    isFeatureBranch() {
        return this.data.branchType === "FEATURE";
    }
    isHotfixBranch() {
        return this.data.branchType === "HOTFIX";
    }
    canBeDeleted() {
        return !this.data.protected &&
            this.data.status === "MERGED" &&
            this.data.branchType !== "MAIN" &&
            this.data.branchType !== "DEVELOP";
    }
    canBeMerged() {
        return this.data.status === "ACTIVE" &&
            !this.data.protected &&
            this.data.branchType !== "MAIN";
    }
    isStale() {
        if (!this.data.lastCommitDate) {
            return false;
        }
        const daysSinceLastCommit = (new Date().getTime() - this.data.lastCommitDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceLastCommit > 30; // Rama obsoleta después de 30 días sin commits
    }
    needsSync() {
        return this.data.behindBy !== undefined && this.data.behindBy > 0;
    }
    // Actions
    updateSha(newSha) {
        const updatedData = {
            ...this.data,
            sha: newSha,
            updatedAt: new Date(),
            lastCommitDate: new Date()
        };
        return new GitHubBranch(updatedData);
    }
    assignTo(developerId) {
        const updatedData = {
            ...this.data,
            assignedTo: developerId,
            updatedAt: new Date()
        };
        return new GitHubBranch(updatedData);
    }
    updateMetrics(commitCount, behindBy, aheadBy) {
        const updatedData = {
            ...this.data,
            commitCount,
            behindBy,
            aheadBy,
            updatedAt: new Date()
        };
        return new GitHubBranch(updatedData);
    }
    markAsMerged(targetBranch) {
        const updatedData = {
            ...this.data,
            status: "MERGED",
            targetBranch: targetBranch || this.data.targetBranch,
            mergedAt: new Date(),
            updatedAt: new Date()
        };
        return new GitHubBranch(updatedData);
    }
    markAsDeleted() {
        const updatedData = {
            ...this.data,
            status: "DELETED",
            updatedAt: new Date()
        };
        return new GitHubBranch(updatedData);
    }
    markAsStale() {
        const updatedData = {
            ...this.data,
            status: "STALE",
            updatedAt: new Date()
        };
        return new GitHubBranch(updatedData);
    }
    updateDescription(description, purpose) {
        const updatedData = {
            ...this.data,
            description: description.trim(),
            purpose: purpose?.trim(),
            updatedAt: new Date()
        };
        return new GitHubBranch(updatedData);
    }
    // Serialization
    toPlainObject() {
        return { ...this.data };
    }
    toJSON() {
        return this.toPlainObject();
    }
}
exports.GitHubBranch = GitHubBranch;
//# sourceMappingURL=GitHubBranch.js.map