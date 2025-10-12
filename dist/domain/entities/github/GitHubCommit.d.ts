/**
 * GitHub Commit Entity - Domain Layer
 *
 * Representa un commit de GitHub con información de autor, cambios y verificación
 */
export type CommitStatus = "PENDING" | "SUCCESS" | "FAILURE" | "ERROR";
export interface CommitAuthor {
    name: string;
    email: string;
    date: Date;
}
export interface CommitCommitter {
    name: string;
    email: string;
    date: Date;
}
export interface FileChange {
    filename: string;
    status: "added" | "removed" | "modified" | "renamed";
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
    previousFilename?: string;
}
export interface CommitVerification {
    verified: boolean;
    reason: string;
    signature?: string;
}
export interface CommitStats {
    total: number;
    additions: number;
    deletions: number;
}
export interface GitHubCommitData {
    id: string;
    sha: string;
    shortSha: string;
    repositoryId: string;
    repositoryFullName: string;
    message: string;
    messageTitle: string;
    messageBody?: string;
    author: CommitAuthor;
    committer: CommitCommitter;
    authorUserId?: string;
    committerUserId?: string;
    branchName?: string;
    parentShas: string[];
    changeRequestId?: string;
    files: FileChange[];
    stats: CommitStats;
    htmlUrl: string;
    verification: CommitVerification;
    status: CommitStatus;
    createdAt: Date;
    pullRequestNumbers: number[];
}
export declare class GitHubCommit {
    private data;
    constructor(data: GitHubCommitData);
    static create(sha: string, message: string, repositoryId: string, repositoryFullName: string, author: CommitAuthor, committer?: CommitCommitter, parentShas?: string[], changeRequestId?: string): GitHubCommit;
    static createFromChangeRequest(sha: string, changeRequestId: string, changeRequestTitle: string, repositoryId: string, repositoryFullName: string, author: CommitAuthor, branchName?: string, parentShas?: string[]): GitHubCommit;
    static fromGitHubAPI(apiData: any, repositoryId: string, changeRequestId?: string): GitHubCommit;
    private static parseCommitMessage;
    private static extractChangeRequestId;
    private static determineStatus;
    private validateData;
    getId(): string;
    getSha(): string;
    getShortSha(): string;
    getRepositoryId(): string;
    getRepositoryFullName(): string;
    getMessage(): string;
    getMessageTitle(): string;
    getMessageBody(): string | undefined;
    getAuthor(): CommitAuthor;
    getCommitter(): CommitCommitter;
    getAuthorUserId(): string | undefined;
    getCommitterUserId(): string | undefined;
    getBranchName(): string | undefined;
    getParentShas(): string[];
    getChangeRequestId(): string | undefined;
    getFiles(): FileChange[];
    getStats(): CommitStats;
    getHtmlUrl(): string;
    getVerification(): CommitVerification;
    getStatus(): CommitStatus;
    getCreatedAt(): Date;
    getPullRequestNumbers(): number[];
    isVerified(): boolean;
    isMergeCommit(): boolean;
    isInitialCommit(): boolean;
    hasFiles(): boolean;
    isAssociatedWithChangeRequest(): boolean;
    isAuthoredBy(userId: string): boolean;
    isCommittedBy(userId: string): boolean;
    isInBranch(branchName: string): boolean;
    hasAdditions(): boolean;
    hasDeletions(): boolean;
    isLargeCommit(): boolean;
    containsFile(filename: string): boolean;
    touchesFileType(extension: string): boolean;
    isAssociatedWithPullRequest(prNumber: number): boolean;
    withBranch(branchName: string): GitHubCommit;
    withFiles(files: FileChange[]): GitHubCommit;
    withVerification(verification: CommitVerification): GitHubCommit;
    associateWithPullRequest(prNumber: number): GitHubCommit;
    updateStatus(status: CommitStatus): GitHubCommit;
    addAuthorUser(userId: string): GitHubCommit;
    addCommitterUser(userId: string): GitHubCommit;
    getModifiedFiles(): FileChange[];
    getAddedFiles(): FileChange[];
    getRemovedFiles(): FileChange[];
    getRenamedFiles(): FileChange[];
    getFilesByExtension(extension: string): FileChange[];
    getImpactLevel(): "LOW" | "MEDIUM" | "HIGH";
    isConventionalCommit(): boolean;
    getCommitType(): string | undefined;
    getCommitScope(): string | undefined;
    isBreakingChange(): boolean;
    toPlainObject(): GitHubCommitData;
    toJSON(): GitHubCommitData;
}
//# sourceMappingURL=GitHubCommit.d.ts.map