import { ChangeRequest } from "@domain/entities/ChangeRequest";
import { ChangeRequestRepository } from "@domain/repositories/IChangeRequestRepository";

export class GetChangeRequestByIdUseCase {
  constructor(private changeRequestRepository: ChangeRequestRepository) {}

  public async execute(
    requestId: string,
    userId?: string
  ): Promise<ChangeRequest | null> {
    this.validateInput(requestId);

    const changeRequest = await this.changeRequestRepository.findById(
      requestId
    );

    if (!changeRequest) {
      return null;
    }

    // Opcional: verificar permisos de acceso
    if (userId && !this.canUserAccessRequest(changeRequest, userId)) {
      throw new Error("No tienes permisos para acceder a esta solicitud");
    }

    return changeRequest;
  }

  private validateInput(requestId: string): void {
    if (!requestId || requestId.trim().length === 0) {
      throw new Error("El ID de la solicitud es requerido");
    }
  }

  private canUserAccessRequest(
    changeRequest: ChangeRequest,
    userId: string
  ): boolean {
    // El usuario puede acceder si es:
    // 1. El solicitante
    // 2. El desarrollador asignado
    // 3. Un administrador (esto se validaría en el controller con roles)

    return (
      changeRequest.requesterId === userId ||
      changeRequest.developerId === userId
    );
  }
}
