"use strict";
/**
 * Course Service - Application Layer
 *
 * Responsabilidad única: Operaciones de negocio para cursos
 * Aplica SRP separando la lógica de negocio del controlador
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseService = void 0;
const Course_1 = require("../../domain/entities/Course");
const CourseValidator_1 = require("../../domain/validators/CourseValidator");
const CourseBusinessRules_1 = require("../../domain/services/CourseBusinessRules");
class CourseService {
    constructor(container) {
        this.container = container;
    }
    /**
     * Helper para mapear CourseData del repositorio a CourseEntityData
     */
    mapToEntityData(courseData) {
        return {
            id: courseData.id,
            nom_cur: courseData.name,
            des_cur: courseData.description,
            dur_cur: courseData.duration,
            fec_ini_cur: courseData.startDate,
            fec_fin_cur: courseData.endDate,
            id_cat_cur: parseInt(courseData.categoryId),
            ced_org_cur: courseData.organizerId,
            capacidad_max_cur: courseData.maxCapacity,
            tipo_audiencia_cur: courseData.audienceType,
            requiere_verificacion_docs: courseData.requiresDocumentVerification,
            es_gratuito: courseData.isFree,
            precio: courseData.price,
            porcentaje_asistencia_aprobacion: courseData.attendanceApprovalPercentage,
            nota_minima_aprobacion: courseData.minimumGradeApproval,
            estado_cur: courseData.status,
        };
    }
    /**
     * Crear un nuevo curso
     */
    async createCourse(courseRequest) {
        const courseRepository = this.container.getCourseRepository();
        // ✅ SRP: Delegar validación al CourseValidator
        CourseValidator_1.CourseValidator.validate({
            nom_cur: courseRequest.nom_cur,
            des_cur: courseRequest.des_cur,
            dur_cur: courseRequest.dur_cur,
            fec_ini_cur: courseRequest.fec_ini_cur,
            fec_fin_cur: courseRequest.fec_fin_cur,
            id_cat_cur: courseRequest.id_cat_cur,
            ced_org_cur: courseRequest.ced_org_cur,
            capacidad_max_cur: courseRequest.capacidad_max_cur,
            tipo_audiencia_cur: courseRequest.tipo_audiencia_cur,
            requiere_verificacion_docs: courseRequest.requiere_verificacion_docs || false,
            es_gratuito: courseRequest.es_gratuito,
            precio: courseRequest.precio,
            porcentaje_asistencia_aprobacion: courseRequest.porcentaje_asistencia_aprobacion,
            nota_minima_aprobacion: courseRequest.nota_minima_aprobacion,
            estado_cur: "ACTIVO",
        });
        // ✅ SRP: Crear el curso - mapear datos del formato DB al formato del dominio
        const savedCourseData = await courseRepository.create({
            name: courseRequest.nom_cur,
            description: courseRequest.des_cur,
            duration: courseRequest.dur_cur,
            startDate: courseRequest.fec_ini_cur,
            endDate: courseRequest.fec_fin_cur,
            categoryId: courseRequest.id_cat_cur,
            organizerId: courseRequest.ced_org_cur,
            maxCapacity: courseRequest.capacidad_max_cur,
            audienceType: courseRequest.tipo_audiencia_cur,
            requiresDocumentVerification: courseRequest.requiere_verificacion_docs || false,
            isFree: courseRequest.es_gratuito,
            price: courseRequest.precio,
            attendanceApprovalPercentage: courseRequest.porcentaje_asistencia_aprobacion,
            minimumGradeApproval: courseRequest.nota_minima_aprobacion,
            status: "ACTIVO",
            requiresMotivationLetter: false,
            associatedCareers: courseRequest.carreras || [],
        });
        return new Course_1.Course(this.mapToEntityData(savedCourseData));
    }
    /**
     * Obtener curso por ID
     */
    async getCourseById(id) {
        const courseRepository = this.container.getCourseRepository();
        const courseData = await courseRepository.findById(id);
        if (!courseData)
            return null;
        return new Course_1.Course(this.mapToEntityData(courseData));
    }
    /**
     * Obtener todos los cursos
     */
    async getAllCourses() {
        const courseRepository = this.container.getCourseRepository();
        const coursesData = await courseRepository.findAll();
        return coursesData.map((courseData) => new Course_1.Course(this.mapToEntityData(courseData)));
    }
    /**
     * Actualizar curso
     */
    async updateCourse(id, updateData) {
        const courseRepository = this.container.getCourseRepository();
        // Obtener curso existente
        const existingCourseData = await courseRepository.findById(id);
        if (!existingCourseData) {
            throw new Error("Course not found");
        }
        // ✅ SRP: Delegar validaciones al CourseValidator para cada campo
        if (updateData.nom_cur !== undefined) {
            CourseValidator_1.CourseValidator.validateName(updateData.nom_cur);
        }
        if (updateData.des_cur !== undefined) {
            CourseValidator_1.CourseValidator.validateDescription(updateData.des_cur);
        }
        if (updateData.capacidad_max_cur !== undefined) {
            CourseValidator_1.CourseValidator.validateCapacityValue(updateData.capacidad_max_cur);
        }
        // ✅ SRP: Delegar reglas de negocio al CourseBusinessRules
        if (!CourseBusinessRules_1.CourseBusinessRules.canBeEdited(existingCourseData)) {
            throw new Error("Course cannot be updated in its current state");
        }
        // Actualizar el curso
        const updatedCourseData = await courseRepository.update(id, updateData);
        if (!updatedCourseData) {
            throw new Error("Failed to update course");
        }
        return new Course_1.Course(updatedCourseData);
    }
    /**
     * Eliminar curso
     */
    async deleteCourse(id) {
        const courseRepository = this.container.getCourseRepository();
        // Verificar que el curso existe
        const existingCourseData = await courseRepository.findById(id);
        if (!existingCourseData) {
            throw new Error("Course not found");
        }
        // ✅ SRP: Delegar reglas de negocio al CourseBusinessRules
        if (!CourseBusinessRules_1.CourseBusinessRules.canBeDeleted(existingCourseData)) {
            throw new Error("Course cannot be deleted due to existing registrations");
        }
        await courseRepository.delete(id);
    }
    /**
     * Cerrar curso
     */
    async closeCourse(id) {
        const courseRepository = this.container.getCourseRepository();
        // Obtener curso existente
        const existingCourseData = await courseRepository.findById(id);
        if (!existingCourseData) {
            throw new Error("Course not found");
        }
        // ✅ SRP: Delegar reglas de negocio al CourseBusinessRules
        const existingCourse = new Course_1.Course(existingCourseData);
        CourseBusinessRules_1.CourseBusinessRules.closeCourse(existingCourse);
        // Actualizar estado
        const updatedData = existingCourse.toPlainObject();
        const updatedCourseData = await courseRepository.update(id, {
            estado_cur: updatedData.estado_cur,
        });
        if (!updatedCourseData) {
            throw new Error("Failed to close course");
        }
        return new Course_1.Course(updatedCourseData);
    }
}
exports.CourseService = CourseService;
//# sourceMappingURL=CourseService.js.map