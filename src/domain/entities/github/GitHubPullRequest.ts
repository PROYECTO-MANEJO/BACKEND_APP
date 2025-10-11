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
  
  // Repository information
  repositoryId: string;
  repositoryFullName: string;
  
  // Branch information
  sourceBranch: string;
  targetBranch: string;
  
  // States
  state: PullRequestState;
  status: PullRequestStatus;
  isDraft: boolean;
  mergeable: boolean;
  
  // Change Request association
  changeRequestId?: string;
  
  // Author information
  authorId: string;
  authorLogin: string;
  
  // Review information
  reviewers: PullRequestReviewer[];
  requiredReviewers: number;
  approvalCount: number;
  
  // GitHub URLs
  htmlUrl: string;
  diffUrl: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  mergedAt?: Date;
  
  // Metrics
  additionsCount?: number;
  deletionsCount?: number;
  changedFilesCount?: number;
  commitCount?: number;
  
  // Checks and CI
  checksStatus?: "PENDING" | "SUCCESS" | "FAILURE" | "ERROR";
  ciStatus?: "PENDING" | "SUCCESS" | "FAILURE";
}

export class GitHubPullRequest {
  constructor(private data: GitHubPullRequestData) {
    this.validateData();
  }

  public static create(
    number: number,
    title: string,
    repositoryId: string,
    repositoryFullName: string,
    sourceBranch: string,
    targetBranch: string,
    authorId: string,
    authorLogin: string,
    changeRequestId?: string,
    description?: string,
    isDraft: boolean = false
  ): GitHubPullRequest {
    const pullRequestData: GitHubPullRequestData = {
      id: `${repositoryId}/pr/${number}`,
      number,
      title: title.trim(),
      description: description?.trim(),
      repositoryId,
      repositoryFullName,
      sourceBranch,
      targetBranch,
      state: "OPEN",
      status: isDraft ? "PENDING_REVIEW" : "PENDING_REVIEW",
      isDraft,
      mergeable: true,
      changeRequestId,
      authorId,
      authorLogin,
      reviewers: [],
      requiredReviewers: 1, // Por defecto requiere al menos 1 revisor
      approvalCount: 0,
      htmlUrl: `https://github.com/${repositoryFullName}/pull/${number}`,
      diffUrl: `https://github.com/${repositoryFullName}/pull/${number}.diff`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return new GitHubPullRequest(pullRequestData);
  }

  public static fromGitHubAPI(
    apiData: any,
    repositoryId: string,
    changeRequestId?: string
  ): GitHubPullRequest {
    const reviewers: PullRequestReviewer[] = [];
    
    // Procesar revisores de la API
    if (apiData.requested_reviewers) {
      reviewers.push(...apiData.requested_reviewers.map((reviewer: any) => ({
        id: reviewer.id.toString(),
        login: reviewer.login,
        status: "PENDING" as const
      })));
    }

    const pullRequestData: GitHubPullRequestData = {
      id: `${repositoryId}/pr/${apiData.number}`,
      number: apiData.number,
      title: apiData.title,
      description: apiData.body,
      repositoryId,
      repositoryFullName: apiData.base.repo.full_name,
      sourceBranch: apiData.head.ref,
      targetBranch: apiData.base.ref,
      state: apiData.state.toUpperCase() as PullRequestState,
      status: GitHubPullRequest.determineStatus(apiData),
      isDraft: apiData.draft || false,
      mergeable: apiData.mergeable !== false,
      changeRequestId,
      authorId: apiData.user.id.toString(),
      authorLogin: apiData.user.login,
      reviewers,
      requiredReviewers: 1,
      approvalCount: 0,
      htmlUrl: apiData.html_url,
      diffUrl: apiData.diff_url,
      createdAt: new Date(apiData.created_at),
      updatedAt: new Date(apiData.updated_at),
      closedAt: apiData.closed_at ? new Date(apiData.closed_at) : undefined,
      mergedAt: apiData.merged_at ? new Date(apiData.merged_at) : undefined,
      additionsCount: apiData.additions,
      deletionsCount: apiData.deletions,
      changedFilesCount: apiData.changed_files,
      commitCount: apiData.commits
    };

    return new GitHubPullRequest(pullRequestData);
  }

  private static determineStatus(apiData: any): PullRequestStatus {
    if (apiData.draft) return "PENDING_REVIEW";
    if (apiData.state === "closed") return apiData.merged ? "READY_TO_MERGE" : "REJECTED";
    if (apiData.mergeable === false) return "CHANGES_REQUESTED";
    
    // Aquí se podría implementar lógica más compleja basada en reviews
    return "PENDING_REVIEW";
  }

  private validateData(): void {
    if (!this.data.title || this.data.title.trim().length === 0) {
      throw new Error("El título del Pull Request es requerido");
    }

    if (!this.data.sourceBranch || this.data.sourceBranch.trim().length === 0) {
      throw new Error("La rama de origen es requerida");
    }

    if (!this.data.targetBranch || this.data.targetBranch.trim().length === 0) {
      throw new Error("La rama de destino es requerida");
    }

    if (this.data.sourceBranch === this.data.targetBranch) {
      throw new Error("La rama de origen no puede ser igual a la rama de destino");
    }

    if (!this.data.authorId || this.data.authorId.trim().length === 0) {
      throw new Error("El autor del Pull Request es requerido");
    }

    if (this.data.number <= 0) {
      throw new Error("El número del Pull Request debe ser positivo");
    }
  }

  // Getters
  public getId(): string {
    return this.data.id;
  }

  public getNumber(): number {
    return this.data.number;
  }

  public getTitle(): string {
    return this.data.title;
  }

  public getDescription(): string | undefined {
    return this.data.description;
  }

  public getRepositoryId(): string {
    return this.data.repositoryId;
  }

  public getRepositoryFullName(): string {
    return this.data.repositoryFullName;
  }

  public getSourceBranch(): string {
    return this.data.sourceBranch;
  }

  public getTargetBranch(): string {
    return this.data.targetBranch;
  }

  public getState(): PullRequestState {
    return this.data.state;
  }

  public getStatus(): PullRequestStatus {
    return this.data.status;
  }

  public isDraft(): boolean {
    return this.data.isDraft;
  }

  public isMergeable(): boolean {
    return this.data.mergeable;
  }

  public getChangeRequestId(): string | undefined {
    return this.data.changeRequestId;
  }

  public getAuthorId(): string {
    return this.data.authorId;
  }

  public getAuthorLogin(): string {
    return this.data.authorLogin;
  }

  public getReviewers(): PullRequestReviewer[] {
    return [...this.data.reviewers];
  }

  public getApprovalCount(): number {
    return this.data.approvalCount;
  }

  public getRequiredReviewers(): number {
    return this.data.requiredReviewers;
  }

  public getHtmlUrl(): string {
    return this.data.htmlUrl;
  }

  public getDiffUrl(): string {
    return this.data.diffUrl;
  }

  public getCreatedAt(): Date {
    return this.data.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.data.updatedAt;
  }

  public getClosedAt(): Date | undefined {
    return this.data.closedAt;
  }

  public getMergedAt(): Date | undefined {
    return this.data.mergedAt;
  }

  // Business Methods
  public isOpen(): boolean {
    return this.data.state === "OPEN";
  }

  public isClosed(): boolean {
    return this.data.state === "CLOSED";
  }

  public isMerged(): boolean {
    return this.data.state === "MERGED";
  }

  public hasRequiredApprovals(): boolean {
    return this.data.approvalCount >= this.data.requiredReviewers;
  }

  public needsReview(): boolean {
    return this.data.status === "PENDING_REVIEW" && !this.data.isDraft;
  }

  public hasChangesRequested(): boolean {
    return this.data.status === "CHANGES_REQUESTED";
  }

  public isReadyToMerge(): boolean {
    return this.data.state === "OPEN" && 
           this.data.status === "APPROVED" &&
           this.data.mergeable &&
           this.hasRequiredApprovals() &&
           !this.data.isDraft;
  }

  public canBeReviewed(): boolean {
    return this.data.state === "OPEN" && !this.data.isDraft;
  }

  public isAuthor(userId: string): boolean {
    return this.data.authorId === userId;
  }

  public hasReviewer(reviewerId: string): boolean {
    return this.data.reviewers.some(reviewer => reviewer.id === reviewerId);
  }

  // Actions
  public addReviewer(reviewerId: string, reviewerLogin: string): GitHubPullRequest {
    if (this.hasReviewer(reviewerId)) {
      throw new Error("El revisor ya está asignado a este Pull Request");
    }

    const newReviewer: PullRequestReviewer = {
      id: reviewerId,
      login: reviewerLogin,
      status: "PENDING"
    };

    const updatedData = {
      ...this.data,
      reviewers: [...this.data.reviewers, newReviewer],
      updatedAt: new Date()
    };

    return new GitHubPullRequest(updatedData);
  }

  public removeReviewer(reviewerId: string): GitHubPullRequest {
    const updatedReviewers = this.data.reviewers.filter(r => r.id !== reviewerId);

    const updatedData = {
      ...this.data,
      reviewers: updatedReviewers,
      updatedAt: new Date()
    };

    return new GitHubPullRequest(updatedData);
  }

  public updateReview(
    reviewerId: string, 
    status: "APPROVED" | "CHANGES_REQUESTED" | "DISMISSED",
    comments?: string
  ): GitHubPullRequest {
    const updatedReviewers = this.data.reviewers.map(reviewer => 
      reviewer.id === reviewerId 
        ? { ...reviewer, status, comments, reviewedAt: new Date() }
        : reviewer
    );

    // Recalcular aprobaciones
    const approvalCount = updatedReviewers.filter(r => r.status === "APPROVED").length;
    const hasChangesRequested = updatedReviewers.some(r => r.status === "CHANGES_REQUESTED");

    let newStatus: PullRequestStatus = this.data.status;
    if (hasChangesRequested) {
      newStatus = "CHANGES_REQUESTED";
    } else if (approvalCount >= this.data.requiredReviewers) {
      newStatus = "APPROVED";
    } else {
      newStatus = "PENDING_REVIEW";
    }

    const updatedData = {
      ...this.data,
      reviewers: updatedReviewers,
      approvalCount,
      status: newStatus,
      updatedAt: new Date()
    };

    return new GitHubPullRequest(updatedData);
  }

  public markAsReadyForReview(): GitHubPullRequest {
    const updatedData = {
      ...this.data,
      isDraft: false,
      status: "PENDING_REVIEW" as PullRequestStatus,
      updatedAt: new Date()
    };

    return new GitHubPullRequest(updatedData);
  }

  public close(): GitHubPullRequest {
    const updatedData = {
      ...this.data,
      state: "CLOSED" as PullRequestState,
      status: "REJECTED" as PullRequestStatus,
      closedAt: new Date(),
      updatedAt: new Date()
    };

    return new GitHubPullRequest(updatedData);
  }

  public merge(): GitHubPullRequest {
    if (!this.isReadyToMerge()) {
      throw new Error("El Pull Request no está listo para hacer merge");
    }

    const updatedData = {
      ...this.data,
      state: "MERGED" as PullRequestState,
      status: "READY_TO_MERGE" as PullRequestStatus,
      mergedAt: new Date(),
      updatedAt: new Date()
    };

    return new GitHubPullRequest(updatedData);
  }

  public updateMetrics(
    additionsCount: number,
    deletionsCount: number,
    changedFilesCount: number,
    commitCount: number
  ): GitHubPullRequest {
    const updatedData = {
      ...this.data,
      additionsCount,
      deletionsCount,
      changedFilesCount,
      commitCount,
      updatedAt: new Date()
    };

    return new GitHubPullRequest(updatedData);
  }

  public updateChecksStatus(
    checksStatus: "PENDING" | "SUCCESS" | "FAILURE" | "ERROR",
    ciStatus?: "PENDING" | "SUCCESS" | "FAILURE"
  ): GitHubPullRequest {
    const updatedData = {
      ...this.data,
      checksStatus,
      ciStatus: ciStatus || this.data.ciStatus,
      updatedAt: new Date()
    };

    return new GitHubPullRequest(updatedData);
  }

  // Serialization
  public toPlainObject(): GitHubPullRequestData {
    return { ...this.data };
  }

  public toJSON(): GitHubPullRequestData {
    return this.toPlainObject();
  }
}