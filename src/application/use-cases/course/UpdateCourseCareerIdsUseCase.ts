/**
 * UpdateCourseCareerIdsUseCase - Application Layer
 * 
 * Caso de uso para actualizar las carreras asociadas a un curso.
 */

import { CourseData } from '../../../domain/entities/Course';
import { CourseManagementService } from '../../../domain/services/CourseManagementService';

export interface UpdateCourseCareerIdsRequest {
  courseId: string;
  careerIds: number[];
  organizerId: string;
}

export interface UpdateCourseCareerIdsResponse {
  success: boolean;
  course?: CourseData;
  message?: string;
  error?: string;
}

export class UpdateCourseCareerIdsUseCase {
  constructor(private courseManagementService: CourseManagementService) {}

  async execute(request: UpdateCourseCareerIdsRequest): Promise<UpdateCourseCareerIdsResponse> {
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

      if (!Array.isArray(request.careerIds)) {
        return { 
          success: false, 
          error: 'La lista de carreras debe ser un array' 
        };
      }

      // Validar que las carreras sean números válidos
      for (const careerId of request.careerIds) {
        if (!Number.isInteger(careerId) || careerId <= 0) {
          return { 
            success: false, 
            error: `ID de carrera inválido: ${careerId}` 
          };
        }
      }

      // Ejecutar actualización
      const updatedCourse = await this.courseManagementService.updateCourseCarerIds(
        request.courseId,
        request.careerIds,
        request.organizerId
      );

      return {
        success: true,
        course: updatedCourse.toPlainObject(),
        message: 'Carreras del curso actualizadas exitosamente'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al actualizar las carreras del curso'
      };
    }
  }
}