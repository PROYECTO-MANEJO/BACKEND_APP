/**
 * CreateCourseUseCase - Application Layer
 *
 * Caso de uso para crear un nuevo curso en el sistema.
 */
import { CourseData } from "../../../domain/entities/Course";
import { CourseManagementService } from "../../../domain/services/CourseManagementService";
export interface CreateCourseRequest {
    nom_cur: string;
    des_cur: string;
    dur_cur: number;
    fec_ini_cur: Date;
    fec_fin_cur: Date;
    id_cat_cur: number;
    ced_org_cur: string;
    capacidad_max_cur: number;
    tipo_audiencia_cur: string;
    requiere_verificacion_docs?: boolean;
    es_gratuito: boolean;
    precio?: number;
    porcentaje_asistencia_aprobacion: number;
    nota_minima_aprobacion: number;
    carreras?: number[];
}
export interface CreateCourseResponse {
    success: boolean;
    course?: CourseData;
    error?: string;
}
export declare class CreateCourseUseCase {
    private courseManagementService;
    constructor(courseManagementService: CourseManagementService);
    execute(request: CreateCourseRequest): Promise<CreateCourseResponse>;
}
//# sourceMappingURL=CreateCourseUseCase.d.ts.map