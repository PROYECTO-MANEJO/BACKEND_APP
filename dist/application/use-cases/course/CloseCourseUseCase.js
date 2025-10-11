"use strict";
/**
 * CloseCourseUseCase - Application Layer
 *
 * Caso de uso para cerrar un curso y generar certificados.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseCourseUseCase = void 0;
class CloseCourseUseCase {
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
            // Cerrar el curso
            const closedCourse = await this.courseManagementService.closeCourse(request.courseId, request.organizerId);
            // Nota: En el futuro, aquí se podría agregar la lógica para generar certificados
            // Por ahora, retornamos el curso cerrado exitosamente
            return {
                success: true,
                course: closedCourse.toPlainObject(),
                message: 'Curso cerrado exitosamente',
                certificatesGenerated: {
                    total: 0, // Placeholder - implementar en futuras fases
                    successful: 0, // Placeholder - implementar en futuras fases  
                    failed: 0 // Placeholder - implementar en futuras fases
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido al cerrar el curso'
            };
        }
    }
}
exports.CloseCourseUseCase = CloseCourseUseCase;
//# sourceMappingURL=CloseCourseUseCase.js.map