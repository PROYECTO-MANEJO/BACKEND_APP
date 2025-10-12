/**
 * GitHub API Service
 *
 * Servicio de infraestructura para interactuar con la API de GitHub
 */

import {
  IGitHubAPIService,
  CreateRepositoryRequest,
} from "../../../application/usecases/github/CreateRepositoryUseCase";
import {
  IGitHubBranchAPIService,
  CreateBranchRequest,
} from "../../../application/usecases/github/CreateBranchUseCase";
import {
  IGitHubPullRequestAPIService,
  CreatePullRequestRequest,
} from "../../../application/usecases/github/CreatePullRequestUseCase";
import { IGitHubSyncAPIService } from "../../../application/usecases/github/SyncRepositoryUseCase";

export class GitHubAPIService
  implements
    IGitHubAPIService,
    IGitHubBranchAPIService,
    IGitHubPullRequestAPIService,
    IGitHubSyncAPIService
{
  private readonly baseURL = "https://api.github.com";
  private readonly headers: Record<string, string>;

  constructor(private token: string) {
    this.headers = {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GitHub-Integration-Service/1.0",
    };
  }

  // Repository Methods
  public async createRepository(
    request: CreateRepositoryRequest
  ): Promise<any> {
    const endpoint = request.organization
      ? `/orgs/${request.organization}/repos`
      : "/user/repos";

    const payload = {
      name: request.name,
      description: request.description,
      private: request.isPrivate || false,
      auto_init: request.autoInit || false,
      gitignore_template: request.gitignoreTemplate,
      license_template: request.licenseTemplate,
    };

    return await this.makeRequest("POST", endpoint, payload);
  }

  public async getRepository(
    name: string,
    organization?: string
  ): Promise<any> {
    const repoPath = organization ? `${organization}/${name}` : name;
    const endpoint = `/repos/${repoPath}`;

    return await this.makeRequest("GET", endpoint);
  }

  public async updateRepository(
    name: string,
    data: any,
    organization?: string
  ): Promise<any> {
    const repoPath = organization ? `${organization}/${name}` : name;
    const endpoint = `/repos/${repoPath}`;

    return await this.makeRequest("PATCH", endpoint, data);
  }

  public async deleteRepository(
    name: string,
    organization?: string
  ): Promise<void> {
    const repoPath = organization ? `${organization}/${name}` : name;
    const endpoint = `/repos/${repoPath}`;

    await this.makeRequest("DELETE", endpoint);
  }

  public async listRepositories(organization?: string): Promise<any[]> {
    const endpoint = organization
      ? `/orgs/${organization}/repos`
      : "/user/repos";

    return await this.makeRequest("GET", endpoint);
  }

  // Branch Methods
  public async createBranch(request: CreateBranchRequest): Promise<any> {
    const endpoint = `/repos/${request.repositoryFullName}/git/refs`;

    // Primero obtener el SHA de la rama base
    const baseBranchRef = await this.getBranchReference(
      request.repositoryFullName,
      request.baseBranch || "main"
    );

    const payload = {
      ref: `refs/heads/${request.name}`,
      sha: baseBranchRef.object.sha,
    };

    return await this.makeRequest("POST", endpoint, payload);
  }

  public async getBranch(
    name: string,
    repositoryFullName: string
  ): Promise<any> {
    const endpoint = `/repos/${repositoryFullName}/branches/${name}`;

    return await this.makeRequest("GET", endpoint);
  }

  public async deleteBranch(
    name: string,
    repositoryFullName: string
  ): Promise<void> {
    const endpoint = `/repos/${repositoryFullName}/git/refs/heads/${name}`;

    await this.makeRequest("DELETE", endpoint);
  }

  public async listBranches(repositoryFullName: string): Promise<any[]> {
    const endpoint = `/repos/${repositoryFullName}/branches`;

    return await this.makeRequest("GET", endpoint);
  }

  public async getDefaultBranch(repositoryFullName: string): Promise<string> {
    const repo = await this.getRepository(repositoryFullName);
    return repo.default_branch || "main";
  }

  private async getBranchReference(
    repositoryFullName: string,
    branchName: string
  ): Promise<any> {
    const endpoint = `/repos/${repositoryFullName}/git/refs/heads/${branchName}`;

    return await this.makeRequest("GET", endpoint);
  }

  // Pull Request Methods
  public async createPullRequest(
    request: CreatePullRequestRequest
  ): Promise<any> {
    const endpoint = `/repos/${request.repositoryFullName}/pulls`;

    const payload = {
      title: request.title,
      body: request.body,
      head: request.headBranch,
      base: request.baseBranch,
      draft: request.isDraft || false,
    };

    return await this.makeRequest("POST", endpoint, payload);
  }

  public async getPullRequest(
    number: number,
    repositoryFullName: string
  ): Promise<any> {
    const endpoint = `/repos/${repositoryFullName}/pulls/${number}`;

    return await this.makeRequest("GET", endpoint);
  }

  public async updatePullRequest(
    number: number,
    repositoryFullName: string,
    data: any
  ): Promise<any> {
    const endpoint = `/repos/${repositoryFullName}/pulls/${number}`;

    return await this.makeRequest("PATCH", endpoint, data);
  }

  public async closePullRequest(
    number: number,
    repositoryFullName: string
  ): Promise<any> {
    return await this.updatePullRequest(number, repositoryFullName, {
      state: "closed",
    });
  }

  public async mergePullRequest(
    number: number,
    repositoryFullName: string,
    mergeMethod?: string
  ): Promise<any> {
    const endpoint = `/repos/${repositoryFullName}/pulls/${number}/merge`;

    const payload = {
      merge_method: mergeMethod || "merge",
    };

    return await this.makeRequest("PUT", endpoint, payload);
  }

  public async listPullRequests(
    repositoryFullName: string,
    state?: string
  ): Promise<any[]> {
    const endpoint = `/repos/${repositoryFullName}/pulls`;
    const params = state ? `?state=${state}` : "";

    return await this.makeRequest("GET", `${endpoint}${params}`);
  }

  public async requestReview(
    number: number,
    repositoryFullName: string,
    reviewers: string[]
  ): Promise<void> {
    const endpoint = `/repos/${repositoryFullName}/pulls/${number}/requested_reviewers`;

    const payload = {
      reviewers,
    };

    await this.makeRequest("POST", endpoint, payload);
  }

  public async addAssignees(
    number: number,
    repositoryFullName: string,
    assignees: string[]
  ): Promise<void> {
    const endpoint = `/repos/${repositoryFullName}/issues/${number}/assignees`;

    const payload = {
      assignees,
    };

    await this.makeRequest("POST", endpoint, payload);
  }

  public async addLabels(
    number: number,
    repositoryFullName: string,
    labels: string[]
  ): Promise<void> {
    const endpoint = `/repos/${repositoryFullName}/issues/${number}/labels`;

    await this.makeRequest("POST", endpoint, labels);
  }

  // Sync Methods
  public async listIssues(
    repositoryFullName: string,
    state?: string
  ): Promise<any[]> {
    const endpoint = `/repos/${repositoryFullName}/issues`;
    const params = state ? `?state=${state}` : "";

    return await this.makeRequest("GET", `${endpoint}${params}`);
  }

  public async listCommits(
    repositoryFullName: string,
    branch?: string,
    maxCount?: number
  ): Promise<any[]> {
    let endpoint = `/repos/${repositoryFullName}/commits`;

    const params = new URLSearchParams();
    if (branch) params.append("sha", branch);
    if (maxCount) params.append("per_page", maxCount.toString());

    const queryString = params.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }

    return await this.makeRequest("GET", endpoint);
  }

  // Webhook Methods
  public async createWebhook(
    repositoryFullName: string,
    webhookUrl: string,
    secret: string,
    events: string[]
  ): Promise<any> {
    const endpoint = `/repos/${repositoryFullName}/hooks`;

    const payload = {
      name: "web",
      active: true,
      events,
      config: {
        url: webhookUrl,
        content_type: "json",
        secret,
        insecure_ssl: "0",
      },
    };

    return await this.makeRequest("POST", endpoint, payload);
  }

  public async updateWebhook(
    repositoryFullName: string,
    webhookId: number,
    webhookUrl: string,
    secret: string,
    events: string[]
  ): Promise<any> {
    const endpoint = `/repos/${repositoryFullName}/hooks/${webhookId}`;

    const payload = {
      active: true,
      events,
      config: {
        url: webhookUrl,
        content_type: "json",
        secret,
        insecure_ssl: "0",
      },
    };

    return await this.makeRequest("PATCH", endpoint, payload);
  }

  public async deleteWebhook(
    repositoryFullName: string,
    webhookId: number
  ): Promise<void> {
    const endpoint = `/repos/${repositoryFullName}/hooks/${webhookId}`;

    await this.makeRequest("DELETE", endpoint);
  }

  public async listWebhooks(repositoryFullName: string): Promise<any[]> {
    const endpoint = `/repos/${repositoryFullName}/hooks`;

    return await this.makeRequest("GET", endpoint);
  }

  // Rate Limit and User Info
  public async getRateLimit(): Promise<any> {
    const endpoint = "/rate_limit";

    return await this.makeRequest("GET", endpoint);
  }

  public async getCurrentUser(): Promise<any> {
    const endpoint = "/user";

    return await this.makeRequest("GET", endpoint);
  }

  // Private helper method
  private async makeRequest(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;

    const options: RequestInit = {
      method,
      headers: this.headers,
    };

    if (body && (method === "POST" || method === "PATCH" || method === "PUT")) {
      options.body = JSON.stringify(body);
      options.headers = {
        ...this.headers,
        "Content-Type": "application/json",
      };
    }

    try {
      const response = await fetch(url, options);

      // Handle rate limiting
      if (
        response.status === 403 &&
        response.headers.get("X-RateLimit-Remaining") === "0"
      ) {
        const resetTime = response.headers.get("X-RateLimit-Reset");
        throw new Error(
          `Rate limit exceeded. Resets at ${new Date(
            Number(resetTime) * 1000
          ).toISOString()}`
        );
      }

      // Handle other HTTP errors
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`GitHub API error ${response.status}: ${errorBody}`);
      }

      // Handle empty responses (like DELETE operations)
      if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      ) {
        return null;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(`Network error: ${String(error)}`);
    }
  }

  // Helper method to validate token
  public async validateToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  // Helper method to get repository information
  public async getRepositoryInfo(repositoryFullName: string): Promise<{
    name: string;
    fullName: string;
    description: string;
    isPrivate: boolean;
    defaultBranch: string;
    starsCount: number;
    forksCount: number;
    openIssuesCount: number;
    language: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const repo = await this.getRepository(repositoryFullName);

    return {
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || "",
      isPrivate: repo.private,
      defaultBranch: repo.default_branch,
      starsCount: repo.stargazers_count,
      forksCount: repo.forks_count,
      openIssuesCount: repo.open_issues_count,
      language: repo.language || "",
      createdAt: new Date(repo.created_at),
      updatedAt: new Date(repo.updated_at),
    };
  }
}
