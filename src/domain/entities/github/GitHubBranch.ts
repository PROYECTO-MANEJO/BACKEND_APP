/**
 * GitHub Branch Entity - Domain Layer
 *
 * Representa una rama de Git en el sistema con su flujo de trabajo (GitFlow)
 */

export type BranchType = "MAIN" | "DEVELOP" | "FEATURE" | "HOTFIX" | "BUGFIX" | "RELEASE" | "OTHER";

export type BranchStatus = "ACTIVE" | "MERGED" | "DELETED" | "STALE" | "PROTECTED";

export interface GitHubBranchData {
  id: string;
  name: string;
  repositoryId: string;
  repositoryFullName: string;
  
  // GitFlow information
  branchType: BranchType;
  baseBranch?: string;
  targetBranch?: string;
  
  // Git information
  sha: string;
  protected: boolean;
  
  // Change Request association
  changeRequestId?: string;
  
  // Business information
  purpose?: string;
  description?: string;
  status: BranchStatus;
  
  // Developer information
  createdBy?: string;
  assignedTo?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastCommitDate?: Date;
  mergedAt?: Date;
  
  // Metrics
  commitCount?: number;
  behindBy?: number;
  aheadBy?: number;
}

export class GitHubBranch {
  constructor(private data: GitHubBranchData) {
    this.validateData();
  }

