/**
 * UpdateCourseUseCase - Application Layer
 *
 * Caso de uso para actualizar un curso existente.
 */
import { CourseData } from "../../../domain/entities/Course";
import { CourseManagementService } from "../../../domain/services/CourseManagementService";
export interface UpdateCourseRequest {
    courseId: string;
    nom_cur?: string;
    des_cur?: string;
    dur_cur?: number;
    fec_ini_cur?: Date;
    fec_fin_cur?: Date;
    id_cat_cur?: number;
    capacidad_max_cur?: number;
    requiere_verificacion_docs?: boolean;
    es_gratuito?: boolean;
    precio?: number;
    porcentaje_asistencia_aprobacion?: number;
    nota_minima_aprobacion?: number;
}
export interface UpdateCourseResponse {
    success: boolean;
    course?: CourseData;
    error?: string;
}
export declare class UpdateCourseUseCase {
    private courseManagementService;
    constructor(courseManagementService: CourseManagementService);
    execute(request: UpdateCourseRequest): Promise<UpdateCourseResponse>;
}
//# sourceMappingURL=UpdateCourseUseCase.d.ts.map