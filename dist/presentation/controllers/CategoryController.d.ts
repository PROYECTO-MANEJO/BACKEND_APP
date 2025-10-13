import { Request, Response } from 'express';
import { DIContainer } from '../../infrastructure/DIContainer';
interface AuthenticatedRequest extends Request {
    usuario?: {
        id_usu: string;
    };
    uid?: string;
    userRole?: string;
}
export declare class CategoryController {
    private container;
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
}
export {};
//# sourceMappingURL=CategoryController.d.ts.map