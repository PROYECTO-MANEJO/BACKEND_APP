/**
 * GitHub Pull Request Entity - Domain Layer
 *
 * Representa un Pull Request en GitHub asociado a una solicitud de cambio
 */
export type PullRequestState = "OPEN" | "CLOSED" | "MERGED" | "DRAFT";
export type PullRequestStatus = "PENDING_REVIEW" | "CHANGES_REQUESTED" | "APPROVED" | "REJECTED" | "READY_TO_MERGE";
export interface PullRequestReviewer {
    id: string;
    login: string;
    status: "PENDING" | "APPROVED" | "CHANGES_REQUESTED" | "DISMISSED";
    reviewedAt?: Date;
    comments?: string;
}
export interface GitHubPullRequestData {
    id: string;
    number: number;
    title: string;
    description?: string;
    repositoryId: string;
    repositoryFullName: string;
    sourceBranch: string;
    targetBranch: string;
    state: PullRequestState;
    status: PullRequestStatus;
    isDraft: boolean;
    mergeable: boolean;
    changeRequestId?: string;
    authorId: string;
    authorLogin: string;
    reviewers: PullRequestReviewer[];
    requiredReviewers: number;
    approvalCount: number;
    htmlUrl: string;
    diffUrl: string;
    createdAt: Date;
    updatedAt: Date;
    closedAt?: Date;
    mergedAt?: Date;
    additionsCount?: number;
    deletionsCount?: number;
    changedFilesCount?: number;
    commitCount?: number;
    checksStatus?: "PENDING" | "SUCCESS" | "FAILURE" | "ERROR";
    ciStatus?: "PENDING" | "SUCCESS" | "FAILURE";
}
export declare class GitHubPullRequest {
    private data;
    constructor(data: GitHubPullRequestData);
    static create(number: number, title: string, repositoryId: string, repositoryFullName: string, sourceBranch: string, targetBranch: string, authorId: string, authorLogin: string, changeRequestId?: string, description?: string, isDraft?: boolean): GitHubPullRequest;
    static fromGitHubAPI(apiData: any, repositoryId: string, changeRequestId?: string): GitHubPullRequest;
    private static determineStatus;
    private validateData;
    getId(): string;
    getNumber(): number;
    getTitle(): string;
    getDescription(): string | undefined;
    getRepositoryId(): string;
    getRepositoryFullName(): string;
    getSourceBranch(): string;
    getTargetBranch(): string;
    getState(): PullRequestState;
    getStatus(): PullRequestStatus;
    isDraft(): boolean;
    isMergeable(): boolean;
    getChangeRequestId(): string | undefined;
    getAuthorId(): string;
    getAuthorLogin(): string;
    getReviewers(): PullRequestReviewer[];
    getApprovalCount(): number;
    getRequiredReviewers(): number;
    getHtmlUrl(): string;
    getDiffUrl(): string;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    getClosedAt(): Date | undefined;
    getMergedAt(): Date | undefined;
    isOpen(): boolean;
    isClosed(): boolean;
    isMerged(): boolean;
    hasRequiredApprovals(): boolean;
    needsReview(): boolean;
    hasChangesRequested(): boolean;
    isReadyToMerge(): boolean;
    canBeReviewed(): boolean;
    isAuthor(userId: string): boolean;
    hasReviewer(reviewerId: string): boolean;
    addReviewer(reviewerId: string, reviewerLogin: string): GitHubPullRequest;
    removeReviewer(reviewerId: string): GitHubPullRequest;
    updateReview(reviewerId: string, status: "APPROVED" | "CHANGES_REQUESTED" | "DISMISSED", comments?: string): GitHubPullRequest;
    markAsReadyForReview(): GitHubPullRequest;
    close(): GitHubPullRequest;
    merge(): GitHubPullRequest;
    updateMetrics(additionsCount: number, deletionsCount: number, changedFilesCount: number, commitCount: number): GitHubPullRequest;
    updateChecksStatus(checksStatus: "PENDING" | "SUCCESS" | "FAILURE" | "ERROR", ciStatus?: "PENDING" | "SUCCESS" | "FAILURE"): GitHubPullRequest;
    toPlainObject(): GitHubPullRequestData;
    toJSON(): GitHubPullRequestData;
}
//# sourceMappingURL=GitHubPullRequest.d.ts.map