"use strict";
/**
 * Course DTO - Presentation Layer
 *
 * ✅ SRP: Responsabilidad única - Transformación de datos de cursos
 * Similar al patrón usado en EventDTO
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseDTOTransformer = void 0;
/**
 * Course DTO Transformer
 * ✅ SRP: Solo transformación entre Course domain entity y DTOs
 */
class CourseDTOTransformer {
    /**
     * Convertir Course entity a DTO de respuesta
     */
    static toResponseDTO(course) {
        const courseData = course.toPlainObject();
        return {
            id_cur: courseData.id || "",
            nom_cur: courseData.nom_cur,
            des_cur: courseData.des_cur,
            dur_cur: courseData.dur_cur,
            fec_ini_cur: courseData.fec_ini_cur
                ? courseData.fec_ini_cur.toISOString()
                : "",
            fec_fin_cur: courseData.fec_fin_cur
                ? courseData.fec_fin_cur.toISOString()
                : "",
            id_cat_cur: courseData.id_cat_cur,
            ced_org_cur: courseData.ced_org_cur,
            capacidad_max_cur: courseData.capacidad_max_cur,
            precio: courseData.precio?.toString() || null,
            es_gratuito: courseData.es_gratuito,
            tipo_audiencia_cur: courseData.tipo_audiencia_cur,
            requiere_verificacion_docs: courseData.requiere_verificacion_docs || false,
            porcentaje_asistencia_aprobacion: courseData.porcentaje_asistencia_aprobacion,
            nota_minima_aprobacion: courseData.nota_minima_aprobacion,
            estado: courseData.estado_cur || "ACTIVO",
        };
    }
    /**
     * Convertir array de Course entities a DTOs de respuesta
     */
    static toResponseDTOList(courses) {
        return courses.map((course) => this.toResponseDTO(course));
    }
    /**
     * Convertir CreateCourseDTO a datos del dominio
     */
    static fromCreateDTO(dto) {
        return {
            nom_cur: dto.nom_cur.trim(),
            des_cur: dto.des_cur.trim(),
            dur_cur: dto.dur_cur,
            fec_ini_cur: new Date(dto.fec_ini_cur),
            fec_fin_cur: new Date(dto.fec_fin_cur),
            id_cat_cur: dto.id_cat_cur,
            ced_org_cur: dto.ced_org_cur.trim(),
            capacidad_max_cur: dto.capacidad_max_cur,
            tipo_audiencia_cur: dto.tipo_audiencia_cur,
            requiere_verificacion_docs: dto.requiere_verificacion_docs || false,
            es_gratuito: dto.es_gratuito,
            precio: dto.es_gratuito ? null : dto.precio,
            porcentaje_asistencia_aprobacion: dto.porcentaje_asistencia_aprobacion,
            nota_minima_aprobacion: dto.nota_minima_aprobacion,
            estado_cur: "ACTIVO",
            carreras: dto.carreras_seleccionadas,
        };
    }
    /**
     * Validar tipos básicos del DTO
     */
    static validateBasicTypes(dto) {
        // Validar que los tipos sean correctos
        if (typeof dto.nom_cur !== "string") {
            throw new Error("Course name must be a string");
        }
        if (typeof dto.des_cur !== "string") {
            throw new Error("Course description must be a string");
        }
        if (typeof dto.dur_cur !== "number" || dto.dur_cur <= 0) {
            throw new Error("Duration must be a positive number");
        }
        if (typeof dto.capacidad_max_cur !== "number" ||
            dto.capacidad_max_cur <= 0) {
            throw new Error("Capacity must be a positive number");
        }
        if (typeof dto.porcentaje_asistencia_aprobacion !== "number" ||
            dto.porcentaje_asistencia_aprobacion < 0 ||
            dto.porcentaje_asistencia_aprobacion > 100) {
            throw new Error("Attendance percentage must be between 0 and 100");
        }
        if (typeof dto.nota_minima_aprobacion !== "number" ||
            dto.nota_minima_aprobacion < 0 ||
            dto.nota_minima_aprobacion > 100) {
            throw new Error("Minimum grade must be between 0 and 100");
        }
        if (typeof dto.es_gratuito !== "boolean") {
            throw new Error("es_gratuito must be a boolean");
        }
        if (!dto.es_gratuito &&
            (typeof dto.precio !== "number" || dto.precio <= 0)) {
            throw new Error("Price must be a positive number for paid courses");
        }
        // Validar fechas
        const fechaInicio = new Date(dto.fec_ini_cur);
        const fechaFin = new Date(dto.fec_fin_cur);
        if (isNaN(fechaInicio.getTime())) {
            throw new Error("Invalid start date format");
        }
        if (isNaN(fechaFin.getTime())) {
            throw new Error("Invalid end date format");
        }
        if (fechaFin <= fechaInicio) {
            throw new Error("End date must be after start date");
        }
    }
}
exports.CourseDTOTransformer = CourseDTOTransformer;
//# sourceMappingURL=CourseDTO.js.map