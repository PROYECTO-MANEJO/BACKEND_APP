import { Request, Response } from 'express';
export declare abstract class BaseController {
    /**
     * Ejecuta un caso de uso y maneja la respuesta HTTP
     */
    protected execute(req: Request, res: Response, useCase: () => Promise<any>): Promise<void>;
    /**
     * Respuesta exitosa (200)
     */
    protected ok(res: Response, data?: any): void;
    /**
     * Respuesta de creación exitosa (201)
     */
    protected created(res: Response, data?: any): void;
    /**
     * Respuesta sin contenido (204)
     */
    protected noContent(res: Response): void;
    /**
     * Respuesta de error de cliente (400)
     */
    protected badRequest(res: Response, message: string): void;
    /**
     * Respuesta de no autorizado (401)
     */
    protected unauthorized(res: Response, message?: string): void;
    /**
     * Respuesta de prohibido (403)
     */
    protected forbidden(res: Response, message?: string): void;
    /**
     * Respuesta de no encontrado (404)
     */
    protected notFound(res: Response, message?: string): void;
    /**
     * Respuesta de conflicto (409)
     */
    protected conflict(res: Response, message: string): void;
    /**
     * Respuesta de error interno del servidor (500)
     */
    protected internalError(res: Response, message?: string): void;
    /**
     * Manejo centralizado de errores
     */
    private handleError;
    /**
     * Extrae parámetros de paginación de la query string
     */
    protected getPaginationParams(req: Request): {
        page: number;
        pageSize: number;
    };
    /**
     * Extrae el ID del usuario autenticado desde el middleware de autenticación
     */
    protected getUserId(req: Request): number;
    /**
     * Extrae el rol del usuario autenticado desde el middleware de autenticación
     */
    protected getUserRole(req: Request): string;
}
//# sourceMappingURL=BaseController.d.ts.map