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
  
  // Repository information
  repositoryId: string;
  repositoryFullName: string;
  
  // Commit message
  message: string;
  messageTitle: string;
  messageBody?: string;
  
  // Author and Committer information
  author: CommitAuthor;
  committer: CommitCommitter;
  
  // GitHub user associations
  authorUserId?: string;
  committerUserId?: string;
  
  // Branch information
  branchName?: string;
  
  // Parent commits
  parentShas: string[];
  
  // Change tracking
  changeRequestId?: string;
  
  // File changes
  files: FileChange[];
  stats: CommitStats;
  
  // GitHub URLs
  htmlUrl: string;
  
  // Verification
  verification: CommitVerification;
  
  // Status checks
  status: CommitStatus;
  
  // Timestamps
  createdAt: Date;
  
  // Pull Request association
  pullRequestNumbers: number[];
}

export class GitHubCommit {
  constructor(private data: GitHubCommitData) {
    this.validateData();
  }

  public static create(
    sha: string,
    message: string,
    repositoryId: string,
    repositoryFullName: string,
    author: CommitAuthor,
    committer?: CommitCommitter,
    parentShas: string[] = [],
    changeRequestId?: string
  ): GitHubCommit {
    const { title, body } = GitHubCommit.parseCommitMessage(message);
    
    const commitData: GitHubCommitData = {
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

  public static createFromChangeRequest(
    sha: string,
    changeRequestId: string,
    changeRequestTitle: string,
    repositoryId: string,
    repositoryFullName: string,
    author: CommitAuthor,
    branchName?: string,
    parentShas: string[] = []
  ): GitHubCommit {
    const message = `feat: [CR-${changeRequestId}] ${changeRequestTitle}

Implements changes requested in change request ${changeRequestId}.

Change-Request-Id: ${changeRequestId}`;

    const commit = GitHubCommit.create(
      sha,
      message,
      repositoryId,
      repositoryFullName,
      author,
      undefined,
      parentShas,
      changeRequestId
    );

    if (branchName) {
      return commit.withBranch(branchName);
    }

    return commit;
  }

  public static fromGitHubAPI(
    apiData: any,
    repositoryId: string,
    changeRequestId?: string
  ): GitHubCommit {
    const { title, body } = GitHubCommit.parseCommitMessage(apiData.commit.message);
    
    const author: CommitAuthor = {
      name: apiData.commit.author.name,
      email: apiData.commit.author.email,
      date: new Date(apiData.commit.author.date)
    };

    const committer: CommitCommitter = {
      name: apiData.commit.committer.name,
      email: apiData.commit.committer.email,
      date: new Date(apiData.commit.committer.date)
    };

    const files: FileChange[] = apiData.files?.map((file: any) => ({
      filename: file.filename,
      status: file.status,
      additions: file.additions || 0,
      deletions: file.deletions || 0,
      changes: file.changes || 0,
      patch: file.patch,
      previousFilename: file.previous_filename
    })) || [];

    const stats: CommitStats = apiData.stats ? {
      total: apiData.stats.total,
      additions: apiData.stats.additions,
      deletions: apiData.stats.deletions
    } : {
      total: files.reduce((sum, file) => sum + file.changes, 0),
      additions: files.reduce((sum, file) => sum + file.additions, 0),
      deletions: files.reduce((sum, file) => sum + file.deletions, 0)
    };

    const verification: CommitVerification = {
      verified: apiData.commit.verification?.verified || false,
      reason: apiData.commit.verification?.reason || "unverified",
      signature: apiData.commit.verification?.signature
    };

    const parentShas = apiData.parents?.map((parent: any) => parent.sha) || [];

    const commitData: GitHubCommitData = {
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

  private static parseCommitMessage(message: string): { title: string; body?: string } {
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

  private static extractChangeRequestId(message: string): string | undefined {
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

  private static determineStatus(verification: CommitVerification, stats: CommitStats): CommitStatus {
    if (verification.verified) {
      return "SUCCESS";
    }
    
    if (stats.total > 1000) { // Commits muy grandes podrían ser problemáticos
      return "PENDING";
    }

    return "PENDING";
  }

  private validateData(): void {
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
  public getId(): string {
    return this.data.id;
  }

  public getSha(): string {
    return this.data.sha;
  }

  public getShortSha(): string {
    return this.data.shortSha;
  }

  public getRepositoryId(): string {
    return this.data.repositoryId;
  }

  public getRepositoryFullName(): string {
    return this.data.repositoryFullName;
  }

  public getMessage(): string {
    return this.data.message;
  }

  public getMessageTitle(): string {
    return this.data.messageTitle;
  }

  public getMessageBody(): string | undefined {
    return this.data.messageBody;
  }

  public getAuthor(): CommitAuthor {
    return { ...this.data.author };
  }

  public getCommitter(): CommitCommitter {
    return { ...this.data.committer };
  }

  public getAuthorUserId(): string | undefined {
    return this.data.authorUserId;
  }

  public getCommitterUserId(): string | undefined {
    return this.data.committerUserId;
  }

  public getBranchName(): string | undefined {
    return this.data.branchName;
  }

  public getParentShas(): string[] {
    return [...this.data.parentShas];
  }

  public getChangeRequestId(): string | undefined {
    return this.data.changeRequestId;
  }

  public getFiles(): FileChange[] {
    return [...this.data.files];
  }

  public getStats(): CommitStats {
    return { ...this.data.stats };
  }

  public getHtmlUrl(): string {
    return this.data.htmlUrl;
  }

  public getVerification(): CommitVerification {
    return { ...this.data.verification };
  }

  public getStatus(): CommitStatus {
    return this.data.status;
  }

  public getCreatedAt(): Date {
    return this.data.createdAt;
  }

  public getPullRequestNumbers(): number[] {
    return [...this.data.pullRequestNumbers];
  }

  // Business Methods
  public isVerified(): boolean {
    return this.data.verification.verified;
  }

  public isMergeCommit(): boolean {
    return this.data.parentShas.length > 1;
  }

  public isInitialCommit(): boolean {
    return this.data.parentShas.length === 0;
  }

  public hasFiles(): boolean {
    return this.data.files.length > 0;
  }

  public isAssociatedWithChangeRequest(): boolean {
    return this.data.changeRequestId !== undefined;
  }

  public isAuthoredBy(userId: string): boolean {
    return this.data.authorUserId === userId;
  }

  public isCommittedBy(userId: string): boolean {
    return this.data.committerUserId === userId;
  }

  public isInBranch(branchName: string): boolean {
    return this.data.branchName === branchName;
  }

  public hasAdditions(): boolean {
    return this.data.stats.additions > 0;
  }

  public hasDeletions(): boolean {
    return this.data.stats.deletions > 0;
  }

  public isLargeCommit(): boolean {
    return this.data.stats.total > 500;
  }

  public containsFile(filename: string): boolean {
    return this.data.files.some(file => file.filename === filename);
  }

  public touchesFileType(extension: string): boolean {
    return this.data.files.some(file => 
      file.filename.toLowerCase().endsWith(extension.toLowerCase())
    );
  }

  public isAssociatedWithPullRequest(prNumber: number): boolean {
    return this.data.pullRequestNumbers.includes(prNumber);
  }

  // Actions
  public withBranch(branchName: string): GitHubCommit {
    const updatedData = {
      ...this.data,
      branchName: branchName.trim()
    };

    return new GitHubCommit(updatedData);
  }

  public withFiles(files: FileChange[]): GitHubCommit {
    const stats: CommitStats = {
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

  public withVerification(verification: CommitVerification): GitHubCommit {
    const status = GitHubCommit.determineStatus(verification, this.data.stats);

    const updatedData = {
      ...this.data,
      verification: { ...verification },
      status
    };

    return new GitHubCommit(updatedData);
  }

  public associateWithPullRequest(prNumber: number): GitHubCommit {
    if (this.isAssociatedWithPullRequest(prNumber)) {
      return this;
    }

    const updatedData = {
      ...this.data,
      pullRequestNumbers: [...this.data.pullRequestNumbers, prNumber]
    };

    return new GitHubCommit(updatedData);
  }

  public updateStatus(status: CommitStatus): GitHubCommit {
    const updatedData = {
      ...this.data,
      status
    };

    return new GitHubCommit(updatedData);
  }

  public addAuthorUser(userId: string): GitHubCommit {
    const updatedData = {
      ...this.data,
      authorUserId: userId
    };

    return new GitHubCommit(updatedData);
  }

  public addCommitterUser(userId: string): GitHubCommit {
    const updatedData = {
      ...this.data,
      committerUserId: userId
    };

    return new GitHubCommit(updatedData);
  }

  // Analysis Methods
  public getModifiedFiles(): FileChange[] {
    return this.data.files.filter(file => file.status === "modified");
  }

  public getAddedFiles(): FileChange[] {
    return this.data.files.filter(file => file.status === "added");
  }

  public getRemovedFiles(): FileChange[] {
    return this.data.files.filter(file => file.status === "removed");
  }

  public getRenamedFiles(): FileChange[] {
    return this.data.files.filter(file => file.status === "renamed");
  }

  public getFilesByExtension(extension: string): FileChange[] {
    return this.data.files.filter(file => 
      file.filename.toLowerCase().endsWith(extension.toLowerCase())
    );
  }

  public getImpactLevel(): "LOW" | "MEDIUM" | "HIGH" {
    const totalChanges = this.data.stats.total;
    
    if (totalChanges > 1000) return "HIGH";
    if (totalChanges > 100) return "MEDIUM";
    return "LOW";
  }

  // Conventional Commit Analysis
  public isConventionalCommit(): boolean {
    const conventionalPattern = /^(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?: .+/;
    return conventionalPattern.test(this.data.messageTitle);
  }

  public getCommitType(): string | undefined {
    const match = this.data.messageTitle.match(/^(feat|fix|docs|style|refactor|perf|test|chore)/);
    return match ? match[1] : undefined;
  }

  public getCommitScope(): string | undefined {
    const match = this.data.messageTitle.match(/^\w+\((.+)\):/);
    return match ? match[1] : undefined;
  }

  public isBreakingChange(): boolean {
    return this.data.message.includes("BREAKING CHANGE") || 
           this.data.messageTitle.includes("!:");
  }

  // Serialization
  public toPlainObject(): GitHubCommitData {
    return { ...this.data };
  }

  public toJSON(): GitHubCommitData {
    return this.toPlainObject();
  }
}