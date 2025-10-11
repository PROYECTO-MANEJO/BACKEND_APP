/**
 * UpdateChangeRequestStatusUseCase - Application Layer
 *
 * Caso de uso para actualizar el estado de una solicitud de cambio.
 */

import { ChangeRequestManagementService } from "../../../domain/services/ChangeRequestManagementService";
import {
  ChangeRequest,
  ChangeRequestStatus,
} from "../../../domain/entities/ChangeRequest";

export interface UpdateChangeRequestStatusRequest {
  changeRequestId: string;
  newStatus: ChangeRequestStatus;
  updatedBy: string;
  comment?: string;
  estimatedHours?: number;
  targetDate?: Date;
  reviewNotes?: string;
  assignedDeveloperId?: string;
  githubBranch?: string;
  githubPrUrl?: string;
}

export interface UpdateChangeRequestStatusResponse {
  success: boolean;
  changeRequest?: ChangeRequest;
  message: string;
  statusChanged: boolean;
  errors?: string[];
}

export class UpdateChangeRequestStatusUseCase {
  constructor(
    private changeRequestManagementService: ChangeRequestManagementService
  ) {}

  async execute(
    request: UpdateChangeRequestStatusRequest
  ): Promise<UpdateChangeRequestStatusResponse> {
    try {
      // Validar entrada
      const validationErrors = this.validateRequest(request);
      if (validationErrors.length > 0) {
        return {
          success: false,
          statusChanged: false,
          message: "Datos de entrada inválidos",
          errors: validationErrors,
        };
      }

      const changeRequest = await this.executeStatusUpdate(request);

      return {
        success: true,
        statusChanged: true,
        changeRequest,
        message: "Estado de solicitud actualizado exitosamente",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";

      return {
        success: false,
        statusChanged: false,
        message: `Error actualizando estado: ${errorMessage}`,
      };
    }
  }

  private async executeStatusUpdate(
    request: UpdateChangeRequestStatusRequest
  ): Promise<ChangeRequest> {
    switch (request.newStatus) {
      case "ENVIADA":
        return await this.changeRequestManagementService.submitChangeRequest(
          request.changeRequestId
        );

      case "EN_REVISION":
        if (!request.updatedBy) {
          throw new Error("ID de revisor es requerido");
        }
        return await this.changeRequestManagementService.assignReviewer(
          request.changeRequestId,
          request.updatedBy,
          request.updatedBy
        );

      case "APROBADA":
        return await this.changeRequestManagementService.approveChangeRequest(
          request.changeRequestId,
          request.updatedBy,
          request.estimatedHours,
          request.targetDate,
          request.reviewNotes
        );

      case "RECHAZADA":
        return await this.changeRequestManagementService.rejectChangeRequest(
          request.changeRequestId,
          request.updatedBy,
          request.comment || "Solicitud rechazada"
        );

      case "EN_DESARROLLO":
        if (!request.assignedDeveloperId) {
          throw new Error("ID de desarrollador es requerido");
        }
        return await this.changeRequestManagementService.assignDeveloper(
          request.changeRequestId,
          request.assignedDeveloperId,
          request.updatedBy,
          request.githubBranch
        );

      case "EN_PRUEBAS":
        return await this.changeRequestManagementService.moveToTesting(
          request.changeRequestId,
          request.updatedBy,
          request.comment
        );

      case "IMPLEMENTADA":
        return await this.changeRequestManagementService.markAsImplemented(
          request.changeRequestId,
          request.updatedBy,
          request.estimatedHours
        );

      case "CERRADA":
        return await this.changeRequestManagementService.closeChangeRequest(
          request.changeRequestId,
          request.updatedBy
        );

      default:
        throw new Error(
          `Transición a estado ${request.newStatus} no implementada`
        );
    }
  }

  private validateRequest(request: UpdateChangeRequestStatusRequest): string[] {
    const errors: string[] = [];

    if (!request.changeRequestId?.trim()) {
      errors.push("ID de solicitud de cambio es requerido");
    }

    if (!request.updatedBy?.trim()) {
      errors.push("Usuario que actualiza es requerido");
    }

    const validStatuses: ChangeRequestStatus[] = [
      "BORRADOR",
      "ENVIADA",
      "EN_REVISION",
      "APROBADA",
      "RECHAZADA",
      "EN_DESARROLLO",
      "EN_PRUEBAS",
      "IMPLEMENTADA",
      "CERRADA",
      "CANCELADA",
    ];
    if (!validStatuses.includes(request.newStatus)) {
      errors.push("Estado inválido");
    }

    // Validaciones específicas por estado
    if (
      request.newStatus === "EN_DESARROLLO" &&
      !request.assignedDeveloperId?.trim()
    ) {
      errors.push("ID de desarrollador es requerido para estado EN_DESARROLLO");
    }

    if (request.newStatus === "APROBADA" && !request.estimatedHours) {
      errors.push("Horas estimadas son requeridas para aprobar la solicitud");
    }

    if (request.comment && request.comment.length > 1000) {
      errors.push("El comentario no puede exceder 1000 caracteres");
    }

    return errors;
  }
}
