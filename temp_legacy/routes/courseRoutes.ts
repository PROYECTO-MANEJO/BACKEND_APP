import { Router } from "express";
import { CourseController } from "../controllers/CourseController";
import {
  authenticateToken,
  authorize,
  optionalAuth,
} from "../middleware/authMiddleware";
import {
  handleValidationErrors,
  validateCourseCreation,
  validatePagination,
  validateIdParam,
} from "../middleware/validationMiddleware";

export class CourseRoutes {
  private router: Router;
  private courseController: CourseController;

  constructor() {
    this.router = Router();
    this.courseController = new CourseController();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    /**
     * GET /api/courses
     * Obtener lista de cursos (público con paginación)
     */
    this.router.get(
      "/",
      optionalAuth,
      validatePagination,
      handleValidationErrors,
      this.courseController.getCourses.bind(this.courseController)
    );

    /**
     * GET /api/courses/available
     * Obtener cursos disponibles para inscripción
     */
    this.router.get(
      "/available",
      authenticateToken,
      validatePagination,
      handleValidationErrors,
      this.courseController.getAvailableCourses.bind(this.courseController)
    );

    /**
     * GET /api/courses/my-courses
     * Obtener mis cursos inscritos
     */
    this.router.get(
      "/my-courses",
      authenticateToken,
      validatePagination,
      handleValidationErrors,
      this.courseController.getUserCourses.bind(this.courseController)
    );

    /**
     * GET /api/courses/:id
     * Obtener curso por ID (público)
     */
    this.router.get(
      "/:id",
      validateIdParam,
      handleValidationErrors,
      this.courseController.getCourseById.bind(this.courseController)
    );

    /**
     * POST /api/courses
     * Crear nuevo curso (solo organizadores y administradores)
     */
    this.router.post(
      "/",
      authenticateToken,
      authorize("organizador", "administrador"),
      validateCourseCreation,
      handleValidationErrors,
      this.courseController.createCourse.bind(this.courseController)
    );

    /**
     * PUT /api/courses/:id
     * Actualizar curso (solo organizadores y administradores)
     */
    this.router.put(
      "/:id",
      authenticateToken,
      authorize("organizador", "administrador"),
      validateIdParam,
      handleValidationErrors,
      this.courseController.updateCourse.bind(this.courseController)
    );

    /**
     * DELETE /api/courses/:id
     * Eliminar curso (solo administradores)
     */
    this.router.delete(
      "/:id",
      authenticateToken,
      authorize("administrador"),
      validateIdParam,
      handleValidationErrors,
      this.courseController.deleteCourse.bind(this.courseController)
    );

    /**
     * POST /api/courses/:id/enroll
     * Inscribirse a un curso
     */
    this.router.post(
      "/:id/enroll",
      authenticateToken,
      validateIdParam,
      handleValidationErrors,
      this.courseController.enrollToCourse.bind(this.courseController)
    );

    /**
     * GET /api/courses/:id/enrollments
     * Obtener inscripciones de un curso (solo organizadores y administradores)
     */
    this.router.get(
      "/:id/enrollments",
      authenticateToken,
      authorize("organizador", "administrador"),
      validateIdParam,
      validatePagination,
      handleValidationErrors,
      this.courseController.getCourseEnrollments.bind(this.courseController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
