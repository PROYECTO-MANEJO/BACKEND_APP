import { ChangeRequest } from "@domain/entities/ChangeRequest";
import { ChangeRequestRepository } from "@domain/repositories/IChangeRequestRepository";

export interface CreateChangeRequestDTO {
  title: string;
  description: string;
  justification: string;
  changeType: string;
  priority?: string;
  urgency?: string;
  requesterId: string;
}

export class CreateChangeRequestUseCase {
  constructor(private changeRequestRepository: ChangeRequestRepository) {}

  public async execute(data: CreateChangeRequestDTO): Promise<ChangeRequest> {
    // Validaciones de entrada
    this.validateInput(data);

    // Crear entidad de dominio
    const changeRequest = ChangeRequest.create(
      data.title.trim(),
      data.description.trim(),
      data.justification.trim(),
      data.changeType as any,
      data.requesterId,
      undefined, // requesterName - se puede obtener luego
      (data.priority || "MEDIA") as any,
      (data.urgency || "NORMAL") as any
    );

    // Persistir en el repositorio
    const createdRequest = await this.changeRequestRepository.create(
      changeRequest
    );

    return createdRequest;
  }

  private validateInput(data: CreateChangeRequestDTO): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error("El título es requerido");
    }

    if (data.title.trim().length > 200) {
      throw new Error("El título no puede exceder 200 caracteres");
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new Error("La descripción es requerida");
    }

    if (data.description.trim().length > 2000) {
      throw new Error("La descripción no puede exceder 2000 caracteres");
    }

    if (!data.justification || data.justification.trim().length === 0) {
      throw new Error("La justificación es requerida");
    }

    if (data.justification.trim().length > 1500) {
      throw new Error("La justificación no puede exceder 1500 caracteres");
    }

    if (!data.changeType) {
      throw new Error("El tipo de cambio es requerido");
    }

    const validChangeTypes = [
      "FUNCIONALIDAD",
      "CORRECCION",
      "MEJORA",
      "CONFIGURACION",
      "SEGURIDAD",
      "RENDIMIENTO",
      "DOCUMENTACION",
    ];

    if (!validChangeTypes.includes(data.changeType)) {
      throw new Error(
        `Tipo de cambio inválido. Valores válidos: ${validChangeTypes.join(
          ", "
        )}`
      );
    }

    const validPriorities = ["BAJA", "MEDIA", "ALTA", "CRITICA"];
    if (data.priority && !validPriorities.includes(data.priority)) {
      throw new Error(
        `Prioridad inválida. Valores válidos: ${validPriorities.join(", ")}`
      );
    }

    const validUrgencies = ["NORMAL", "URGENTE", "INMEDIATA"];
    if (data.urgency && !validUrgencies.includes(data.urgency)) {
      throw new Error(
        `Urgencia inválida. Valores válidos: ${validUrgencies.join(", ")}`
      );
    }

    if (!data.requesterId || data.requesterId.trim().length === 0) {
      throw new Error("El ID del solicitante es requerido");
    }
  }
}
