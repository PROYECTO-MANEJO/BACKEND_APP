"use strict";
/**
 * DeleteCourseUseCase - Application Layer
 *
 * Caso de uso para eliminar un curso del sistema.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteCourseUseCase = void 0;
class DeleteCourseUseCase {
    constructor(courseManagementService) {
        this.courseManagementService = courseManagementService;
    }
    async execute(request) {
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
            await this.courseManagementService.deleteCourse(request.courseId, request.organizerId);
            return {
                success: true,
                message: 'Curso eliminado exitosamente'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido al eliminar el curso'
            };
        }
    }
}
exports.DeleteCourseUseCase = DeleteCourseUseCase;
//# sourceMappingURL=DeleteCourseUseCase.js.map