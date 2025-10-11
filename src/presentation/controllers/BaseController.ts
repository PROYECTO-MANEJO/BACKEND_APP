import { Request, Response } from 'express';

export abstract class BaseController {
  /**
   * Ejecuta un caso de uso y maneja la respuesta HTTP
   */
  protected async execute(
    req: Request,
    res: Response,
    useCase: () => Promise<any>
  ): Promise<void> {
    try {
      const result = await useCase();
      this.ok(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Respuesta exitosa (200)
   */
  protected ok(res: Response, data?: any): void {
    if (data) {
      res.status(200).json({
        success: true,
        data
      });
    } else {
      res.status(200).json({
        success: true
      });
    }
  }

  /**
   * Respuesta de creación exitosa (201)
   */
  protected created(res: Response, data?: any): void {
    if (data) {
      res.status(201).json({
        success: true,
        data
      });
    } else {
      res.status(201).json({
        success: true
      });
    }
  }

  /**
   * Respuesta sin contenido (204)
   */
  protected noContent(res: Response): void {
    res.status(204).send();
  }

  /**
   * Respuesta de error de cliente (400)
   */
  protected badRequest(res: Response, message: string): void {
    res.status(400).json({
      success: false,
      error: message
    });
  }

  /**
   * Respuesta de no autorizado (401)
   */
  protected unauthorized(res: Response, message: string = 'No autorizado'): void {
    res.status(401).json({
      success: false,
      error: message
    });
  }

  /**
   * Respuesta de prohibido (403)
   */
  protected forbidden(res: Response, message: string = 'Prohibido'): void {
    res.status(403).json({
      success: false,
      error: message
    });
  }

  /**
   * Respuesta de no encontrado (404)
   */
  protected notFound(res: Response, message: string = 'No encontrado'): void {
    res.status(404).json({
      success: false,
      error: message
    });
  }

  /**
   * Respuesta de conflicto (409)
   */
  protected conflict(res: Response, message: string): void {
    res.status(409).json({
      success: false,
      error: message
    });
  }

  /**
   * Respuesta de error interno del servidor (500)
   */
  protected internalError(res: Response, message: string = 'Error interno del servidor'): void {
    res.status(500).json({
      success: false,
      error: message
    });
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(res: Response, error: any): void {
    console.error('Controller Error:', error);

    // Errores de dominio (reglas de negocio)
    if (error.name === 'DomainError') {
      this.badRequest(res, error.message);
      return;
    }

    // Errores de validación
    if (error.name === 'ValidationError') {
      this.badRequest(res, error.message);
      return;
    }

    // Errores de no encontrado
    if (error.name === 'NotFoundError') {
      this.notFound(res, error.message);
      return;
    }

    // Errores de conflicto
    if (error.name === 'ConflictError') {
      this.conflict(res, error.message);
      return;
    }

    // Errores de autorización
    if (error.name === 'UnauthorizedError') {
      this.unauthorized(res, error.message);
      return;
    }

    // Errores de permisos
    if (error.name === 'ForbiddenError') {
      this.forbidden(res, error.message);
      return;
    }

    // Error genérico del servidor
    this.internalError(res, 'Ha ocurrido un error interno en el servidor');
  }

  /**
   * Extrae parámetros de paginación de la query string
   */
  protected getPaginationParams(req: Request): { page: number; pageSize: number } {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 10));
    
    return { page, pageSize };
  }

  /**
   * Extrae el ID del usuario autenticado desde el middleware de autenticación
   */
  protected getUserId(req: Request): number {
    return (req as any).userId;
  }

  /**
   * Extrae el rol del usuario autenticado desde el middleware de autenticación
   */
  protected getUserRole(req: Request): string {
    return (req as any).userRole;
  }
}