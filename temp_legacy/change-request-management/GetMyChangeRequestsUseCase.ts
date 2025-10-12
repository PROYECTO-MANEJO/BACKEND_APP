import { ChangeRequest } from "@domain/entities/ChangeRequest";
import {
  ChangeRequestRepository,
  ChangeRequestFilters,
} from "@domain/repositories/IChangeRequestRepository";

export interface GetMyRequestsDTO {
  userId: string;
  status?: string;
  changeType?: string;
  page?: number;
  limit?: number;
}

export class GetMyChangeRequestsUseCase {
  constructor(private changeRequestRepository: ChangeRequestRepository) {}

  public async execute(data: GetMyRequestsDTO): Promise<{
    items: ChangeRequest[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    this.validateInput(data);

    const filters: ChangeRequestFilters = {
      status: data.status,
      changeType: data.changeType,
      page: data.page || 1,
      limit: Math.min(data.limit || 10, 50), // máximo 50 elementos por página
    };

    const result = await this.changeRequestRepository.findByRequesterId(
      data.userId,
      filters
    );

    // Calcular páginas
    const totalPages = Math.ceil(result.total / (filters.limit || 10));

    return {
      items: result.items,
      total: result.total,
      page: filters.page || 1,
      totalPages,
    };
  }

  private validateInput(data: GetMyRequestsDTO): void {
    if (!data.userId || data.userId.trim().length === 0) {
      throw new Error("El ID del usuario es requerido");
    }

    if (data.page && data.page < 1) {
      throw new Error("La página debe ser mayor a 0");
    }

    if (data.limit && (data.limit < 1 || data.limit > 50)) {
      throw new Error("El límite debe estar entre 1 y 50");
    }

    if (data.status) {
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

      if (!validStatuses.includes(data.status)) {
        throw new Error(
          `Estado inválido. Valores válidos: ${validStatuses.join(", ")}`
        );
      }
    }

    if (data.changeType) {
      const validTypes = [
        "FUNCIONALIDAD",
        "CORRECCION",
        "MEJORA",
        "CONFIGURACION",
        "SEGURIDAD",
        "RENDIMIENTO",
        "DOCUMENTACION",
      ];

      if (!validTypes.includes(data.changeType)) {
        throw new Error(
          `Tipo de cambio inválido. Valores válidos: ${validTypes.join(", ")}`
        );
      }
    }
  }
}
