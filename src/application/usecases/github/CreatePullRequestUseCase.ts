/**
 * Create Pull Request Use Case
 *
 * Caso de uso para crear un nuevo Pull Request de GitHub
 */

import { GitHubPullRequest } from "../../../domain/entities/github/GitHubPullRequest";

export interface CreatePullRequestRequest {
  title: string;
  body?: string;
  repositoryId: string;
  repositoryFullName: string;
  headBranch: string;
  baseBranch: string;
  changeRequestId?: string;
  isDraft?: boolean;
  assignees?: string[];
  reviewers?: string[];
  labels?: string[];
}

export interface CreatePullRequestResponse {
  pullRequest: GitHubPullRequest;
  success: boolean;
  message: string;
}

export interface IGitHubPullRequestRepository {
  create(pullRequest: GitHubPullRequest): Promise<GitHubPullRequest>;
  findByNumber(
    number: number,
    repositoryId: string
  ): Promise<GitHubPullRequest | null>;
  findById(id: string): Promise<GitHubPullRequest | null>;
  findByRepository(repositoryId: string): Promise<GitHubPullRequest[]>;
  findByBranch(
    branchName: string,
    repositoryId: string
  ): Promise<GitHubPullRequest[]>;
  findByChangeRequest(changeRequestId: string): Promise<GitHubPullRequest[]>;
  update(pullRequest: GitHubPullRequest): Promise<GitHubPullRequest>;
  delete(id: string): Promise<void>;
}

export interface IGitHubPullRequestAPIService {
  createPullRequest(request: CreatePullRequestRequest): Promise<any>;
  getPullRequest(number: number, repositoryFullName: string): Promise<any>;
  updatePullRequest(
    number: number,
    repositoryFullName: string,
    data: any
  ): Promise<any>;
  closePullRequest(number: number, repositoryFullName: string): Promise<any>;
  mergePullRequest(
    number: number,
    repositoryFullName: string,
    mergeMethod?: string
  ): Promise<any>;
  listPullRequests(repositoryFullName: string, state?: string): Promise<any[]>;
  requestReview(
    number: number,
    repositoryFullName: string,
    reviewers: string[]
  ): Promise<void>;
  addAssignees(
    number: number,
    repositoryFullName: string,
    assignees: string[]
  ): Promise<void>;
  addLabels(
    number: number,
    repositoryFullName: string,
    labels: string[]
  ): Promise<void>;
}

export class CreatePullRequestUseCase {
  constructor(
    private pullRequestRepo: IGitHubPullRequestRepository,
    private githubAPI: IGitHubPullRequestAPIService
  ) {}

