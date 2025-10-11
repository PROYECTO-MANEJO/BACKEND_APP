import { ChangeRequest } from "@domain/entities/ChangeRequest";
import { ChangeRequestRepository } from "@domain/repositories/IChangeRequestRepository";
import { ChangeRequestWorkflowService } from "@domain/services/ChangeRequestWorkflowService";

export interface UpdateChangeRequestStatusDTO {
  requestId: string;
  newStatus: string;
  userId: string;
  userRole: string;
  comments?: string;
}

export class UpdateChangeRequestStatusUseCase {
  constructor(
    private changeRequestRepository: ChangeRequestRepository,
    private workflowService: ChangeRequestWorkflowService
  ) {}

  public async execute(
    data: UpdateChangeRequestStatusDTO
  ): Promise<ChangeRequest> {
    this.validateInput(data);

    // Obtener la solicitud actual
    const changeRequest = await this.changeRequestRepository.findById(
      data.requestId
    );
    if (!changeRequest) {
      throw new Error("Solicitud no encontrada");
    }

    // Validar que la transición es permitida
    const validation = this.workflowService.validateStatusTransition(
      changeRequest.status,
      data.newStatus,
      data.userRole,
      changeRequest
    );

    if (!validation.isValid) {
      throw new Error(validation.reason || "Transición de estado no válida");
    }

    // Verificar permisos específicos
    this.validateUserPermissions(
      changeRequest,
      data.userId,
      data.userRole,
      data.newStatus
    );

    // Actualizar el estado usando métodos específicos de la entidad
    switch (data.newStatus) {
      case "PENDIENTE":
        changeRequest.submit();
        break;
      case "APROBADA":
        changeRequest.approve(data.userId, undefined);
        break;
      case "RECHAZADA":
        changeRequest.reject(data.comments || "Solicitud rechazada");
        break;
      case "EN_TESTING":
        changeRequest.moveToTesting();
        break;
      case "COMPLETADA":
        changeRequest.markAsImplemented();
        break;
      case "CANCELADA":
        changeRequest.cancel(data.comments);
        break;
      default:
        // Para otros estados, usar el método de actualización genérico si existe
        throw new Error(
          `Transición a estado ${data.newStatus} no implementada específicamente`
        );
    }

    // Agregar comentarios adicionales si se proporcionan
    if (
      data.comments &&
      data.comments.trim().length > 0 &&
      data.newStatus !== "RECHAZADA"
    ) {
      changeRequest.addComment(data.comments.trim(), data.userId);
    }

    // Persistir cambios
    const updatedRequest = await this.changeRequestRepository.update(
      changeRequest
    );

    return updatedRequest;
  }

  private validateInput(data: UpdateChangeRequestStatusDTO): void {
    if (!data.requestId || data.requestId.trim().length === 0) {
      throw new Error("El ID de la solicitud es requerido");
    }

    if (!data.newStatus || data.newStatus.trim().length === 0) {
      throw new Error("El nuevo estado es requerido");
    }

    if (!data.userId || data.userId.trim().length === 0) {
      throw new Error("El ID del usuario es requerido");
    }

    if (!data.userRole || data.userRole.trim().length === 0) {
      throw new Error("El rol del usuario es requerido");
    }

    const validStatuses = [
      "BORRADOR",
      "PENDIENTE",
      "EN_REVISION",
      "APROBADA",
      "RECHAZADA",
      "ESPERANDO_INFORMACION",
      "EN_DESARROLLO",
      "EN_TESTING",
      "EN_PAUSA",
      "COMPLETADA",
      "CERRADA",
      "CANCELADA",
    ];

    if (!validStatuses.includes(data.newStatus)) {
      throw new Error(
        `Estado inválido. Valores válidos: ${validStatuses.join(", ")}`
      );
    }

    const validRoles = ["USER", "DESARROLLADOR", "ADMINISTRADOR", "MASTER"];
    if (!validRoles.includes(data.userRole)) {
      throw new Error(
        `Rol inválido. Valores válidos: ${validRoles.join(", ")}`
      );
    }

    if (data.comments && data.comments.length > 1000) {
      throw new Error("Los comentarios no pueden exceder 1000 caracteres");
    }
  }

  private validateUserPermissions(
    changeRequest: ChangeRequest,
    userId: string,
    userRole: string,
    newStatus: string
  ): void {
    // Solo el solicitante puede enviar desde BORRADOR
    if (changeRequest.status === "BORRADOR" && newStatus === "PENDIENTE") {
      if (changeRequest.requesterId !== userId) {
        throw new Error("Solo el solicitante puede enviar la solicitud");
      }
    }

    // Solo desarrolladores asignados pueden mover a EN_TESTING
    if (newStatus === "EN_TESTING" && userRole === "DESARROLLADOR") {
      if (changeRequest.developerId !== userId) {
        throw new Error(
          "Solo el desarrollador asignado puede enviar a testing"
        );
      }
    }

    // Validaciones específicas por rol
    switch (userRole) {
      case "USER":
        // Los usuarios solo pueden enviar borradores y responder a información solicitada
        const allowedUserTransitions = ["PENDIENTE", "EN_REVISION"];
        if (!allowedUserTransitions.includes(newStatus)) {
          throw new Error("No tienes permisos para realizar esta transición");
        }
        break;

      case "DESARROLLADOR":
        // Los desarrolladores pueden trabajar con solicitudes asignadas a ellos
        if (changeRequest.developerId !== userId) {
          throw new Error("Solo puedes actualizar solicitudes asignadas a ti");
        }
        break;

      case "ADMINISTRADOR":
      case "MASTER":
        // Administradores y Masters tienen permisos amplios
        break;

      default:
        throw new Error("Rol no reconocido");
    }
  }
}
