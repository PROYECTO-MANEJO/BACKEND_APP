import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { DIContainer } from '../../infrastructure/config/DIContainer';
/**
 * Controlador para gestión de cursos
 * Maneja todas las operaciones CRUD y funcionalidades relacionadas con cursos
 */
export declare class CourseController extends BaseController {
    constructor(container: DIContainer);
    /**
     * GET /api/courses
     * Obtener lista de cursos con filtros
     */
    getCourses(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/courses/:id
     * Obtener curso por ID
     */
    getCourseById(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/courses
     * Crear nuevo curso
     */
    createCourse(req: Request, res: Response): Promise<void>;
    /**
     * PUT /api/courses/:id
     * Actualizar curso
     */
    updateCourse(req: Request, res: Response): Promise<void>;
    /**
     * DELETE /api/courses/:id
     * Eliminar curso
     */
    deleteCourse(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/courses/:id/enroll
     * Inscribirse a un curso
     */
    enrollToCourse(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/courses/:id/enrollments
     * Obtener inscripciones de un curso (solo para administradores/instructores)
     */
    getCourseEnrollments(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/courses/available
     * Obtener cursos disponibles para inscripción
     */
    getAvailableCourses(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/courses/my-courses
     * Obtener cursos del usuario autenticado
     */
    getUserCourses(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=CourseController.d.ts.map