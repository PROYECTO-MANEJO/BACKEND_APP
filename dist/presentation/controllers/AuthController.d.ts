import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { DIContainer } from '../../infrastructure/config/DIContainer';
export declare class AuthController extends BaseController {
    private container;
    constructor(container: DIContainer);
    /**
     * POST /api/auth/login
     * Iniciar sesión de usuario
     */
    login(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/auth/register
     * Registrar nuevo usuario
     */
    register(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/auth/logout
     * Cerrar sesión de usuario
     */
    logout(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/auth/profile
     * Obtener perfil del usuario autenticado
     */
    getProfile(req: Request, res: Response): Promise<void>;
    /**
     * PUT /api/auth/profile
     * Actualizar perfil del usuario autenticado
     */
    updateProfile(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/auth/change-password
     * Cambiar contraseña del usuario autenticado
     */
    changePassword(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/auth/forgot-password
     * Solicitar restablecimiento de contraseña
     */
    forgotPassword(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/auth/reset-password
     * Confirmar restablecimiento de contraseña
     */
    resetPassword(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/auth/verify-email
     * Verificar email de usuario
     */
    verifyEmail(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/auth/resend-verification
     * Reenviar email de verificación
     */
    resendVerification(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/auth/refresh-token
     * Refrescar token de acceso
     */
    refreshToken(req: Request, res: Response): Promise<void>;
    /**
     * Mapea un usuario del dominio a DTO de respuesta
     * TODO: Define proper User type when domain layer is available
     */
    private mapToUserResponse;
}
//# sourceMappingURL=AuthController.d.ts.map