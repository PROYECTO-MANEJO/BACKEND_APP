/**
 * Course Service - Application Layer
 *
 * Responsabilidad única: Operaciones de negocio para cursos
 * Aplica SRP separando la lógica de negocio del controlador
 */
import { Course } from "../../domain/entities/Course";
import { DIContainer } from "../../infrastructure/DIContainer";
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
    precio?: number | null;
    porcentaje_asistencia_aprobacion: number;
    nota_minima_aprobacion: number;
    carreras?: string[];
}
export interface UpdateCourseRequest {
    nom_cur?: string;
    des_cur?: string;
    capacidad_max_cur?: number;
    precio?: number;
    estado_cur?: string;
}
export declare class CourseService {
    private container;
    constructor(container: DIContainer);
    /**
     * Helper para mapear CourseData del repositorio a CourseEntityData
     */
    private mapToEntityData;
    /**
     * Crear un nuevo curso
     */
    createCourse(courseRequest: CreateCourseRequest): Promise<Course>;
    /**
     * Obtener curso por ID
     */
    getCourseById(id: string): Promise<Course | null>;
    /**
     * Obtener todos los cursos
     */
    getAllCourses(): Promise<Course[]>;
    /**
     * Actualizar curso
     */
    updateCourse(id: string, updateData: UpdateCourseRequest): Promise<Course>;
    /**
     * Eliminar curso
     */
    deleteCourse(id: string): Promise<void>;
    /**
     * Cerrar curso
     */
    closeCourse(id: string): Promise<Course>;
}
//# sourceMappingURL=CourseService.d.ts.map