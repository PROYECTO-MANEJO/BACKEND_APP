"use strict";
/**
 * GitHub Commit Entity - Domain Layer
 *
 * Representa un commit de GitHub con información de autor, cambios y verificación
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubCommit = void 0;
class GitHubCommit {
    constructor(data) {
        this.data = data;
        this.validateData();
    }
    static create(sha, message, repositoryId, repositoryFullName, author, committer, parentShas = [], changeRequestId) {
        const { title, body } = GitHubCommit.parseCommitMessage(message);
        const commitData = {
            id: `${repositoryId}/commit/${sha}`,
            sha: sha.trim(),
            shortSha: sha.substring(0, 7),
            repositoryId,
            repositoryFullName,
            message: message.trim(),
            messageTitle: title,
            messageBody: body,
            author,
            committer: committer || author,
            parentShas,
            changeRequestId,
            files: [],
            stats: {
                total: 0,
                additions: 0,
                deletions: 0
            },
            htmlUrl: `https://github.com/${repositoryFullName}/commit/${sha}`,
            verification: {
                verified: false,
                reason: "unverified"
            },
            status: "PENDING",
            createdAt: author.date,
            pullRequestNumbers: []
        };
        return new GitHubCommit(commitData);
    }
    static createFromChangeRequest(sha, changeRequestId, changeRequestTitle, repositoryId, repositoryFullName, author, branchName, parentShas = []) {
        const message = `feat: [CR-${changeRequestId}] ${changeRequestTitle}

Implements changes requested in change request ${changeRequestId}.

Change-Request-Id: ${changeRequestId}`;
        const commit = GitHubCommit.create(sha, message, repositoryId, repositoryFullName, author, undefined, parentShas, changeRequestId);
        if (branchName) {
            return commit.withBranch(branchName);
        }
        return commit;
    }
    static fromGitHubAPI(apiData, repositoryId, changeRequestId) {
        const { title, body } = GitHubCommit.parseCommitMessage(apiData.commit.message);
        const author = {
            name: apiData.commit.author.name,
            email: apiData.commit.author.email,
            date: new Date(apiData.commit.author.date)
        };
        const committer = {
            name: apiData.commit.committer.name,
            email: apiData.commit.committer.email,
            date: new Date(apiData.commit.committer.date)
        };
        const files = apiData.files?.map((file) => ({
            filename: file.filename,
            status: file.status,
            additions: file.additions || 0,
            deletions: file.deletions || 0,
            changes: file.changes || 0,
            patch: file.patch,
            previousFilename: file.previous_filename
        })) || [];
        const stats = apiData.stats ? {
            total: apiData.stats.total,
            additions: apiData.stats.additions,
            deletions: apiData.stats.deletions
        } : {
            total: files.reduce((sum, file) => sum + file.changes, 0),
            additions: files.reduce((sum, file) => sum + file.additions, 0),
            deletions: files.reduce((sum, file) => sum + file.deletions, 0)
        };
        const verification = {
            verified: apiData.commit.verification?.verified || false,
            reason: apiData.commit.verification?.reason || "unverified",
            signature: apiData.commit.verification?.signature
        };
        const parentShas = apiData.parents?.map((parent) => parent.sha) || [];
        const commitData = {
            id: `${repositoryId}/commit/${apiData.sha}`,
            sha: apiData.sha,
            shortSha: apiData.sha.substring(0, 7),
            repositoryId,
            repositoryFullName: apiData.repository?.full_name || "unknown/unknown",
            message: apiData.commit.message,
            messageTitle: title,
            messageBody: body,
            author,
            committer,
            authorUserId: apiData.author?.id?.toString(),
            committerUserId: apiData.committer?.id?.toString(),
            parentShas,
            changeRequestId: changeRequestId || GitHubCommit.extractChangeRequestId(apiData.commit.message),
            files,
            stats,
            htmlUrl: apiData.html_url,
            verification,
            status: GitHubCommit.determineStatus(verification, stats),
            createdAt: author.date,
            pullRequestNumbers: []
        };
        return new GitHubCommit(commitData);
    }
    static parseCommitMessage(message) {
        const lines = message.trim().split('\n');
        const title = lines[0] || '';
        if (lines.length <= 1) {
            return { title };
        }
        // Skip empty line after title (conventional commit format)
        const bodyStartIndex = lines.length > 1 && (lines[1]?.trim() === '' || false) ? 2 : 1;
        const body = lines.slice(bodyStartIndex).join('\n').trim();
        return {
            title,
            body: body || undefined
        };
    }
    static extractChangeRequestId(message) {
        // Buscar patrones como [CR-123], CR-123, Change-Request-Id: 123
        const patterns = [
            /\[CR-(\w+)\]/i,
            /CR-(\w+)/i,
            /Change-Request-Id:\s*(\w+)/i
        ];
        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                return match[1];
            }
        }
        return undefined;
    }
    static determineStatus(verification, stats) {
        if (verification.verified) {
            return "SUCCESS";
        }
        if (stats.total > 1000) { // Commits muy grandes podrían ser problemáticos
            return "PENDING";
        }
        return "PENDING";
    }
    validateData() {
        if (!this.data.sha || this.data.sha.trim().length === 0) {
            throw new Error("El SHA del commit es requerido");
        }
        if (this.data.sha.length < 7) {
            throw new Error("El SHA del commit debe tener al menos 7 caracteres");
        }
        if (!this.data.message || this.data.message.trim().length === 0) {
            throw new Error("El mensaje del commit es requerido");
        }
        if (!this.data.repositoryId || this.data.repositoryId.trim().length === 0) {
            throw new Error("El ID del repositorio es requerido");
        }
        if (!this.data.author.name || !this.data.author.email) {
            throw new Error("La información del autor es requerida");
        }
    }
    // Getters
    getId() {
        return this.data.id;
    }
    getSha() {
        return this.data.sha;
    }
    getShortSha() {
        return this.data.shortSha;
    }
    getRepositoryId() {
        return this.data.repositoryId;
    }
    getRepositoryFullName() {
        return this.data.repositoryFullName;
    }
    getMessage() {
        return this.data.message;
    }
    getMessageTitle() {
        return this.data.messageTitle;
    }
    getMessageBody() {
        return this.data.messageBody;
    }
    getAuthor() {
        return { ...this.data.author };
    }
    getCommitter() {
        return { ...this.data.committer };
    }
    getAuthorUserId() {
        return this.data.authorUserId;
    }
    getCommitterUserId() {
        return this.data.committerUserId;
    }
    getBranchName() {
        return this.data.branchName;
    }
    getParentShas() {
        return [...this.data.parentShas];
    }
    getChangeRequestId() {
        return this.data.changeRequestId;
    }
    getFiles() {
        return [...this.data.files];
    }
    getStats() {
        return { ...this.data.stats };
    }
    getHtmlUrl() {
        return this.data.htmlUrl;
    }
    getVerification() {
        return { ...this.data.verification };
    }
    getStatus() {
        return this.data.status;
    }
    getCreatedAt() {
        return this.data.createdAt;
    }
    getPullRequestNumbers() {
        return [...this.data.pullRequestNumbers];
    }
    // Business Methods
    isVerified() {
        return this.data.verification.verified;
    }
    isMergeCommit() {
        return this.data.parentShas.length > 1;
    }
    isInitialCommit() {
        return this.data.parentShas.length === 0;
    }
    hasFiles() {
        return this.data.files.length > 0;
    }
    isAssociatedWithChangeRequest() {
        return this.data.changeRequestId !== undefined;
    }
    isAuthoredBy(userId) {
        return this.data.authorUserId === userId;
    }
    isCommittedBy(userId) {
        return this.data.committerUserId === userId;
    }
    isInBranch(branchName) {
        return this.data.branchName === branchName;
    }
    hasAdditions() {
        return this.data.stats.additions > 0;
    }
    hasDeletions() {
        return this.data.stats.deletions > 0;
    }
    isLargeCommit() {
        return this.data.stats.total > 500;
    }
    containsFile(filename) {
        return this.data.files.some(file => file.filename === filename);
    }
    touchesFileType(extension) {
        return this.data.files.some(file => file.filename.toLowerCase().endsWith(extension.toLowerCase()));
    }
    isAssociatedWithPullRequest(prNumber) {
        return this.data.pullRequestNumbers.includes(prNumber);
    }
    // Actions
    withBranch(branchName) {
        const updatedData = {
            ...this.data,
            branchName: branchName.trim()
        };
        return new GitHubCommit(updatedData);
    }
    withFiles(files) {
        const stats = {
            total: files.reduce((sum, file) => sum + file.changes, 0),
            additions: files.reduce((sum, file) => sum + file.additions, 0),
            deletions: files.reduce((sum, file) => sum + file.deletions, 0)
        };
        const updatedData = {
            ...this.data,
            files: [...files],
            stats
        };
        return new GitHubCommit(updatedData);
    }
    withVerification(verification) {
        const status = GitHubCommit.determineStatus(verification, this.data.stats);
        const updatedData = {
            ...this.data,
            verification: { ...verification },
            status
        };
        return new GitHubCommit(updatedData);
    }
    associateWithPullRequest(prNumber) {
        if (this.isAssociatedWithPullRequest(prNumber)) {
            return this;
        }
        const updatedData = {
            ...this.data,
            pullRequestNumbers: [...this.data.pullRequestNumbers, prNumber]
        };
        return new GitHubCommit(updatedData);
    }
    updateStatus(status) {
        const updatedData = {
            ...this.data,
            status
        };
        return new GitHubCommit(updatedData);
    }
    addAuthorUser(userId) {
        const updatedData = {
            ...this.data,
            authorUserId: userId
        };
        return new GitHubCommit(updatedData);
    }
    addCommitterUser(userId) {
        const updatedData = {
            ...this.data,
            committerUserId: userId
        };
        return new GitHubCommit(updatedData);
    }
    // Analysis Methods
    getModifiedFiles() {
        return this.data.files.filter(file => file.status === "modified");
    }
    getAddedFiles() {
        return this.data.files.filter(file => file.status === "added");
    }
    getRemovedFiles() {
        return this.data.files.filter(file => file.status === "removed");
    }
    getRenamedFiles() {
        return this.data.files.filter(file => file.status === "renamed");
    }
    getFilesByExtension(extension) {
        return this.data.files.filter(file => file.filename.toLowerCase().endsWith(extension.toLowerCase()));
    }
    getImpactLevel() {
        const totalChanges = this.data.stats.total;
        if (totalChanges > 1000)
            return "HIGH";
        if (totalChanges > 100)
            return "MEDIUM";
        return "LOW";
    }
    // Conventional Commit Analysis
    isConventionalCommit() {
        const conventionalPattern = /^(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?: .+/;
        return conventionalPattern.test(this.data.messageTitle);
    }
    getCommitType() {
        const match = this.data.messageTitle.match(/^(feat|fix|docs|style|refactor|perf|test|chore)/);
        return match ? match[1] : undefined;
    }
    getCommitScope() {
        const match = this.data.messageTitle.match(/^\w+\((.+)\):/);
        return match ? match[1] : undefined;
    }
    isBreakingChange() {
        return this.data.message.includes("BREAKING CHANGE") ||
            this.data.messageTitle.includes("!:");
    }
    // Serialization
    toPlainObject() {
        return { ...this.data };
    }
    toJSON() {
        return this.toPlainObject();
    }
}
exports.GitHubCommit = GitHubCommit;
//# sourceMappingURL=GitHubCommit.js.map