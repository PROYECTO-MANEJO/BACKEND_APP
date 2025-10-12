"use strict";
/**
 * GitHub Domain Entities - Index
 *
 * Exporta todas las entidades relacionadas con GitHub
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubConfiguration = exports.GitHubCommit = exports.GitHubIssue = exports.GitHubPullRequest = exports.GitHubBranch = exports.GitHubRepository = void 0;
// GitHub Repository Entity
var GitHubRepository_1 = require("./GitHubRepository");
Object.defineProperty(exports, "GitHubRepository", { enumerable: true, get: function () { return GitHubRepository_1.GitHubRepository; } });
// GitHub Branch Entity
var GitHubBranch_1 = require("./GitHubBranch");
Object.defineProperty(exports, "GitHubBranch", { enumerable: true, get: function () { return GitHubBranch_1.GitHubBranch; } });
// GitHub Pull Request Entity
var GitHubPullRequest_1 = require("./GitHubPullRequest");
Object.defineProperty(exports, "GitHubPullRequest", { enumerable: true, get: function () { return GitHubPullRequest_1.GitHubPullRequest; } });
// GitHub Issue Entity
var GitHubIssue_1 = require("./GitHubIssue");
Object.defineProperty(exports, "GitHubIssue", { enumerable: true, get: function () { return GitHubIssue_1.GitHubIssue; } });
// GitHub Commit Entity
var GitHubCommit_1 = require("./GitHubCommit");
Object.defineProperty(exports, "GitHubCommit", { enumerable: true, get: function () { return GitHubCommit_1.GitHubCommit; } });
// GitHub Configuration Entity
var GitHubConfiguration_1 = require("./GitHubConfiguration");
Object.defineProperty(exports, "GitHubConfiguration", { enumerable: true, get: function () { return GitHubConfiguration_1.GitHubConfiguration; } });
//# sourceMappingURL=index.js.map