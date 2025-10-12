/**
 * GitHub Domain Entities - Index
 *
 * Exporta todas las entidades relacionadas con GitHub
 */
export { GitHubRepository } from "./GitHubRepository";
export type { GitHubRepositoryData } from "./GitHubRepository";
export { GitHubBranch } from "./GitHubBranch";
export type { GitHubBranchData, BranchType, BranchStatus, } from "./GitHubBranch";
export { GitHubPullRequest } from "./GitHubPullRequest";
export type { GitHubPullRequestData, PullRequestState, PullRequestStatus, PullRequestReviewer, } from "./GitHubPullRequest";
export { GitHubIssue } from "./GitHubIssue";
export type { GitHubIssueData, IssueState, IssueType, IssueLabel, IssueAssignee, } from "./GitHubIssue";
export { GitHubCommit } from "./GitHubCommit";
export type { GitHubCommitData, CommitStatus, CommitAuthor, CommitCommitter, FileChange, CommitVerification, CommitStats, } from "./GitHubCommit";
export { GitHubConfiguration } from "./GitHubConfiguration";
export type GitHubEntityId = string;
export type GitHubUserLogin = string;
export type GitHubTimestamp = Date;
export interface GitHubAPIError {
    message: string;
    documentation_url?: string;
    errors?: Array<{
        resource: string;
        field: string;
        code: string;
    }>;
}
export type GitHubWebhookEvent = "push" | "pull_request" | "pull_request_review" | "pull_request_review_comment" | "issues" | "issue_comment" | "commit_comment" | "create" | "delete" | "fork" | "watch" | "release" | "deployment" | "deployment_status" | "check_run" | "check_suite" | "workflow_run";
export interface GitHubRateLimit {
    limit: number;
    remaining: number;
    reset: number;
    used: number;
}
export interface GitHubStatistics {
    repositories: {
        total: number;
        public: number;
        private: number;
    };
    branches: {
        total: number;
        protected: number;
        stale: number;
    };
    pullRequests: {
        open: number;
        closed: number;
        merged: number;
    };
    issues: {
        open: number;
        closed: number;
    };
    commits: {
        thisWeek: number;
        thisMonth: number;
    };
}
export interface GitHubSyncStatus {
    lastSync: Date;
    inProgress: boolean;
    errors: string[];
    syncedEntities: {
        repositories: number;
        branches: number;
        pullRequests: number;
        issues: number;
        commits: number;
    };
}
//# sourceMappingURL=index.d.ts.map