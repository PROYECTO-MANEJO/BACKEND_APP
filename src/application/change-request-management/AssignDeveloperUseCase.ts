import { ChangeRequest } from "@domain/entities/ChangeRequest";
import { Developer } from "@domain/entities/Developer";
import { ChangeRequestRepository } from "@domain/repositories/IChangeRequestRepository";
import { DeveloperRepository } from "@domain/repositories/IDeveloperRepository";
import { ChangeRequestWorkflowService } from "@domain/services/ChangeRequestWorkflowService";

export interface AssignDeveloperDTO {
  requestId: string;
  developerId: string;
  assignedBy: string; // userId del administrador que asigna
  estimatedHours?: number;
  targetDate?: Date;
}

export class AssignDeveloperUseCase {
  constructor(
    private changeRequestRepository: ChangeRequestRepository,
    private developerRepository: DeveloperRepository,
    private workflowService: ChangeRequestWorkflowService
  ) {}

  public async execute(data: AssignDeveloperDTO): Promise<ChangeRequest> {
    this.validateInput(data);

    // Obtener la solicitud
    const changeRequest = await this.changeRequestRepository.findById(data.requestId);
    if (!changeRequest) {
      throw new Error('Solicitud no encontrada');
    }

    // Verificar que la solicitud esté en estado APROBADA
    if (changeRequest.status !== 'APROBADA') {
      throw new Error('Solo se pueden asignar desarrolladores a solicitudes aprobadas');
    }

    // Verificar que no tenga desarrollador asignado ya
    if (changeRequest.developerId) {
      throw new Error('La solicitud ya tiene un desarrollador asignado');
    }

    // Obtener el desarrollador
    const developer = await this.developerRepository.findById(data.developerId);
    if (!developer) {
      throw new Error('Desarrollador no encontrado');
    }

    // Verificar que el desarrollador puede tomar la solicitud
    if (!developer.canTakeNewRequest()) {
      throw new Error(`El desarrollador no puede tomar más solicitudes. Carga actual: ${developer.getCurrentWorkload()}`);
    }

    // Asignar el desarrollador y comenzar desarrollo
    changeRequest.startDevelopment(
      data.developerId,
      developer.getUserId(), // nombre del desarrollador
      undefined // technicalDetails pueden agregarse después
    );

    // Actualizar estimación de horas si se proporciona (usando acceso directo)
    if (data.estimatedHours && changeRequest.estimatedHours !== undefined) {
      // La entidad actual no tiene método updateEstimatedHours, 
      // este campo se puede manejar en el repositorio o agregar el método
    }

    // Incrementar carga de trabajo del desarrollador
    const updatedDeveloper = developer.incrementWorkload();
    await this.developerRepository.update(updatedDeveloper);

    // Persistir cambios en la solicitud
    const updatedRequest = await this.changeRequestRepository.update(changeRequest);

    return updatedRequest;
  }

  private validateInput(data: AssignDeveloperDTO): void {
    if (!data.requestId || data.requestId.trim().length === 0) {
      throw new Error('El ID de la solicitud es requerido');
    }

    if (!data.developerId || data.developerId.trim().length === 0) {
      throw new Error('El ID del desarrollador es requerido');
    }

    if (!data.assignedBy || data.assignedBy.trim().length === 0) {
      throw new Error('El ID del usuario que asigna es requerido');
    }

    if (data.estimatedHours && (data.estimatedHours <= 0 || data.estimatedHours > 1000)) {
      throw new Error('Las horas estimadas deben estar entre 1 y 1000');
    }

    if (data.targetDate && data.targetDate < new Date()) {
      throw new Error('La fecha objetivo no puede ser en el pasado');
    }
  }
}