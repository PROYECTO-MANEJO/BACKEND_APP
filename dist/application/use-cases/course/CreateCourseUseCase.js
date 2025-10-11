"use strict";
/**
 * CreateCourseUseCase - Application Layer
 *
 * Caso de uso para crear un nuevo curso en el sistema.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCourseUseCase = void 0;
class CreateCourseUseCase {
    constructor(courseManagementService) {
        this.courseManagementService = courseManagementService;
    }
    async execute(request) {
        try {
            // Validaciones básicas de entrada
            if (!request.nom_cur?.trim()) {
                return { success: false, error: 'El nombre del curso es obligatorio' };
            }
            if (!request.ced_org_cur?.trim()) {
                return { success: false, error: 'El organizador es obligatorio' };
            }
            if (!request.fec_ini_cur || !request.fec_fin_cur) {
                return { success: false, error: 'Las fechas de inicio y fin son obligatorias' };
            }
            // Convertir request a CourseData
            const courseData = {
                nom_cur: request.nom_cur.trim(),
                des_cur: request.des_cur.trim(),
                dur_cur: request.dur_cur,
                fec_ini_cur: new Date(request.fec_ini_cur),
                fec_fin_cur: new Date(request.fec_fin_cur),
                id_cat_cur: request.id_cat_cur,
                ced_org_cur: request.ced_org_cur.trim(),
                capacidad_max_cur: request.capacidad_max_cur,
                tipo_audiencia_cur: request.tipo_audiencia_cur,
                requiere_verificacion_docs: request.requiere_verificacion_docs || false,
                es_gratuito: request.es_gratuito,
                precio: request.precio,
                porcentaje_asistencia_aprobacion: request.porcentaje_asistencia_aprobacion,
                nota_minima_aprobacion: request.nota_minima_aprobacion,
                carreras: request.carreras
            };
            // Ejecutar lógica de negocio
            const course = await this.courseManagementService.createCourse(courseData);
            return {
                success: true,
                course: course.toPlainObject()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido al crear el curso'
            };
        }
    }
}
exports.CreateCourseUseCase = CreateCourseUseCase;
//# sourceMappingURL=CreateCourseUseCase.js.map