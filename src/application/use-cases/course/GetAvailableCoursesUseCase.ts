/**
 * GetAvailableCoursesUseCase - Application Layer
 *
 * Caso de uso para obtener cursos disponibles para inscripción.
 */

import { CourseData } from "../../../domain/entities/Course";
import { CourseManagementService } from "../../../domain/services/CourseManagementService";

export interface GetAvailableCoursesRequest {
  userId?: string;
  categoryId?: number;
  searchTerm?: string;
  isFree?: boolean;
}

export interface GetAvailableCoursesResponse {
  success: boolean;
  courses?: CourseData[];
  error?: string;
}

export class GetAvailableCoursesUseCase {
  constructor(private courseManagementService: CourseManagementService) {}

  async execute(
    request: GetAvailableCoursesRequest = {}
  ): Promise<GetAvailableCoursesResponse> {
    try {
      // Obtener cursos disponibles
      const courses =
        await this.courseManagementService.getAvailableCoursesForUser(
          request.userId
        );

      // Aplicar filtros adicionales si se especifican
      let filteredCourses = courses;

      if (request.categoryId) {
        filteredCourses = filteredCourses.filter(
          (course) => course.id_cat_cur === request.categoryId
        );
      }

      if (request.isFree !== undefined) {
        filteredCourses = filteredCourses.filter(
          (course) => course.es_gratuito === request.isFree
        );
      }

      if (request.searchTerm) {
        const searchTermLower = request.searchTerm.toLowerCase();
        filteredCourses = filteredCourses.filter(
          (course) =>
            course.nom_cur.toLowerCase().includes(searchTermLower) ||
            course.des_cur.toLowerCase().includes(searchTermLower)
        );
      }

      return {
        success: true,
        courses: filteredCourses.map((course) => course.toPlainObject()),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al obtener cursos disponibles",
      };
    }
  }
}
