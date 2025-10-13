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
 * Course Controller - Presentation Layer
 *
 * ✅ SRP: Responsabilidad única - Manejo de HTTP requests/responses para cursos
 * - Delega validaciones a CourseValidator
 * - Delega lógica de negocio a CourseService
 * - Delega transformaciones a CourseDTOTransformer
 */
export declare class CourseController extends BaseController {
    private courseService;
    constructor(container: DIContainer);
    /**
     * GET /api/courses
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    getCourses(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/courses/:id
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    getCourseById(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/courses
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    createCourse(req: Request, res: Response): Promise<void>;
    /**
     * PUT /api/courses/:id
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    updateCourse(req: Request, res: Response): Promise<void>;
    /**
     * DELETE /api/courses/:id
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    deleteCourse(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/courses/:id/close
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    closeCourse(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/cursos (Admin)
     * ✅ SRP: Solo maneja HTTP request/response para admin, delega todo lo demás
     */
    getCursosAdmin(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/courses/available
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    getAvailableCourses(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/courses/my-courses
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    getMyCourses(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=CourseController.old.d.ts.map