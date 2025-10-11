/**
 * CreateChangeRequestUseCase - Application Layer
 *
 * Caso de uso para crear solicitudes de cambio.
 */

import { ChangeRequestManagementService } from "../../../domain/services/ChangeRequestManagementService";
import {
  ChangeRequest,
  Priority,
  ChangeRequestType,
  Urgency,
} from "../../../domain/entities/ChangeRequest";

export interface CreateChangeRequestRequest {
  title: string;
  description: string;
  justification: string;
  changeType: ChangeRequestType;
  requesterId: string;
  priority?: Priority;
  urgency?: Urgency;
}

export interface CreateChangeRequestResponse {
  success: boolean;
  changeRequest?: ChangeRequest;
  message: string;
  githubIssueUrl?: string;
  errors?: string[];
}

export class CreateChangeRequestUseCase {
  constructor(
    private changeRequestManagementService: ChangeRequestManagementService
  ) {}

  async execute(
    request: CreateChangeRequestRequest
  ): Promise<CreateChangeRequestResponse> {
    try {
      // Validar entrada
      const validationErrors = this.validateRequest(request);
      if (validationErrors.length > 0) {
        return {
          success: false,
          message: "Datos de entrada inválidos",
          errors: validationErrors,
        };
      }

      const changeRequest =
        await this.changeRequestManagementService.createChangeRequest(
          request.title,
          request.description,
          request.justification,
          request.changeType,
          request.requesterId,
          request.priority || "MEDIA",
          request.urgency || "NORMAL"
        );

      return {
        success: true,
        changeRequest,
        githubIssueUrl: changeRequest.githubIntegration?.issueUrl,
        message: "Solicitud de cambio creada exitosamente",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";

      return {
        success: false,
        message: `Error creando solicitud de cambio: ${errorMessage}`,
      };
    }
  }

  private validateRequest(request: CreateChangeRequestRequest): string[] {
    const errors: string[] = [];

    if (!request.title?.trim()) {
      errors.push("El título es requerido");
    } else if (request.title.length < 5) {
      errors.push("El título debe tener al menos 5 caracteres");
    }

    if (!request.description?.trim()) {
      errors.push("La descripción es requerida");
    } else if (request.description.length < 10) {
      errors.push("La descripción debe tener al menos 10 caracteres");
    }

    if (!request.justification?.trim()) {
      errors.push("La justificación es requerida");
    } else if (request.justification.length < 10) {
      errors.push("La justificación debe tener al menos 10 caracteres");
    }

    if (!request.requesterId?.trim()) {
      errors.push("El solicitante es requerido");
    }

    if (!request.changeType) {
      errors.push("El tipo de cambio es requerido");
    }

    const validChangeTypes: ChangeRequestType[] = [
      "FEATURE",
      "BUG_FIX",
      "ENHANCEMENT",
      "MAINTENANCE",
      "DOCUMENTATION",
      "SECURITY",
      "PERFORMANCE",
    ];
    if (request.changeType && !validChangeTypes.includes(request.changeType)) {
      errors.push("Tipo de cambio inválido");
    }

    if (request.priority) {
      const validPriorities: Priority[] = ["BAJA", "MEDIA", "ALTA", "CRITICA"];
      if (!validPriorities.includes(request.priority)) {
        errors.push("Prioridad inválida");
      }
    }

    if (request.urgency) {
      const validUrgencies: Urgency[] = ["NORMAL", "URGENTE", "CRITICA"];
      if (!validUrgencies.includes(request.urgency)) {
        errors.push("Urgencia inválida");
      }
    }

    return errors;
  }
}