  public static create(
    name: string,
    repositoryId: string,
    repositoryFullName: string,
    branchType: BranchType,
    sha: string,
    baseBranch?: string,
    changeRequestId?: string,
    createdBy?: string
  ): GitHubBranch {
    const branchData: GitHubBranchData = {
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

  public static createFeatureBranch(
    repositoryId: string,
    repositoryFullName: string,
    featureName: string,
    sha: string,
    changeRequestId: string,
    developerId: string,
    baseBranch: string = "develop"
  ): GitHubBranch {
    const branchName = `feature/${featureName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    return GitHubBranch.create(
      branchName,
      repositoryId,
      repositoryFullName,
      "FEATURE",
      sha,
      baseBranch,
      changeRequestId,
      developerId
    );
  }

  public static createHotfixBranch(
    repositoryId: string,
    repositoryFullName: string,
    hotfixName: string,
    sha: string,
    changeRequestId: string,
    developerId: string,
    baseBranch: string = "main"
  ): GitHubBranch {
    const branchName = `hotfix/${hotfixName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    return GitHubBranch.create(
      branchName,
      repositoryId,
      repositoryFullName,
      "HOTFIX",
      sha,
      baseBranch,
      changeRequestId,
      developerId
    );
  }

  public static fromGitHubAPI(
    apiData: any,
    repositoryId: string,
    repositoryFullName: string,
    changeRequestId?: string
  ): GitHubBranch {
    const branchType = GitHubBranch.determineBranchType(apiData.name);
    
    const branchData: GitHubBranchData = {
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

  private static determineBranchType(branchName: string): BranchType {
    const name = branchName.toLowerCase();
    
    if (name === "main" || name === "master") return "MAIN";
    if (name === "develop" || name === "dev") return "DEVELOP";
    if (name.startsWith("feature/")) return "FEATURE";
    if (name.startsWith("hotfix/")) return "HOTFIX";
    if (name.startsWith("bugfix/")) return "BUGFIX";
    if (name.startsWith("release/")) return "RELEASE";
    
    return "OTHER";
  }

  private validateData(): void {
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
  public getId(): string {
    return this.data.id;
  }

  public getName(): string {
    return this.data.name;
  }

  public getRepositoryId(): string {
    return this.data.repositoryId;
  }

  public getRepositoryFullName(): string {
    return this.data.repositoryFullName;
  }

  public getBranchType(): BranchType {
    return this.data.branchType;
  }

  public getBaseBranch(): string | undefined {
    return this.data.baseBranch;
  }

  public getTargetBranch(): string | undefined {
    return this.data.targetBranch;
  }

  public getSha(): string {
    return this.data.sha;
  }

  public isProtected(): boolean {
    return this.data.protected;
  }

  public getChangeRequestId(): string | undefined {
    return this.data.changeRequestId;
  }

  public getStatus(): BranchStatus {
    return this.data.status;
  }

  public getCreatedBy(): string | undefined {
    return this.data.createdBy;
  }

  public getAssignedTo(): string | undefined {
    return this.data.assignedTo;
  }

  public getCreatedAt(): Date {
    return this.data.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.data.updatedAt;
  }

  public getLastCommitDate(): Date | undefined {
    return this.data.lastCommitDate;
  }

  public getMergedAt(): Date | undefined {
    return this.data.mergedAt;
  }

  public getCommitCount(): number | undefined {
    return this.data.commitCount;
  }

  // Business Methods
  public isMainBranch(): boolean {
    return this.data.branchType === "MAIN";
  }

  public isDevelopBranch(): boolean {
    return this.data.branchType === "DEVELOP";
  }

  public isFeatureBranch(): boolean {
    return this.data.branchType === "FEATURE";
  }

  public isHotfixBranch(): boolean {
    return this.data.branchType === "HOTFIX";
  }

  public canBeDeleted(): boolean {
    return !this.data.protected && 
           this.data.status === "MERGED" &&
           this.data.branchType !== "MAIN" &&
           this.data.branchType !== "DEVELOP";
  }

  public canBeMerged(): boolean {
    return this.data.status === "ACTIVE" && 
           !this.data.protected &&
           this.data.branchType !== "MAIN";
  }

  public isStale(): boolean {
    if (!this.data.lastCommitDate) {
      return false;
    }

    const daysSinceLastCommit = (new Date().getTime() - this.data.lastCommitDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastCommit > 30; // Rama obsoleta después de 30 días sin commits
  }

  public needsSync(): boolean {
    return this.data.behindBy !== undefined && this.data.behindBy > 0;
  }

  // Actions
  public updateSha(newSha: string): GitHubBranch {
    const updatedData = {
      ...this.data,
      sha: newSha,
      updatedAt: new Date(),
      lastCommitDate: new Date()
    };

    return new GitHubBranch(updatedData);
  }

  public assignTo(developerId: string): GitHubBranch {
    const updatedData = {
      ...this.data,
      assignedTo: developerId,
      updatedAt: new Date()
    };

    return new GitHubBranch(updatedData);
  }

  public updateMetrics(commitCount: number, behindBy: number, aheadBy: number): GitHubBranch {
    const updatedData = {
      ...this.data,
      commitCount,
      behindBy,
      aheadBy,
      updatedAt: new Date()
    };

    return new GitHubBranch(updatedData);
  }

  public markAsMerged(targetBranch?: string): GitHubBranch {
    const updatedData = {
      ...this.data,
      status: "MERGED" as BranchStatus,
      targetBranch: targetBranch || this.data.targetBranch,
      mergedAt: new Date(),
      updatedAt: new Date()
    };

    return new GitHubBranch(updatedData);
  }

  public markAsDeleted(): GitHubBranch {
    const updatedData = {
      ...this.data,
      status: "DELETED" as BranchStatus,
      updatedAt: new Date()
    };

    return new GitHubBranch(updatedData);
  }

  public markAsStale(): GitHubBranch {
    const updatedData = {
      ...this.data,
      status: "STALE" as BranchStatus,
      updatedAt: new Date()
    };

    return new GitHubBranch(updatedData);
  }

  public updateDescription(description: string, purpose?: string): GitHubBranch {
    const updatedData = {
      ...this.data,
      description: description.trim(),
      purpose: purpose?.trim(),
      updatedAt: new Date()
    };

    return new GitHubBranch(updatedData);
  }

  // Serialization
  public toPlainObject(): GitHubBranchData {
    return { ...this.data };
  }

  public toJSON(): GitHubBranchData {
    return this.toPlainObject();
  }
}