export interface AuthenticatedRequest extends Request {
    usuario?: {
        id_usu: string;
        rol: string;
        ced_usu: string;
    };
    uid?: string;
}
import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
/**
 * Controlador para gestión de cursos
 * Maneja todas las operaciones CRUD y funcionalidades relacionadas con cursos
 */
export declare class CourseController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * GET /api/courses
     * Get all courses (based on original obtenerCursos function)
     */
    getCourses(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/courses/:id
     * Get course by ID (based on original obtenerCursoPorId function)
     */
    getCourseById(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/courses
     * Create new course (based on original crearCurso function)
     */
    createCourse(req: Request, res: Response): Promise<void>;
    /**
     * PUT /api/courses/:id
     * Update existing course (Admin only)
     */
    updateCourse(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * DELETE /api/courses/:id
     * Delete course (Admin only) - Soft delete
     */
    deleteCourse(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/courses/:id/cerrar
     * Close course and generate certificates (Admin only)
     */
    closeCourse(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/cursos (Legacy route for frontend compatibility)
     * Get all courses with admin details
     */
    getCursosAdmin(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=CourseController.d.ts.map