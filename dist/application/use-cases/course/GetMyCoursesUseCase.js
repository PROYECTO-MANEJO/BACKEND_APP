"use strict";
/**
 * GetMyCoursesUseCase - Application Layer
 *
 * Caso de uso para obtener los cursos de un usuario específico.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMyCoursesUseCase = void 0;
class GetMyCoursesUseCase {
    constructor(courseManagementService) {
        this.courseManagementService = courseManagementService;
    }
    async execute(request) {
        try {
            // Validación básica
            if (!request.userId?.trim()) {
                return {
                    success: false,
                    error: "El ID del usuario es obligatorio",
                };
            }
            // Obtener todos los cursos del usuario
            const allUserCourses = await this.courseManagementService.getUserCourses(request.userId);
            // Filtrar por estado si se especifica
            let filteredCourses = allUserCourses;
            if (request.status && request.status !== "all") {
                filteredCourses = allUserCourses.filter((course) => {
                    switch (request.status) {
                        case "upcoming":
                            return course.isUpcoming();
                        case "in-progress":
                            return course.isInProgress();
                        case "finished":
                            return course.isFinished();
                        default:
                            return true;
                    }
                });
            }
            // Calcular estadísticas
            const statistics = {
                upcoming: allUserCourses.filter((course) => course.isUpcoming()).length,
                inProgress: allUserCourses.filter((course) => course.isInProgress())
                    .length,
                finished: allUserCourses.filter((course) => course.isFinished()).length,
                total: allUserCourses.length,
            };
            return {
                success: true,
                courses: filteredCourses.map((course) => course.toPlainObject()),
                statistics,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : "Error desconocido al obtener los cursos del usuario",
            };
        }
    }
}
exports.GetMyCoursesUseCase = GetMyCoursesUseCase;
//# sourceMappingURL=GetMyCoursesUseCase.js.map