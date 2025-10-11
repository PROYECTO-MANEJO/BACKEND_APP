"use strict";
/**
 * GetAllCoursesUseCase - Application Layer
 *
 * Caso de uso para obtener todos los cursos del sistema.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllCoursesUseCase = void 0;
class GetAllCoursesUseCase {
    constructor(courseRepository) {
        this.courseRepository = courseRepository;
    }
    async execute(request = {}) {
        try {
            const { page = 1, limit = 10, organizerId, categoryId, status } = request;
            // Si se especifica paginación
            if (page && limit) {
                let result;
                if (organizerId) {
                    result = await this.courseRepository.findByOrganizerPaginated(organizerId, page, limit);
                }
                else {
                    result = await this.courseRepository.findAllPaginated(page, limit);
                }
                return {
                    success: true,
                    courses: result.courses.map((course) => course.toPlainObject()),
                    pagination: {
                        total: result.total,
                        totalPages: result.totalPages,
                        currentPage: result.currentPage,
                        limit,
                    },
                };
            }
            // Sin paginación - obtener todos con filtros
            let courses;
            if (organizerId) {
                courses = await this.courseRepository.findByOrganizer(organizerId);
            }
            else if (categoryId) {
                courses = await this.courseRepository.findByCategory(categoryId);
            }
            else if (status) {
                courses = await this.courseRepository.findByStatus(status);
            }
            else {
                courses = await this.courseRepository.findAll();
            }
            return {
                success: true,
                courses: courses.map((course) => course.toPlainObject()),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : "Error desconocido al obtener los cursos",
            };
        }
    }
}
exports.GetAllCoursesUseCase = GetAllCoursesUseCase;
//# sourceMappingURL=GetAllCoursesUseCase.js.map