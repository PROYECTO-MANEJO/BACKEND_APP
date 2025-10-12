"use strict";
/**
 * GitHub API Service
 *
 * Servicio de infraestructura para interactuar con la API de GitHub
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubAPIService = void 0;
class GitHubAPIService {
    constructor(token) {
        this.token = token;
        this.baseURL = "https://api.github.com";
        this.headers = {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "GitHub-Integration-Service/1.0",
        };
    }
    // Repository Methods
    async createRepository(request) {
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
    async getRepository(name, organization) {
        const repoPath = organization ? `${organization}/${name}` : name;
        const endpoint = `/repos/${repoPath}`;
        return await this.makeRequest("GET", endpoint);
    }
    async updateRepository(name, data, organization) {
        const repoPath = organization ? `${organization}/${name}` : name;
        const endpoint = `/repos/${repoPath}`;
        return await this.makeRequest("PATCH", endpoint, data);
    }
    async deleteRepository(name, organization) {
        const repoPath = organization ? `${organization}/${name}` : name;
        const endpoint = `/repos/${repoPath}`;
        await this.makeRequest("DELETE", endpoint);
    }
    async listRepositories(organization) {
        const endpoint = organization
            ? `/orgs/${organization}/repos`
            : "/user/repos";
        return await this.makeRequest("GET", endpoint);
    }
    // Branch Methods
    async createBranch(request) {
        const endpoint = `/repos/${request.repositoryFullName}/git/refs`;
        // Primero obtener el SHA de la rama base
        const baseBranchRef = await this.getBranchReference(request.repositoryFullName, request.baseBranch || "main");
        const payload = {
            ref: `refs/heads/${request.name}`,
            sha: baseBranchRef.object.sha,
        };
        return await this.makeRequest("POST", endpoint, payload);
    }
    async getBranch(name, repositoryFullName) {
        const endpoint = `/repos/${repositoryFullName}/branches/${name}`;
        return await this.makeRequest("GET", endpoint);
    }
    async deleteBranch(name, repositoryFullName) {
        const endpoint = `/repos/${repositoryFullName}/git/refs/heads/${name}`;
        await this.makeRequest("DELETE", endpoint);
    }
    async listBranches(repositoryFullName) {
        const endpoint = `/repos/${repositoryFullName}/branches`;
        return await this.makeRequest("GET", endpoint);
    }
    async getDefaultBranch(repositoryFullName) {
        const repo = await this.getRepository(repositoryFullName);
        return repo.default_branch || "main";
    }
    async getBranchReference(repositoryFullName, branchName) {
        const endpoint = `/repos/${repositoryFullName}/git/refs/heads/${branchName}`;
        return await this.makeRequest("GET", endpoint);
    }
    // Pull Request Methods
    async createPullRequest(request) {
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
    async getPullRequest(number, repositoryFullName) {
        const endpoint = `/repos/${repositoryFullName}/pulls/${number}`;
        return await this.makeRequest("GET", endpoint);
    }
    async updatePullRequest(number, repositoryFullName, data) {
        const endpoint = `/repos/${repositoryFullName}/pulls/${number}`;
        return await this.makeRequest("PATCH", endpoint, data);
    }
    async closePullRequest(number, repositoryFullName) {
        return await this.updatePullRequest(number, repositoryFullName, {
            state: "closed",
        });
    }
    async mergePullRequest(number, repositoryFullName, mergeMethod) {
        const endpoint = `/repos/${repositoryFullName}/pulls/${number}/merge`;
        const payload = {
            merge_method: mergeMethod || "merge",
        };
        return await this.makeRequest("PUT", endpoint, payload);
    }
    async listPullRequests(repositoryFullName, state) {
        const endpoint = `/repos/${repositoryFullName}/pulls`;
        const params = state ? `?state=${state}` : "";
        return await this.makeRequest("GET", `${endpoint}${params}`);
    }
    async requestReview(number, repositoryFullName, reviewers) {
        const endpoint = `/repos/${repositoryFullName}/pulls/${number}/requested_reviewers`;
        const payload = {
            reviewers,
        };
        await this.makeRequest("POST", endpoint, payload);
    }
    async addAssignees(number, repositoryFullName, assignees) {
        const endpoint = `/repos/${repositoryFullName}/issues/${number}/assignees`;
        const payload = {
            assignees,
        };
        await this.makeRequest("POST", endpoint, payload);
    }
    async addLabels(number, repositoryFullName, labels) {
        const endpoint = `/repos/${repositoryFullName}/issues/${number}/labels`;
        await this.makeRequest("POST", endpoint, labels);
    }
    // Sync Methods
    async listIssues(repositoryFullName, state) {
        const endpoint = `/repos/${repositoryFullName}/issues`;
        const params = state ? `?state=${state}` : "";
        return await this.makeRequest("GET", `${endpoint}${params}`);
    }
    async listCommits(repositoryFullName, branch, maxCount) {
        let endpoint = `/repos/${repositoryFullName}/commits`;
        const params = new URLSearchParams();
        if (branch)
            params.append("sha", branch);
        if (maxCount)
            params.append("per_page", maxCount.toString());
        const queryString = params.toString();
        if (queryString) {
            endpoint += `?${queryString}`;
        }
        return await this.makeRequest("GET", endpoint);
    }
    // Webhook Methods
    async createWebhook(repositoryFullName, webhookUrl, secret, events) {
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
    async updateWebhook(repositoryFullName, webhookId, webhookUrl, secret, events) {
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
    async deleteWebhook(repositoryFullName, webhookId) {
        const endpoint = `/repos/${repositoryFullName}/hooks/${webhookId}`;
        await this.makeRequest("DELETE", endpoint);
    }
    async listWebhooks(repositoryFullName) {
        const endpoint = `/repos/${repositoryFullName}/hooks`;
        return await this.makeRequest("GET", endpoint);
    }
    // Rate Limit and User Info
    async getRateLimit() {
        const endpoint = "/rate_limit";
        return await this.makeRequest("GET", endpoint);
    }
    async getCurrentUser() {
        const endpoint = "/user";
        return await this.makeRequest("GET", endpoint);
    }
    // Private helper method
    async makeRequest(method, endpoint, body) {
        const url = `${this.baseURL}${endpoint}`;
        const options = {
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
            if (response.status === 403 &&
                response.headers.get("X-RateLimit-Remaining") === "0") {
                const resetTime = response.headers.get("X-RateLimit-Reset");
                throw new Error(`Rate limit exceeded. Resets at ${new Date(Number(resetTime) * 1000).toISOString()}`);
            }
            // Handle other HTTP errors
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`GitHub API error ${response.status}: ${errorBody}`);
            }
            // Handle empty responses (like DELETE operations)
            if (response.status === 204 ||
                response.headers.get("content-length") === "0") {
                return null;
            }
            return await response.json();
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(`Network error: ${String(error)}`);
        }
    }
    // Helper method to validate token
    async validateToken() {
        try {
            await this.getCurrentUser();
            return true;
        }
        catch {
            return false;
        }
    }
    // Helper method to get repository information
    async getRepositoryInfo(repositoryFullName) {
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
exports.GitHubAPIService = GitHubAPIService;
//# sourceMappingURL=GitHubAPIService.js.map