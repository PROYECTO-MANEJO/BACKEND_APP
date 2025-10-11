/**
 * CloseCourseUseCase - Application Layer
 *
 * Caso de uso para cerrar un curso y generar certificados.
 */

import { CourseData } from "../../../domain/entities/Course";
import { CourseManagementService } from "../../../domain/services/CourseManagementService";

export interface CloseCourseRequest {
  courseId: string;
  organizerId: string;
}

export interface CloseCourseResponse {
  success: boolean;
  course?: CourseData;
  message?: string;
  certificatesGenerated?: {
    total: number;
    successful: number;
    failed: number;
  };
  error?: string;
}

export class CloseCourseUseCase {
  constructor(private courseManagementService: CourseManagementService) {}

  async execute(request: CloseCourseRequest): Promise<CloseCourseResponse> {
    try {
      // Validaciones básicas
      if (!request.courseId?.trim()) {
        return {
          success: false,
          error: "El ID del curso es obligatorio",
        };
      }

      if (!request.organizerId?.trim()) {
        return {
          success: false,
          error: "El ID del organizador es obligatorio",
        };
      }

      // Cerrar el curso
      const closedCourse = await this.courseManagementService.closeCourse(
        request.courseId,
        request.organizerId
      );

      // Nota: En el futuro, aquí se podría agregar la lógica para generar certificados
      // Por ahora, retornamos el curso cerrado exitosamente

      return {
        success: true,
        course: closedCourse.toPlainObject(),
        message: "Curso cerrado exitosamente",
        certificatesGenerated: {
          total: 0, // Placeholder - implementar en futuras fases
          successful: 0, // Placeholder - implementar en futuras fases
          failed: 0, // Placeholder - implementar en futuras fases
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al cerrar el curso",
      };
    }
  }
}
