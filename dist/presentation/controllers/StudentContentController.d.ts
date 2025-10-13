import { Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { AuthenticatedRequest } from "../middleware/studentMiddleware";
export declare class StudentContentController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * GET /api/student/events/available
     * Obtener eventos disponibles para estudiantes (igual que Usuario Normal pero con validación de documentos)
     */
    getAvailableEvents(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/student/courses/available
     * Obtener cursos disponibles para estudiantes (igual que Usuario Normal pero con validación de documentos)
     */
    getAvailableCourses(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Verificar si un estudiante puede inscribirse (validación básica de documentos)
     */
    private canStudentEnroll;
    /**
     * Verificar si un estudiante puede inscribirse en un curso específico
     */
    private canStudentEnrollInCourse;
}
//# sourceMappingURL=StudentContentController.d.ts.map