/**
 * GitHub Use Cases - Index
 *
 * Exporta todos los casos de uso relacionados con GitHub
 */

// Repository Use Cases
export { CreateRepositoryUseCase } from "./CreateRepositoryUseCase";
export type {
  CreateRepositoryRequest,
  CreateRepositoryResponse,
  IGitHubRepositoryRepository,
  IGitHubAPIService,
} from "./CreateRepositoryUseCase";

// Branch Use Cases
export {
  CreateBranchUseCase,
  CreateFeatureBranchUseCase,
  CreateHotfixBranchUseCase,
} from "./CreateBranchUseCase";
export type {
  CreateBranchRequest,
  CreateBranchResponse,
  IGitHubBranchRepository,
  IGitHubBranchAPIService,
} from "./CreateBranchUseCase";

// Pull Request Use Cases
export {
  CreatePullRequestUseCase,
  CreateChangeRequestPullRequestUseCase,
} from "./CreatePullRequestUseCase";
export type {
  CreatePullRequestRequest,
  CreatePullRequestResponse,
  IGitHubPullRequestRepository,
  IGitHubPullRequestAPIService,
} from "./CreatePullRequestUseCase";

// Sync Use Cases
export { SyncRepositoryUseCase } from "./SyncRepositoryUseCase";
export type {
  SyncRepositoryRequest,
  SyncRepositoryResponse,
  IGitHubSyncAPIService,
  IGitHubRepositorySyncRepository,
  IGitHubBranchSyncRepository,
  IGitHubPullRequestSyncRepository,
  IGitHubIssueSyncRepository,
  IGitHubCommitSyncRepository,
} from "./SyncRepositoryUseCase";

// Common Types for GitHub Use Cases
export interface GitHubUseCaseError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface GitHubUseCaseResult<T> {
  data?: T;
  success: boolean;
  message: string;
  errors?: GitHubUseCaseError[];
}

// GitHub API Rate Limit Handling
export interface GitHubRateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

export interface GitHubUseCaseOptions {
  retryOnRateLimit?: boolean;
  maxRetries?: number;
  timeoutMs?: number;
}

// GitHub Webhook Payload Types
export interface GitHubWebhookPayload {
  action: string;
  repository: any;
  sender: any;
  installation?: any;
}

export interface GitHubPushWebhookPayload extends GitHubWebhookPayload {
  ref: string;
  before: string;
  after: string;
  commits: any[];
}

export interface GitHubPullRequestWebhookPayload extends GitHubWebhookPayload {
  number: number;
  pull_request: any;
}

export interface GitHubIssueWebhookPayload extends GitHubWebhookPayload {
  issue: any;
}

// GitHub Integration Events
export interface GitHubIntegrationEvent {
  id: string;
  type:
    | "repository"
    | "branch"
    | "pull_request"
    | "issue"
    | "commit"
    | "webhook";
  action: string;
  entityId: string;
  repositoryId: string;
  metadata: Record<string, any>;
  timestamp: Date;
  userId?: string;
}

// GitHub Batch Operations
export interface GitHubBatchOperation<T> {
  items: T[];
  batchSize?: number;
  concurrency?: number;
  onProgress?: (completed: number, total: number) => void;
  onError?: (item: T, error: Error) => void;
}

export interface GitHubBatchResult<T> {
  successful: T[];
  failed: { item: T; error: string }[];
  totalProcessed: number;
  duration: number;
}

// GitHub Repository Statistics
export interface GitHubRepositoryStats {
  branches: {
    total: number;
    active: number;
    merged: number;
    stale: number;
  };
  pullRequests: {
    open: number;
    closed: number;
    merged: number;
    averageMergeTime: number; // in hours
  };
  issues: {
    open: number;
    closed: number;
    averageCloseTime: number; // in hours
  };
  commits: {
    thisWeek: number;
    thisMonth: number;
    totalContributors: number;
  };
  activity: {
    lastCommit: Date;
    lastPullRequest: Date;
    lastIssue: Date;
  };
}

// GitHub Configuration Validation
export interface GitHubConfigurationValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}
