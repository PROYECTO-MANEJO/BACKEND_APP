/**
 * Course DTO - Presentation Layer
 *
 * ✅ SRP: Responsabilidad única - Transformación de datos de cursos
 * Similar al patrón usado en EventDTO
 */
import { Course, CourseData } from "../../domain/entities/Course";
export interface CreateCourseDTO {
    nom_cur: string;
    des_cur: string;
    dur_cur: number;
    fec_ini_cur: string;
    fec_fin_cur: string;
    id_cat_cur: number;
    ced_org_cur: string;
    capacidad_max_cur: number;
    tipo_audiencia_cur: string;
    requiere_verificacion_docs?: boolean;
    es_gratuito: boolean;
    precio?: number;
    porcentaje_asistencia_aprobacion: number;
    nota_minima_aprobacion: number;
    carreras_seleccionadas?: string[];
}
export interface UpdateCourseDTO {
    nom_cur?: string;
    des_cur?: string;
    capacidad_max_cur?: number;
    precio?: number;
    estado_cur?: string;
}
export interface CourseResponseDTO {
    id_cur: string;
    nom_cur: string;
    des_cur: string;
    dur_cur: number;
    fec_ini_cur: string;
    fec_fin_cur: string;
    id_cat_cur: number;
    ced_org_cur: string;
    capacidad_max_cur: number;
    precio: string | null;
    es_gratuito: boolean;
    tipo_audiencia_cur: string;
    requiere_verificacion_docs: boolean;
    porcentaje_asistencia_aprobacion: number;
    nota_minima_aprobacion: number;
    estado: string;
    categoria?: {
        id_cat: string;
        nom_cat: string;
    };
    organizador?: {
        ced_org: string;
        nom_org1: string;
        nom_org2: string;
        ape_org1: string;
        ape_org2: string;
    };
    total_inscripciones?: number;
    cupos_disponibles?: number;
}
/**
 * Course DTO Transformer
 * ✅ SRP: Solo transformación entre Course domain entity y DTOs
 */
export declare class CourseDTOTransformer {
    /**
     * Convertir Course entity a DTO de respuesta
     */
    static toResponseDTO(course: Course): CourseResponseDTO;
    /**
     * Convertir array de Course entities a DTOs de respuesta
     */
    static toResponseDTOList(courses: Course[]): CourseResponseDTO[];
    /**
     * Convertir CreateCourseDTO a datos del dominio
     */
    static fromCreateDTO(dto: CreateCourseDTO): CourseData;
    /**
     * Validar tipos básicos del DTO
     */
    static validateBasicTypes(dto: CreateCourseDTO): void;
}
//# sourceMappingURL=CourseDTO.d.ts.map