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
  
  // Repository information
  repositoryId: string;
  repositoryFullName: string;
  
  // Classification
  issueType: IssueType;
  labels: IssueLabel[];
  
  // States
  state: IssueState;
  locked: boolean;
  
  // Change Request association
  changeRequestId?: string;
  
  // Author information
  authorId: string;
  authorLogin: string;
  
  // Assignment
  assignees: IssueAssignee[];
  
  // GitHub URLs
  htmlUrl: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  
  // Metrics
  commentsCount: number;
  reactionsCount?: number;
  
  // Milestone
  milestoneTitle?: string;
  milestoneNumber?: number;
}

export class GitHubIssue {
  constructor(private data: GitHubIssueData) {
    this.validateData();
  }

  public static create(
    number: number,
    title: string,
    repositoryId: string,
    repositoryFullName: string,
    authorId: string,
    authorLogin: string,
    issueType: IssueType = "OTHER",
    changeRequestId?: string,
    body?: string
  ): GitHubIssue {
    const issueData: GitHubIssueData = {
      id: `${repositoryId}/issue/${number}`,
      number,
      title: title.trim(),
      body: body?.trim(),
      repositoryId,
      repositoryFullName,
      issueType,
      labels: [],
      state: "OPEN",
      locked: false,
      changeRequestId,
      authorId,
      authorLogin,
      assignees: [],
      htmlUrl: `https://github.com/${repositoryFullName}/issues/${number}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      commentsCount: 0
    };

    return new GitHubIssue(issueData);
  }

  public static createFromChangeRequest(
    number: number,
    changeRequestId: string,
    changeRequestTitle: string,
    changeRequestDescription: string,
    repositoryId: string,
    repositoryFullName: string,
    authorId: string,
    authorLogin: string,
    issueType: IssueType = "FEATURE"
  ): GitHubIssue {
    const title = `[CR-${changeRequestId}] ${changeRequestTitle}`;
    const body = `**Solicitud de Cambio:** ${changeRequestId}\n\n${changeRequestDescription}\n\n---\n*Este issue fue creado automáticamente desde una solicitud de cambio.*`;

    return GitHubIssue.create(
      number,
      title,
      repositoryId,
      repositoryFullName,
      authorId,
      authorLogin,
      issueType,
      changeRequestId,
      body
    );
  }

  public static fromGitHubAPI(
    apiData: any,
    repositoryId: string,
    changeRequestId?: string
  ): GitHubIssue {
    const labels: IssueLabel[] = apiData.labels?.map((label: any) => ({
      id: label.id.toString(),
      name: label.name,
      color: label.color,
      description: label.description
    })) || [];

    const assignees: IssueAssignee[] = apiData.assignees?.map((assignee: any) => ({
      id: assignee.id.toString(),
      login: assignee.login,
      assignedAt: new Date() // GitHub API no proporciona esta fecha
    })) || [];

    const issueType = GitHubIssue.determineIssueType(labels);

    const issueData: GitHubIssueData = {
      id: `${repositoryId}/issue/${apiData.number}`,
      number: apiData.number,
      title: apiData.title,
      body: apiData.body,
      repositoryId,
      repositoryFullName: apiData.repository?.full_name || "unknown/unknown",
      issueType,
      labels,
      state: apiData.state.toUpperCase() as IssueState,
      locked: apiData.locked || false,
      changeRequestId,
      authorId: apiData.user.id.toString(),
      authorLogin: apiData.user.login,
      assignees,
      htmlUrl: apiData.html_url,
      createdAt: new Date(apiData.created_at),
      updatedAt: new Date(apiData.updated_at),
      closedAt: apiData.closed_at ? new Date(apiData.closed_at) : undefined,
      commentsCount: apiData.comments || 0,
      reactionsCount: apiData.reactions?.total_count,
      milestoneTitle: apiData.milestone?.title,
      milestoneNumber: apiData.milestone?.number
    };

    return new GitHubIssue(issueData);
  }

  private static determineIssueType(labels: IssueLabel[]): IssueType {
    const labelNames = labels.map(l => l.name.toLowerCase());
    
    if (labelNames.includes("bug") || labelNames.includes("error")) return "BUG";
    if (labelNames.includes("feature") || labelNames.includes("enhancement")) return "FEATURE";
    if (labelNames.includes("documentation") || labelNames.includes("docs")) return "DOCUMENTATION";
    if (labelNames.includes("question") || labelNames.includes("help")) return "QUESTION";
    
    return "OTHER";
  }

  private validateData(): void {
    if (!this.data.title || this.data.title.trim().length === 0) {
      throw new Error("El título del Issue es requerido");
    }

    if (!this.data.authorId || this.data.authorId.trim().length === 0) {
      throw new Error("El autor del Issue es requerido");
    }

    if (!this.data.repositoryId || this.data.repositoryId.trim().length === 0) {
      throw new Error("El ID del repositorio es requerido");
    }

    if (this.data.number <= 0) {
      throw new Error("El número del Issue debe ser positivo");
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

  public getBody(): string | undefined {
    return this.data.body;
  }

  public getRepositoryId(): string {
    return this.data.repositoryId;
  }

  public getRepositoryFullName(): string {
    return this.data.repositoryFullName;
  }

  public getIssueType(): IssueType {
    return this.data.issueType;
  }

  public getLabels(): IssueLabel[] {
    return [...this.data.labels];
  }

  public getState(): IssueState {
    return this.data.state;
  }

  public isLocked(): boolean {
    return this.data.locked;
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

  public getAssignees(): IssueAssignee[] {
    return [...this.data.assignees];
  }

  public getHtmlUrl(): string {
    return this.data.htmlUrl;
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

  public getCommentsCount(): number {
    return this.data.commentsCount;
  }

  public getReactionsCount(): number | undefined {
    return this.data.reactionsCount;
  }

  // Business Methods
  public isOpen(): boolean {
    return this.data.state === "OPEN";
  }

  public isClosed(): boolean {
    return this.data.state === "CLOSED";
  }

  public isBug(): boolean {
    return this.data.issueType === "BUG";
  }

  public isFeature(): boolean {
    return this.data.issueType === "FEATURE";
  }

  public isDocumentation(): boolean {
    return this.data.issueType === "DOCUMENTATION";
  }

  public hasAssignees(): boolean {
    return this.data.assignees.length > 0;
  }

  public isAssignedTo(userId: string): boolean {
    return this.data.assignees.some(assignee => assignee.id === userId);
  }

  public isAuthor(userId: string): boolean {
    return this.data.authorId === userId;
  }

  public hasLabel(labelName: string): boolean {
    return this.data.labels.some(label => 
      label.name.toLowerCase() === labelName.toLowerCase()
    );
  }

  public isAssociatedWithChangeRequest(): boolean {
    return this.data.changeRequestId !== undefined;
  }

  public canBeClosed(): boolean {
    return this.data.state === "OPEN" && !this.data.locked;
  }

  public canBeReopened(): boolean {
    return this.data.state === "CLOSED" && !this.data.locked;
  }

  // Actions
  public addLabel(label: IssueLabel): GitHubIssue {
    if (this.hasLabel(label.name)) {
      throw new Error(`El label '${label.name}' ya existe en este Issue`);
    }

    const updatedData = {
      ...this.data,
      labels: [...this.data.labels, label],
      updatedAt: new Date()
    };

    return new GitHubIssue(updatedData);
  }

  public removeLabel(labelName: string): GitHubIssue {
    const updatedLabels = this.data.labels.filter(
      label => label.name.toLowerCase() !== labelName.toLowerCase()
    );

    const updatedData = {
      ...this.data,
      labels: updatedLabels,
      updatedAt: new Date()
    };

    return new GitHubIssue(updatedData);
  }

  public assignTo(userId: string, userLogin: string): GitHubIssue {
    if (this.isAssignedTo(userId)) {
      throw new Error("El usuario ya está asignado a este Issue");
    }

    const newAssignee: IssueAssignee = {
      id: userId,
      login: userLogin,
      assignedAt: new Date()
    };

    const updatedData = {
      ...this.data,
      assignees: [...this.data.assignees, newAssignee],
      updatedAt: new Date()
    };

    return new GitHubIssue(updatedData);
  }

  public unassignFrom(userId: string): GitHubIssue {
    const updatedAssignees = this.data.assignees.filter(
      assignee => assignee.id !== userId
    );

    const updatedData = {
      ...this.data,
      assignees: updatedAssignees,
      updatedAt: new Date()
    };

    return new GitHubIssue(updatedData);
  }

  public updateTitle(newTitle: string): GitHubIssue {
    if (!newTitle || newTitle.trim().length === 0) {
      throw new Error("El título no puede estar vacío");
    }

    const updatedData = {
      ...this.data,
      title: newTitle.trim(),
      updatedAt: new Date()
    };

    return new GitHubIssue(updatedData);
  }

  public updateBody(newBody: string): GitHubIssue {
    const updatedData = {
      ...this.data,
      body: newBody.trim() || undefined,
      updatedAt: new Date()
    };

    return new GitHubIssue(updatedData);
  }

  public close(): GitHubIssue {
    if (!this.canBeClosed()) {
      throw new Error("El Issue no puede ser cerrado en su estado actual");
    }

    const updatedData = {
      ...this.data,
      state: "CLOSED" as IssueState,
      closedAt: new Date(),
      updatedAt: new Date()
    };

    return new GitHubIssue(updatedData);
  }

  public reopen(): GitHubIssue {
    if (!this.canBeReopened()) {
      throw new Error("El Issue no puede ser reabierto en su estado actual");
    }

    const updatedData = {
      ...this.data,
      state: "OPEN" as IssueState,
      closedAt: undefined,
      updatedAt: new Date()
    };

    return new GitHubIssue(updatedData);
  }

  public lock(): GitHubIssue {
    const updatedData = {
      ...this.data,
      locked: true,
      updatedAt: new Date()
    };

    return new GitHubIssue(updatedData);
  }

  public unlock(): GitHubIssue {
    const updatedData = {
      ...this.data,
      locked: false,
      updatedAt: new Date()
    };

    return new GitHubIssue(updatedData);
  }

  public updateCommentCount(count: number): GitHubIssue {
    const updatedData = {
      ...this.data,
      commentsCount: Math.max(0, count),
      updatedAt: new Date()
    };

    return new GitHubIssue(updatedData);
  }

  // Serialization
  public toPlainObject(): GitHubIssueData {
    return { ...this.data };
  }

  public toJSON(): GitHubIssueData {
    return this.toPlainObject();
  }
}