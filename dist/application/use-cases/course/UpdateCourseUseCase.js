"use strict";
/**
 * UpdateCourseUseCase - Application Layer
 *
 * Caso de uso para actualizar un curso existente.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCourseUseCase = void 0;
class UpdateCourseUseCase {
    constructor(courseManagementService) {
        this.courseManagementService = courseManagementService;
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
            // Verificar que al menos un campo se está actualizando
            const updateFields = Object.keys(request).filter(key => key !== 'courseId');
            if (updateFields.length === 0) {
                return {
                    success: false,
                    error: 'Debe proporcionar al menos un campo para actualizar'
                };
            }
            // Preparar datos de actualización
            const updateData = {};
            if (request.nom_cur !== undefined) {
                updateData.nom_cur = request.nom_cur.trim();
            }
            if (request.des_cur !== undefined) {
                updateData.des_cur = request.des_cur.trim();
            }
            if (request.dur_cur !== undefined) {
                updateData.dur_cur = request.dur_cur;
            }
            if (request.fec_ini_cur !== undefined) {
                updateData.fec_ini_cur = new Date(request.fec_ini_cur);
            }
            if (request.fec_fin_cur !== undefined) {
                updateData.fec_fin_cur = new Date(request.fec_fin_cur);
            }
            if (request.id_cat_cur !== undefined) {
                updateData.id_cat_cur = request.id_cat_cur;
            }
            if (request.capacidad_max_cur !== undefined) {
                updateData.capacidad_max_cur = request.capacidad_max_cur;
            }
            if (request.requiere_verificacion_docs !== undefined) {
                updateData.requiere_verificacion_docs = request.requiere_verificacion_docs;
            }
            if (request.es_gratuito !== undefined) {
                updateData.es_gratuito = request.es_gratuito;
            }
            if (request.precio !== undefined) {
                updateData.precio = request.precio;
            }
            if (request.porcentaje_asistencia_aprobacion !== undefined) {
                updateData.porcentaje_asistencia_aprobacion = request.porcentaje_asistencia_aprobacion;
            }
            if (request.nota_minima_aprobacion !== undefined) {
                updateData.nota_minima_aprobacion = request.nota_minima_aprobacion;
            }
            // Ejecutar actualización
            const updatedCourse = await this.courseManagementService.updateCourse(request.courseId, updateData);
            return {
                success: true,
                course: updatedCourse.toPlainObject()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido al actualizar el curso'
            };
        }
    }
}
exports.UpdateCourseUseCase = UpdateCourseUseCase;
//# sourceMappingURL=UpdateCourseUseCase.js.map