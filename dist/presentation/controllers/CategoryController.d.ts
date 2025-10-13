import { Request, Response } from "express";
import { DIContainer } from "../../infrastructure/DIContainer";
interface AuthenticatedRequest extends Request {
    usuario?: {
        id_usu: string;
    };
    uid?: string;
    userRole?: string;
}
export declare class CategoryController {
    private container;
    private categoryRepository;
    constructor(container: DIContainer);
    /**
     * GET /api/categorias
     * Obtener todas las categorías
     */
    getCategorias(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /api/categorias
     * Crear nueva categoría (Admin only)
     */
    createCategoria(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/categorias/:id
     * Obtener categoría por ID
     */
    getCategoriaById(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PUT /api/categorias/:id
     * Actualizar categoría (Admin only)
     */
    updateCategoria(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * DELETE /api/categorias/:id
     * Eliminar categoría (Admin only)
     */
    deleteCategoria(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/categorias/:id/eventos
     * Obtener eventos asociados a una categoría
     */
    getEventosByCategoria(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/categorias/:id/cursos
     * Obtener cursos asociados a una categoría
     */
    getCursosByCategoria(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=CategoryController.d.ts.map