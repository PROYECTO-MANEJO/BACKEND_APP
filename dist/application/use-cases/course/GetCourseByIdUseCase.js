"use strict";
/**
 * GetCourseByIdUseCase - Application Layer
 *
 * Caso de uso para obtener un curso específico por su ID.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCourseByIdUseCase = void 0;
class GetCourseByIdUseCase {
    constructor(courseRepository) {
        this.courseRepository = courseRepository;
    }
    async execute(request) {
        try {
            // Validación básica
            if (!request.courseId?.trim()) {
                return {
                    success: false,
                    error: 'El ID del curso es obligatorio'
                };
            }
            // Buscar el curso
            const course = await this.courseRepository.findById(request.courseId);
            if (!course) {
                return {
                    success: false,
                    error: 'Curso no encontrado'
                };
            }
            const response = {
                success: true,
                course: course.toPlainObject()
            };
            // Incluir estadísticas si se solicita
            if (request.includeStatistics) {
                const enrolledCount = await this.courseRepository.getEnrolledCount(request.courseId);
                const availableSpots = course.capacidad_max_cur - enrolledCount;
                const capacityPercentage = (enrolledCount / course.capacidad_max_cur) * 100;
                const canEnroll = availableSpots > 0 && course.isUpcoming() && course.isActive();
                response.statistics = {
                    enrolledCount,
                    availableSpots,
                    capacityPercentage: Math.round(capacityPercentage * 100) / 100,
                    canEnroll
                };
            }
            return response;
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido al obtener el curso'
            };
        }
    }
}
exports.GetCourseByIdUseCase = GetCourseByIdUseCase;
//# sourceMappingURL=GetCourseByIdUseCase.js.map