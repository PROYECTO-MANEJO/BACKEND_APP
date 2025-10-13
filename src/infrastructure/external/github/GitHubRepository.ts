/**
 * GitHub Repository Entity - Domain Layer
 *
 * Representa un repositorio de GitHub con sus configuraciones y metadatos
 */

export interface GitHubRepositoryData {
  id: string;
  name: string;
  fullName: string; // owner/repo-name
  owner: string;
  description?: string;
  isPrivate: boolean;
  defaultBranch: string;
  url: string;
  cloneUrl: string;
  language?: string;
  topics: string[];
  
  // Configuración específica del sistema
  repositoryType: "FRONTEND" | "BACKEND" | "SHARED" | "OTHER";
  isActive: boolean;
  
  // Metadatos
  createdAt: Date;
  updatedAt: Date;
  lastSyncDate?: Date;
  
  // Estadísticas
  starCount?: number;
  forkCount?: number;
  issueCount?: number;
  pullRequestCount?: number;
}

export class GitHubRepository {
  constructor(private data: GitHubRepositoryData) {
    this.validateData();
  }

  public static create(
    name: string,
    owner: string,
    repositoryType: "FRONTEND" | "BACKEND" | "SHARED" | "OTHER",
    isPrivate: boolean = false,
    defaultBranch: string = "main"
  ): GitHubRepository {
    const repositoryData: GitHubRepositoryData = {
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

  public static fromGitHubAPI(apiData: any, repositoryType: "FRONTEND" | "BACKEND" | "SHARED" | "OTHER"): GitHubRepository {
    const repositoryData: GitHubRepositoryData = {
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

  private validateData(): void {
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
  public getId(): string {
    return this.data.id;
  }

  public getName(): string {
    return this.data.name;
  }

  public getFullName(): string {
    return this.data.fullName;
  }

  public getOwner(): string {
    return this.data.owner;
  }

  public getDefaultBranch(): string {
    return this.data.defaultBranch;
  }

  public getUrl(): string {
    return this.data.url;
  }

  public getCloneUrl(): string {
    return this.data.cloneUrl;
  }

  public getRepositoryType(): "FRONTEND" | "BACKEND" | "SHARED" | "OTHER" {
    return this.data.repositoryType;
  }

  public isActive(): boolean {
    return this.data.isActive;
  }

  public isPrivate(): boolean {
    return this.data.isPrivate;
  }

  public getTopics(): string[] {
    return [...this.data.topics];
  }

  public getCreatedAt(): Date {
    return this.data.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.data.updatedAt;
  }

  public getLastSyncDate(): Date | undefined {
    return this.data.lastSyncDate;
  }

  // Business Methods
  public needsSync(): boolean {
    if (!this.data.lastSyncDate) {
      return true;
    }

    const hoursSinceLastSync = (new Date().getTime() - this.data.lastSyncDate.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastSync > 24; // Sincronizar cada 24 horas
  }

  public canCreateBranches(): boolean {
    return this.data.isActive && !this.data.isPrivate; // Simplificado
  }

  public canCreateIssues(): boolean {
    return this.data.isActive;
  }

  public canCreatePullRequests(): boolean {
    return this.data.isActive;
  }

  // Actions
  public updateMetadata(
    description?: string,
    language?: string,
    topics?: string[]
  ): GitHubRepository {
    const updatedData = {
      ...this.data,
      description: description !== undefined ? description : this.data.description,
      language: language !== undefined ? language : this.data.language,
      topics: topics !== undefined ? [...topics] : this.data.topics,
      updatedAt: new Date()
    };

    return new GitHubRepository(updatedData);
  }

  public markAsSynced(): GitHubRepository {
    const updatedData = {
      ...this.data,
      lastSyncDate: new Date(),
      updatedAt: new Date()
    };

    return new GitHubRepository(updatedData);
  }

  public updateStatistics(
    starCount: number,
    forkCount: number,
    issueCount: number,
    pullRequestCount?: number
  ): GitHubRepository {
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

  public deactivate(): GitHubRepository {
    const updatedData = {
      ...this.data,
      isActive: false,
      updatedAt: new Date()
    };

    return new GitHubRepository(updatedData);
  }

  public activate(): GitHubRepository {
    const updatedData = {
      ...this.data,
      isActive: true,
      updatedAt: new Date()
    };

    return new GitHubRepository(updatedData);
  }

  // Serialization
  public toPlainObject(): GitHubRepositoryData {
    return { ...this.data };
  }

  public toJSON(): GitHubRepositoryData {
    return this.toPlainObject();
  }
}