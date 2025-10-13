/**
 * GitHub Issue Entity - Domain Layer
 *
 * Representa un Issue de GitHub asociado a una solicitud de cambio
 */
export type IssueState = "OPEN" | "CLOSED";
export type IssueType = "BUG" | "FEATURE" | "ENHANCEMENT" | "QUESTION" | "DOCUMENTATION" | "OTHER";
export interface IssueLabel {
    id: string;
    name: string;
    color: string;
    description?: string;
}
export interface IssueAssignee {
    id: string;
    login: string;
    assignedAt: Date;
}
export interface GitHubIssueData {
    id: string;
    number: number;
    title: string;
    body?: string;
    repositoryId: string;
    repositoryFullName: string;
    issueType: IssueType;
    labels: IssueLabel[];
    state: IssueState;
    locked: boolean;
    changeRequestId?: string;
    authorId: string;
    authorLogin: string;
    assignees: IssueAssignee[];
    htmlUrl: string;
    createdAt: Date;
    updatedAt: Date;
    closedAt?: Date;
    commentsCount: number;
    reactionsCount?: number;
    milestoneTitle?: string;
    milestoneNumber?: number;
}
export declare class GitHubIssue {
    private data;
    constructor(data: GitHubIssueData);
    static create(number: number, title: string, repositoryId: string, repositoryFullName: string, authorId: string, authorLogin: string, issueType?: IssueType, changeRequestId?: string, body?: string): GitHubIssue;
    static createFromChangeRequest(number: number, changeRequestId: string, changeRequestTitle: string, changeRequestDescription: string, repositoryId: string, repositoryFullName: string, authorId: string, authorLogin: string, issueType?: IssueType): GitHubIssue;
    static fromGitHubAPI(apiData: any, repositoryId: string, changeRequestId?: string): GitHubIssue;
    private static determineIssueType;
    private validateData;
    getId(): string;
    getNumber(): number;
    getTitle(): string;
    getBody(): string | undefined;
    getRepositoryId(): string;
    getRepositoryFullName(): string;
    getIssueType(): IssueType;
    getLabels(): IssueLabel[];
    getState(): IssueState;
    isLocked(): boolean;
    getChangeRequestId(): string | undefined;
    getAuthorId(): string;
    getAuthorLogin(): string;
    getAssignees(): IssueAssignee[];
    getHtmlUrl(): string;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    getClosedAt(): Date | undefined;
    getCommentsCount(): number;
    getReactionsCount(): number | undefined;
    isOpen(): boolean;
    isClosed(): boolean;
    isBug(): boolean;
    isFeature(): boolean;
    isDocumentation(): boolean;
    hasAssignees(): boolean;
    isAssignedTo(userId: string): boolean;
    isAuthor(userId: string): boolean;
    hasLabel(labelName: string): boolean;
    isAssociatedWithChangeRequest(): boolean;
    canBeClosed(): boolean;
    canBeReopened(): boolean;
    addLabel(label: IssueLabel): GitHubIssue;
    removeLabel(labelName: string): GitHubIssue;
    assignTo(userId: string, userLogin: string): GitHubIssue;
    unassignFrom(userId: string): GitHubIssue;
    updateTitle(newTitle: string): GitHubIssue;
    updateBody(newBody: string): GitHubIssue;
    close(): GitHubIssue;
    reopen(): GitHubIssue;
    lock(): GitHubIssue;
    unlock(): GitHubIssue;
    updateCommentCount(count: number): GitHubIssue;
    toPlainObject(): GitHubIssueData;
    toJSON(): GitHubIssueData;
}
//# sourceMappingURL=GitHubIssue.d.ts.map