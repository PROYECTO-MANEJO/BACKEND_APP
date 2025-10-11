/**
 * GitHub Domain Entities - Index
 *
 * Exporta todas las entidades relacionadas con GitHub
 */

// GitHub Repository Entity
export { GitHubRepository } from "./GitHubRepository";
export type { GitHubRepositoryData } from "./GitHubRepository";

// GitHub Branch Entity
export { GitHubBranch } from "./GitHubBranch";
export type {
  GitHubBranchData,
  BranchType,
  BranchStatus,
} from "./GitHubBranch";

// GitHub Pull Request Entity
export { GitHubPullRequest } from "./GitHubPullRequest";
export type {
  GitHubPullRequestData,
  PullRequestState,
  PullRequestStatus,
  PullRequestReviewer,
} from "./GitHubPullRequest";

// GitHub Issue Entity
export { GitHubIssue } from "./GitHubIssue";
export type {
  GitHubIssueData,
  IssueState,
  IssueType,
  IssueLabel,
  IssueAssignee,
} from "./GitHubIssue";

// GitHub Commit Entity
export { GitHubCommit } from "./GitHubCommit";
export type {
  GitHubCommitData,
  CommitStatus,
  CommitAuthor,
  CommitCommitter,
  FileChange,
  CommitVerification,
  CommitStats,
} from "./GitHubCommit";

// GitHub Configuration Entity
export { GitHubConfiguration } from "./GitHubConfiguration";

// Common GitHub Types
export type GitHubEntityId = string;
export type GitHubUserLogin = string;
export type GitHubTimestamp = Date;

// GitHub API Response Types
export interface GitHubAPIError {
  message: string;
  documentation_url?: string;
  errors?: Array<{
    resource: string;
    field: string;
    code: string;
  }>;
}

// GitHub Webhook Event Types
export type GitHubWebhookEvent =
  | "push"
  | "pull_request"
  | "pull_request_review"
  | "pull_request_review_comment"
  | "issues"
  | "issue_comment"
  | "commit_comment"
  | "create"
  | "delete"
  | "fork"
  | "watch"
  | "release"
  | "deployment"
  | "deployment_status"
  | "check_run"
  | "check_suite"
  | "workflow_run";

// GitHub Rate Limit Information
export interface GitHubRateLimit {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

// GitHub Statistics
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

// GitHub Synchronization Status
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