  public async execute(
    request: CreatePullRequestRequest
  ): Promise<CreatePullRequestResponse> {
    try {
      // Validar entrada
      this.validateRequest(request);

      // Verificar si ya existe un PR para esta rama
      const existingPRs = await this.pullRequestRepo.findByBranch(
        request.headBranch,
        request.repositoryId
      );
      const openPR = existingPRs.find((pr) => pr.isOpen());

      if (openPR) {
        return {
          pullRequest: openPR,
          success: false,
          message: `Ya existe un Pull Request abierto (#${openPR.getNumber()}) para la rama '${
            request.headBranch
          }'`,
        };
      }

      // Crear Pull Request en GitHub
      const githubPRData = await this.githubAPI.createPullRequest(request);

      // Crear entidad de dominio desde los datos de GitHub API
      const pullRequest = GitHubPullRequest.fromGitHubAPI(
        githubPRData,
        request.repositoryId,
        request.changeRequestId
      );

      // Guardar en base de datos
      const savedPR = await this.pullRequestRepo.create(pullRequest);

      // Configurar assignees, reviewers y labels después de crear el PR
      await this.configurePostCreation(githubPRData.number, request);

      return {
        pullRequest: savedPR,
        success: true,
        message: `Pull Request #${githubPRData.number} creado exitosamente: '${request.title}'`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";

      // En caso de error, crear entidad básica si tenemos los datos mínimos
      if (
        request.title &&
        request.repositoryId &&
        request.headBranch &&
        request.baseBranch
      ) {
        const basicPR = GitHubPullRequest.create(
          0, // Número temporal
          request.title,
          request.repositoryId,
          request.repositoryFullName,
          request.headBranch,
          request.baseBranch,
          "unknown",
          "unknown",
          request.body
        );

        return {
          pullRequest: basicPR,
          success: false,
          message: `Error al crear Pull Request: ${errorMessage}`,
        };
      }

      throw new Error(`Error al crear Pull Request: ${errorMessage}`);
    }
  }

  private async configurePostCreation(
    prNumber: number,
    request: CreatePullRequestRequest
  ): Promise<void> {
    try {
      // Agregar assignees
      if (request.assignees && request.assignees.length > 0) {
        await this.githubAPI.addAssignees(
          prNumber,
          request.repositoryFullName,
          request.assignees
        );
      }

      // Solicitar revisiones
      if (request.reviewers && request.reviewers.length > 0) {
        await this.githubAPI.requestReview(
          prNumber,
          request.repositoryFullName,
          request.reviewers
        );
      }

      // Agregar labels
      if (request.labels && request.labels.length > 0) {
        await this.githubAPI.addLabels(
          prNumber,
          request.repositoryFullName,
          request.labels
        );
      }
    } catch (error) {
      // Log error but don't fail the entire operation
      console.warn(
        `Warning: Failed to configure PR #${prNumber} post-creation:`,
        error
      );
    }
  }

  private validateRequest(request: CreatePullRequestRequest): void {
    if (!request.title || request.title.trim().length === 0) {
      throw new Error("El título del Pull Request es requerido");
    }

    if (request.title.length > 256) {
      throw new Error("El título no puede exceder 256 caracteres");
    }

    if (!request.repositoryId || request.repositoryId.trim().length === 0) {
      throw new Error("El ID del repositorio es requerido");
    }

    if (
      !request.repositoryFullName ||
      request.repositoryFullName.trim().length === 0
    ) {
      throw new Error("El nombre completo del repositorio es requerido");
    }

    if (!request.headBranch || request.headBranch.trim().length === 0) {
      throw new Error("La rama de origen (head) es requerida");
    }

    if (!request.baseBranch || request.baseBranch.trim().length === 0) {
      throw new Error("La rama de destino (base) es requerida");
    }

    if (request.headBranch === request.baseBranch) {
      throw new Error("La rama de origen y destino no pueden ser la misma");
    }

    if (request.body && request.body.length > 65536) {
      throw new Error("La descripción no puede exceder 65,536 caracteres");
    }

    // Validar assignees
    if (request.assignees) {
      if (request.assignees.length > 10) {
        throw new Error("No se pueden asignar más de 10 usuarios");
      }

      const invalidAssignees = request.assignees.filter(
        (assignee) =>
          !assignee || assignee.trim().length === 0 || assignee.length > 39
      );

      if (invalidAssignees.length > 0) {
        throw new Error("Los nombres de usuario asignados son inválidos");
      }
    }

    // Validar reviewers
    if (request.reviewers) {
      if (request.reviewers.length > 15) {
        throw new Error("No se pueden solicitar más de 15 revisores");
      }

      const invalidReviewers = request.reviewers.filter(
        (reviewer) =>
          !reviewer || reviewer.trim().length === 0 || reviewer.length > 39
      );

      if (invalidReviewers.length > 0) {
        throw new Error(
          "Los nombres de usuario de los revisores son inválidos"
        );
      }
    }

    // Validar labels
    if (request.labels) {
      if (request.labels.length > 100) {
        throw new Error("No se pueden agregar más de 100 labels");
      }

      const invalidLabels = request.labels.filter(
        (label) => !label || label.trim().length === 0 || label.length > 50
      );

      if (invalidLabels.length > 0) {
        throw new Error(
          "Algunos labels son inválidos (máximo 50 caracteres por label)"
        );
      }
    }
  }
}

/**
 * Create Change Request Pull Request Use Case
 *
 * Caso de uso especializado para crear PRs desde solicitudes de cambio
 */
export class CreateChangeRequestPullRequestUseCase {
  constructor(private createPullRequestUseCase: CreatePullRequestUseCase) {}

  public async execute(
    changeRequestId: string,
    changeRequestTitle: string,
    changeRequestDescription: string,
    repositoryId: string,
    repositoryFullName: string,
    headBranch: string,
    baseBranch: string = "develop",
    assignees?: string[],
    reviewers?: string[]
  ): Promise<CreatePullRequestResponse> {
    const title = this.generatePullRequestTitle(
      changeRequestId,
      changeRequestTitle
    );
    const body = this.generatePullRequestBody(
      changeRequestId,
      changeRequestDescription
    );
    const labels = this.getChangeRequestLabels();

    const request: CreatePullRequestRequest = {
      title,
      body,
      repositoryId,
      repositoryFullName,
      headBranch,
      baseBranch,
      changeRequestId,
      isDraft: false,
      assignees,
      reviewers,
      labels,
    };

    return await this.createPullRequestUseCase.execute(request);
  }

  private generatePullRequestTitle(
    changeRequestId: string,
    title: string
  ): string {
    return `[CR-${changeRequestId}] ${title}`;
  }

  private generatePullRequestBody(
    changeRequestId: string,
    description: string
  ): string {
    return `## 📋 Solicitud de Cambio

**ID:** ${changeRequestId}

## 📝 Descripción

${description}

## ✅ Checklist

- [ ] Código revisado y probado
- [ ] Tests actualizados
- [ ] Documentación actualizada
- [ ] Sin conflictos de merge
- [ ] Aprobación del revisor asignado

## 🔗 Enlaces

- **Solicitud de Cambio:** CR-${changeRequestId}

---
*Este Pull Request fue creado automáticamente desde una solicitud de cambio.*`;
  }

  private getChangeRequestLabels(): string[] {
    return ["change-request", "enhancement", "ready-for-review"];
  }
}
