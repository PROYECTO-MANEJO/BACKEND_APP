"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseController = void 0;
const BaseController_1 = require("./BaseController");
const CourseService_1 = require("../../application/services/CourseService");
const CourseDTO_1 = require("../dto/CourseDTO");
/**
 * Course Controller - Presentation Layer
 *
 * ✅ SRP: Responsabilidad única - Manejo de HTTP requests/responses para cursos
 * - Delega validaciones a CourseValidator
 * - Delega lógica de negocio a CourseService
 * - Delega transformaciones a CourseDTOTransformer
 */
class CourseController extends BaseController_1.BaseController {
    constructor(container) {
        super();
        this.courseService = new CourseService_1.CourseService(container);
    }
    /**
     * GET /api/courses
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    async getCourses(req, res) {
        await this.execute(req, res, async () => {
            // ✅ SRP: Delegar lógica de negocio al servicio
            const courses = await this.courseService.getAllCourses();
            // ✅ SRP: Delegar transformación al DTOTransformer
            const cursosFormateados = CourseDTO_1.CourseDTOTransformer.toResponseDTOList(courses);
            return {
                cursos: cursosFormateados,
                total: cursosFormateados.length,
            };
        });
    }
    /**
     * GET /api/courses/:id
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    async getCourseById(req, res) {
        await this.execute(req, res, async () => {
            const { id } = req.params;
            if (!id)
                throw new Error("ID is required");
            // ✅ SRP: Delegar lógica de negocio al servicio
            const course = await this.courseService.getCourseById(id);
            if (!course) {
                throw new Error("Course not found");
            }
            // ✅ SRP: Delegar transformación al DTOTransformer
            const cursoFormateado = CourseDTO_1.CourseDTOTransformer.toResponseDTO(course);
            return {
                curso: cursoFormateado,
            };
        });
    }
    /**
     * POST /api/courses
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    async createCourse(req, res) {
        await this.execute(req, res, async () => {
            // ✅ SRP: Validar estructura básica del request (responsabilidad del controlador)
            const requiredFields = [
                "nom_cur",
                "des_cur",
                "dur_cur",
                "fec_ini_cur",
                "fec_fin_cur",
                "id_cat_cur",
                "ced_org_cur",
                "capacidad_max_cur",
                "tipo_audiencia_cur",
                "porcentaje_asistencia_aprobacion",
                "nota_minima_aprobacion"
            ];
            for (const field of requiredFields) {
                if (req.body[field] == null) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }
            // ✅ SRP: Delegar transformación al DTOTransformer
            const createCourseDTO = req.body;
            // ✅ SRP: Validar tipos básicos (responsabilidad del DTOTransformer)
            CourseDTO_1.CourseDTOTransformer.validateBasicTypes(createCourseDTO);
            // ✅ SRP: Convertir DTO a datos del dominio (responsabilidad del DTOTransformer)
            const courseData = CourseDTO_1.CourseDTOTransformer.fromCreateDTO(createCourseDTO);
            // ✅ SRP: Delegar lógica de negocio al servicio
            const createdCourse = await this.courseService.createCourse({
                ...courseData,
                carreras: createCourseDTO.carreras_seleccionadas
            });
            // ✅ SRP: Delegar transformación de respuesta al DTOTransformer
            const cursoResponse = CourseDTO_1.CourseDTOTransformer.toResponseDTO(createdCourse);
            return {
                message: "Course created successfully",
                curso: cursoResponse,
            };
        });
    }
    /**
     * PUT /api/courses/:id
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    async updateCourse(req, res) {
        await this.execute(req, res, async () => {
            const { id } = req.params;
            if (!id)
                throw new Error("ID is required");
            // ✅ SRP: Delegar lógica de negocio al servicio
            const updatedCourse = await this.courseService.updateCourse(id, req.body);
            // ✅ SRP: Delegar transformación al DTOTransformer
            const cursoResponse = CourseDTO_1.CourseDTOTransformer.toResponseDTO(updatedCourse);
            return {
                message: "Course updated successfully",
                curso: cursoResponse,
            };
        });
    }
    /**
     * DELETE /api/courses/:id
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    async deleteCourse(req, res) {
        await this.execute(req, res, async () => {
            const { id } = req.params;
            if (!id)
                throw new Error("ID is required");
            // ✅ SRP: Delegar lógica de negocio al servicio
            await this.courseService.deleteCourse(id);
            return {
                message: "Course deleted successfully",
            };
        });
    }
    /**
     * POST /api/courses/:id/close
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    async closeCourse(req, res) {
        await this.execute(req, res, async () => {
            const { id } = req.params;
            if (!id)
                throw new Error("ID is required");
            // ✅ SRP: Delegar lógica de negocio al servicio
            const closedCourse = await this.courseService.closeCourse(id);
            // ✅ SRP: Delegar transformación al DTOTransformer
            const cursoResponse = CourseDTO_1.CourseDTOTransformer.toResponseDTO(closedCourse);
            return {
                message: "Course closed successfully",
                curso: cursoResponse,
            };
        });
    }
    /**
     * GET /api/cursos (Admin)
     * ✅ SRP: Solo maneja HTTP request/response para admin, delega todo lo demás
     */
    async getCursosAdmin(req, res) {
        await this.execute(req, res, async () => {
            // ✅ SRP: Delegar lógica de negocio al servicio
            const courses = await this.courseService.getAllCourses();
            // ✅ SRP: Delegar transformación al DTOTransformer
            const cursosFormateados = CourseDTO_1.CourseDTOTransformer.toResponseDTOList(courses);
            return {
                cursos: cursosFormateados,
                total: cursosFormateados.length,
            };
        });
    }
    /**
     * GET /api/courses/available
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    async getAvailableCourses(req, res) {
        await this.execute(req, res, async () => {
            // TODO: Implementar lógica para obtener cursos disponibles
            // Por ahora, devolver todos los cursos activos
            const courses = await this.courseService.getAllCourses();
            // Filtrar cursos activos y futuros
            const now = new Date();
            const availableCourses = courses.filter(course => {
                const courseData = course.toPlainObject();
                return courseData.estado_cur === 'ACTIVO' &&
                    new Date(courseData.fec_ini_cur) >= now;
            });
            const cursosFormateados = CourseDTO_1.CourseDTOTransformer.toResponseDTOList(availableCourses);
            return {
                cursos: cursosFormateados,
                total: cursosFormateados.length,
            };
        });
    }
    /**
     * GET /api/courses/my-courses
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    async getMyCourses(req, res) {
        await this.execute(req, res, async () => {
            // TODO: Implementar lógica para obtener cursos del usuario
            // Por ahora, devolver array vacío hasta implementar inscripciones
            return {
                cursos: [],
                total: 0,
            };
        });
    }
}
exports.CourseController = CourseController;
//# sourceMappingURL=CourseController.old.js.map