/**
 * GitHubIntegrationService - External Service Interface
 *
 * Interfaz para la integración con GitHub API.
 */

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  state: "open" | "closed";
  labels: string[];
  assignees: string[];
  milestone?: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  htmlUrl: string;
  apiUrl: string;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  body: string;
  state: "open" | "closed" | "merged";
  baseBranch: string;
  headBranch: string;
  createdAt: Date;
  updatedAt: Date;
  mergedAt?: Date;
  htmlUrl: string;
  apiUrl: string;
  mergeable: boolean;
  draft: boolean;
}

export interface GitHubBranch {
  name: string;
  sha: string;
  protected: boolean;
  createdAt: Date;
  lastCommit: {
    sha: string;
    message: string;
    author: string;
    date: Date;
  };
}

export interface GitHubComment {
  id: number;
  body: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  htmlUrl: string;
}

export interface CreateIssueRequest {
  title: string;
  body: string;
  labels?: string[];
  assignees?: string[];
  milestone?: string;
}

export interface CreatePullRequestRequest {
  title: string;
  body: string;
  baseBranch: string;
  headBranch: string;
  draft?: boolean;
}

export interface GitHubWebhookEvent {
  action: string;
  repository: {
    name: string;
    fullName: string;
    htmlUrl: string;
  };
  sender: {
    login: string;
    avatarUrl: string;
  };
  issue?: GitHubIssue;
  pullRequest?: GitHubPullRequest;
  comment?: GitHubComment;
}

export interface GitHubIntegrationService {
  /**
   * Crea un nuevo issue en GitHub
   */
  createIssue(request: CreateIssueRequest): Promise<GitHubIssue>;

  /**
   * Obtiene un issue por número
   */
  getIssue(issueNumber: number): Promise<GitHubIssue | null>;

  /**
   * Actualiza un issue existente
   */
  updateIssue(
    issueNumber: number,
    updates: {
      title?: string;
      body?: string;
      state?: "open" | "closed";
      labels?: string[];
      assignees?: string[];
    }
  ): Promise<GitHubIssue>;

  /**
   * Añade un comentario a un issue
   */
  addIssueComment(issueNumber: number, body: string): Promise<GitHubComment>;

  /**
   * Obtiene comentarios de un issue
   */
  getIssueComments(issueNumber: number): Promise<GitHubComment[]>;

  /**
   * Crea una nueva rama
   */
  createBranch(branchName: string, fromBranch?: string): Promise<GitHubBranch>;

  /**
   * Obtiene información de una rama
   */
  getBranch(branchName: string): Promise<GitHubBranch | null>;

  /**
   * Lista todas las ramas
   */
  listBranches(): Promise<GitHubBranch[]>;

  /**
   * Elimina una rama
   */
  deleteBranch(branchName: string): Promise<boolean>;

  /**
   * Crea un Pull Request
   */
  createPullRequest(
    request: CreatePullRequestRequest
  ): Promise<GitHubPullRequest>;

  /**
   * Obtiene un Pull Request por número
   */
  getPullRequest(prNumber: number): Promise<GitHubPullRequest | null>;

  /**
   * Actualiza un Pull Request
   */
  updatePullRequest(
    prNumber: number,
    updates: {
      title?: string;
      body?: string;
      state?: "open" | "closed";
    }
  ): Promise<GitHubPullRequest>;

  /**
   * Merge un Pull Request
   */
  mergePullRequest(
    prNumber: number,
    mergeMethod?: "merge" | "squash" | "rebase"
  ): Promise<boolean>;

  /**
   * Obtiene el estado de los checks de un PR
   */
  getPullRequestChecks(prNumber: number): Promise<
    Array<{
      name: string;
      status: "pending" | "success" | "failure" | "error";
      conclusion?: string;
      htmlUrl: string;
    }>
  >;

  /**
   * Busca issues por criterios
   */
  searchIssues(query: {
    state?: "open" | "closed" | "all";
    labels?: string[];
    assignee?: string;
    author?: string;
    since?: Date;
  }): Promise<GitHubIssue[]>;

  /**
   * Busca Pull Requests por criterios
   */
  searchPullRequests(query: {
    state?: "open" | "closed" | "merged" | "all";
    baseBranch?: string;
    headBranch?: string;
    author?: string;
  }): Promise<GitHubPullRequest[]>;

  /**
   * Obtiene estadísticas del repositorio
   */
  getRepositoryStats(): Promise<{
    totalIssues: number;
    openIssues: number;
    closedIssues: number;
    totalPullRequests: number;
    openPullRequests: number;
    mergedPullRequests: number;
    totalBranches: number;
    lastActivity: Date;
  }>;

  /**
   * Configura webhooks para eventos
   */
  configureWebhook(
    events: string[],
    callbackUrl: string
  ): Promise<{
    id: number;
    url: string;
    events: string[];
  }>;

  /**
   * Procesa eventos de webhook
   */
  processWebhookEvent(payload: GitHubWebhookEvent): Promise<void>;

  /**
   * Valida la firma del webhook
   */
  validateWebhookSignature(payload: string, signature: string): boolean;

  /**
   * Obtiene información del repositorio
   */
  getRepositoryInfo(): Promise<{
    name: string;
    fullName: string;
    description: string;
    htmlUrl: string;
    defaultBranch: string;
    isPrivate: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;

  /**
   * Verifica la conectividad con GitHub
   */
  checkConnection(): Promise<boolean>;
}
