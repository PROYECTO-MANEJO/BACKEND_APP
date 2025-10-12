"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseRoutes = void 0;
const express_1 = require("express");
const CourseController_1 = require("../controllers/CourseController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
class CourseRoutes {
    constructor(container) {
        this.router = (0, express_1.Router)();
        this.courseController = new CourseController_1.CourseController(container);
        this.setupRoutes();
    }
    setupRoutes() {
        /**
         * GET /api/courses
         * Obtener lista de cursos (público con paginación)
         */
        this.router.get('/', authMiddleware_1.optionalAuth, validationMiddleware_1.validatePagination, validationMiddleware_1.handleValidationErrors, this.courseController.getCourses.bind(this.courseController));
        /**
         * GET /api/courses/available
         * Obtener cursos disponibles para inscripción
         */
        this.router.get('/available', authMiddleware_1.authenticateToken, validationMiddleware_1.validatePagination, validationMiddleware_1.handleValidationErrors, this.courseController.getAvailableCourses.bind(this.courseController));
        /**
         * GET /api/courses/my-courses
         * Obtener mis cursos inscritos
         */
        this.router.get('/my-courses', authMiddleware_1.authenticateToken, validationMiddleware_1.validatePagination, validationMiddleware_1.handleValidationErrors, this.courseController.getUserCourses.bind(this.courseController));
        /**
         * GET /api/courses/:id
         * Obtener curso por ID (público)
         */
        this.router.get('/:id', validationMiddleware_1.validateIdParam, validationMiddleware_1.handleValidationErrors, this.courseController.getCourseById.bind(this.courseController));
        /**
         * POST /api/courses
         * Crear nuevo curso (solo organizadores y administradores)
         */
        this.router.post('/', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorize)('organizador', 'administrador'), validationMiddleware_1.validateCourseCreation, validationMiddleware_1.handleValidationErrors, this.courseController.createCourse.bind(this.courseController));
        /**
         * PUT /api/courses/:id
         * Actualizar curso (solo organizadores y administradores)
         */
        this.router.put('/:id', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorize)('organizador', 'administrador'), validationMiddleware_1.validateIdParam, validationMiddleware_1.handleValidationErrors, this.courseController.updateCourse.bind(this.courseController));
        /**
         * DELETE /api/courses/:id
         * Eliminar curso (solo administradores)
         */
        this.router.delete('/:id', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorize)('administrador'), validationMiddleware_1.validateIdParam, validationMiddleware_1.handleValidationErrors, this.courseController.deleteCourse.bind(this.courseController));
        /**
         * POST /api/courses/:id/enroll
         * Inscribirse a un curso
         */
        this.router.post('/:id/enroll', authMiddleware_1.authenticateToken, validationMiddleware_1.validateIdParam, validationMiddleware_1.handleValidationErrors, this.courseController.enrollToCourse.bind(this.courseController));
        /**
         * GET /api/courses/:id/enrollments
         * Obtener inscripciones de un curso (solo organizadores y administradores)
         */
        this.router.get('/:id/enrollments', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorize)('organizador', 'administrador'), validationMiddleware_1.validateIdParam, validationMiddleware_1.validatePagination, validationMiddleware_1.handleValidationErrors, this.courseController.getCourseEnrollments.bind(this.courseController));
    }
    getRouter() {
        return this.router;
    }
}
exports.CourseRoutes = CourseRoutes;
