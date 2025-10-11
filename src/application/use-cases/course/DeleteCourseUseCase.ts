/**
 * DeleteCourseUseCase - Application Layer
 * 
 * Caso de uso para eliminar un curso del sistema.
 */

import { CourseManagementService } from '../../../domain/services/CourseManagementService';

export interface DeleteCourseRequest {
  courseId: string;
  organizerId: string;
}

export interface DeleteCourseResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class DeleteCourseUseCase {
  constructor(private courseManagementService: CourseManagementService) {}

  async execute(request: DeleteCourseRequest): Promise<DeleteCourseResponse> {
    try {
      // Validaciones básicas
      if (!request.courseId?.trim()) {
        return { 
          success: false, 
          error: 'El ID del curso es obligatorio' 
        };
      }

      if (!request.organizerId?.trim()) {
        return { 
          success: false, 
          error: 'El ID del organizador es obligatorio' 
        };
      }

      // Ejecutar eliminación
      await this.courseManagementService.deleteCourse(
        request.courseId, 
        request.organizerId
      );

      return {
        success: true,
        message: 'Curso eliminado exitosamente'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al eliminar el curso'
      };
    }
  }
}