"use strict";
/**
 * Course Management Service - Domain Layer
 *
 * Servicio de dominio que maneja la lógica de negocio compleja
 * para la gestión de cursos y sus operaciones.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseManagementService = void 0;
const Course_1 = require("../entities/Course");
class CourseManagementService {
    constructor(courseRepository, categoryRepository, userRepository, careerRepository) {
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.careerRepository = careerRepository;
    }
    /**
     * ✅ CREAR CURSO
     */
    async createCourse(courseData) {
        // 1. Validar que la categoría existe
        const categoryExists = await this.categoryRepository.existsById(courseData.id_cat_cur);
        if (!categoryExists) {
            throw new Error('La categoría especificada no existe');
        }
        // 2. Validar que el organizador existe
        const organizerExists = await this.userRepository.exists(courseData.ced_org_cur);
        if (!organizerExists) {
            throw new Error('El organizador especificado no existe');
        }
        // 3. Validar conflictos de horario del organizador
        const conflictingCourses = await this.courseRepository.findConflictingCourses(courseData.ced_org_cur, courseData.fec_ini_cur, courseData.fec_fin_cur);
        if (conflictingCourses.length > 0) {
            throw new Error('El organizador ya tiene cursos programados en las fechas especificadas');
        }
        // 4. Validar carreras si es para carrera específica
        if (courseData.tipo_audiencia_cur === 'CARRERA_ESPECIFICA' && courseData.carreras) {
            await this.validateCareerIds(courseData.carreras);
        }
        // 5. Crear la entidad Course (validaciones automáticas)
        const course = new Course_1.Course(courseData);
        // 6. Guardar en repositorio
        return await this.courseRepository.create(course);
    }
    /**
     * ✅ ACTUALIZAR CURSO
     */
    async updateCourse(courseId, updateData) {
        // 1. Obtener curso existente
        const existingCourse = await this.courseRepository.findById(courseId);
        if (!existingCourse) {
            throw new Error('Curso no encontrado');
        }
        // 2. Verificar si puede ser actualizado
        if (!existingCourse.canBeUpdated()) {
            throw new Error('El curso no puede ser actualizado en su estado actual');
        }
        // 3. Validar categoría si se está cambiando
        if (updateData.id_cat_cur) {
            const categoryExists = await this.categoryRepository.existsById(updateData.id_cat_cur);
            if (!categoryExists) {
                throw new Error('La nueva categoría especificada no existe');
            }
        }
        // 4. Validar conflictos de horario si se cambian las fechas
        if (updateData.fec_ini_cur || updateData.fec_fin_cur) {
            const startDate = updateData.fec_ini_cur || existingCourse.fec_ini_cur;
            const endDate = updateData.fec_fin_cur || existingCourse.fec_fin_cur;
            const conflictingCourses = await this.courseRepository.findConflictingCourses(existingCourse.ced_org_cur, startDate, endDate, courseId);
            if (conflictingCourses.length > 0) {
                throw new Error('Las nuevas fechas conflictan con otros cursos del organizador');
            }
        }
        // 5. Validar capacidad vs inscripciones actuales
        if (updateData.capacidad_max_cur) {
            const enrolledCount = await this.courseRepository.getEnrolledCount(courseId);
            if (updateData.capacidad_max_cur < enrolledCount) {
                throw new Error(`No se puede reducir la capacidad por debajo del número actual de inscritos (${enrolledCount})`);
            }
        }
        // 6. Aplicar actualización usando método de la entidad
        existingCourse.updateBasicInfo(updateData);
        // 7. Guardar cambios
        return await this.courseRepository.update(courseId, existingCourse);
    }
    /**
     * ✅ CERRAR CURSO
     */
    async closeCourse(courseId, organizerId) {
        // 1. Obtener curso
        const course = await this.courseRepository.findById(courseId);
        if (!course) {
            throw new Error('Curso no encontrado');
        }
        // 2. Verificar que el organizador es el dueño
        if (course.ced_org_cur !== organizerId) {
            throw new Error('Solo el organizador puede cerrar el curso');
        }
        // 3. Verificar que puede ser cerrado
        if (!course.canBeClosed()) {
            throw new Error('El curso no puede ser cerrado en este momento');
        }
        // 4. Cerrar curso
        course.close();
        // 5. Guardar cambios
        return await this.courseRepository.update(courseId, course);
    }
    /**
     * ✅ ELIMINAR CURSO
     */
    async deleteCourse(courseId, organizerId) {
        // 1. Obtener curso
        const course = await this.courseRepository.findById(courseId);
        if (!course) {
            throw new Error('Curso no encontrado');
        }
        // 2. Verificar que el organizador es el dueño
        if (course.ced_org_cur !== organizerId) {
            throw new Error('Solo el organizador puede eliminar el curso');
        }
        // 3. Verificar que puede ser eliminado
        if (!course.canBeDeleted()) {
            throw new Error('El curso no puede ser eliminado en su estado actual');
        }
        // 4. Verificar que no hay inscripciones
        const enrolledCount = await this.courseRepository.getEnrolledCount(courseId);
        if (enrolledCount > 0) {
            throw new Error('No se puede eliminar un curso que tiene inscripciones');
        }
        // 5. Eliminar
        await this.courseRepository.delete(courseId);
    }
    /**
     * ✅ ACTUALIZAR CARRERAS DEL CURSO
     */
    async updateCourseCarerIds(courseId, careerIds, organizerId) {
        // 1. Obtener curso
        const course = await this.courseRepository.findById(courseId);
        if (!course) {
            throw new Error('Curso no encontrado');
        }
        // 2. Verificar permisos
        if (course.ced_org_cur !== organizerId) {
            throw new Error('Solo el organizador puede actualizar las carreras del curso');
        }
        // 3. Verificar que puede ser actualizado
        if (!course.canBeUpdated()) {
            throw new Error('El curso no puede ser actualizado en su estado actual');
        }
        // 4. Validar que el curso es para carrera específica
        if (!course.isForSpecificCareer()) {
            throw new Error('Solo los cursos de carrera específica pueden tener carreras asignadas');
        }
        // 5. Validar que las carreras existen
        await this.validateCareerIds(careerIds);
        // 6. Actualizar carreras
        await this.courseRepository.updateCourseCareerIds(courseId, careerIds);
        // 7. Retornar curso actualizado
        return await this.courseRepository.findById(courseId);
    }
    /**
     * ✅ OBTENER CURSOS DISPONIBLES PARA USUARIO
     */
    async getAvailableCoursesForUser(userId) {
        // Si no hay usuario, retornar cursos públicos
        if (!userId) {
            return await this.courseRepository.findAvailableCourses();
        }
        // Validar que el usuario existe
        const userExists = await this.userRepository.exists(userId);
        if (!userExists) {
            throw new Error('Usuario no encontrado');
        }
        return await this.courseRepository.findAvailableCourses(userId);
    }
    /**
     * ✅ OBTENER CURSOS DEL USUARIO
     */
    async getUserCourses(userId) {
        // Validar que el usuario existe
        const userExists = await this.userRepository.exists(userId);
        if (!userExists) {
            throw new Error('Usuario no encontrado');
        }
        return await this.courseRepository.findUserCourses(userId);
    }
    /**
     * ✅ VERIFICAR DISPONIBILIDAD DE INSCRIPCIÓN
     */
    async canUserEnroll(courseId, userId) {
        // 1. Obtener curso
        const course = await this.courseRepository.findById(courseId);
        if (!course) {
            return { canEnroll: false, reason: 'Curso no encontrado' };
        }
        // 2. Verificar estado del curso
        if (!course.isActive() || !course.isUpcoming()) {
            return { canEnroll: false, reason: 'El curso no está disponible para inscripción' };
        }
        // 3. Verificar si ya está inscrito
        const isAlreadyEnrolled = await this.courseRepository.isUserEnrolled(courseId, userId);
        if (isAlreadyEnrolled) {
            return { canEnroll: false, reason: 'Ya estás inscrito en este curso' };
        }
        // 4. Verificar capacidad
        const hasCapacity = await this.courseRepository.hasAvailableCapacity(courseId);
        if (!hasCapacity) {
            return { canEnroll: false, reason: 'El curso ha alcanzado su capacidad máxima' };
        }
        // 5. Verificar elegibilidad por carrera si aplica
        if (course.isForSpecificCareer()) {
            const courseCareerIds = await this.courseRepository.getCourseCareerIds(courseId);
            const user = await this.userRepository.findById(userId);
            if (!user || !user.id_carrera || !courseCareerIds.includes(user.id_carrera)) {
                return { canEnroll: false, reason: 'Este curso no está disponible para tu carrera' };
            }
        }
        return { canEnroll: true };
    }
    /**
     * ✅ VALIDACIONES AUXILIARES
     */
    async validateCareerIds(careerIds) {
        if (!careerIds || careerIds.length === 0) {
            throw new Error('Debe especificar al menos una carrera');
        }
        const existingCareers = await this.careerRepository.findByIds(careerIds);
        if (existingCareers.length !== careerIds.length) {
            throw new Error('Una o más carreras especificadas no existen');
        }
    }
    /**
     * ✅ OBTENER ESTADÍSTICAS DEL CURSO
     */
    async getCourseStatistics(courseId) {
        const course = await this.courseRepository.findById(courseId);
        if (!course) {
            throw new Error('Curso no encontrado');
        }
        const enrolledCount = await this.courseRepository.getEnrolledCount(courseId);
        const availableSpots = course.capacidad_max_cur - enrolledCount;
        const capacityPercentage = (enrolledCount / course.capacidad_max_cur) * 100;
        const canEnroll = availableSpots > 0 && course.isUpcoming() && course.isActive();
        return {
            enrolledCount,
            availableSpots,
            capacityPercentage: Math.round(capacityPercentage * 100) / 100, // 2 decimales
            canEnroll
        };
    }
    /**
     * ✅ VALIDAR CONFLICTOS DE HORARIO
     */
    async validateScheduleConflicts(organizerId, startDate, endDate, excludeCourseId) {
        return await this.courseRepository.findConflictingCourses(organizerId, startDate, endDate, excludeCourseId);
    }
}
exports.CourseManagementService = CourseManagementService;
//# sourceMappingURL=CourseManagementService.js.map