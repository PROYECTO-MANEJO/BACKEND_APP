import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { DIContainer } from '../../infrastructure/config/DIContainer';
import {
  LoginRequestDTO,
  LoginResponseDTO,
  PasswordResetRequestDTO,
  PasswordResetConfirmDTO,
  ChangePasswordDTO,
  UserResponseDTO
} from '../dto/UserDTO';

export class AuthController extends BaseController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    super();
    this.container = container;
  }

  /**
   * POST /api/auth/login
   * Iniciar sesión de usuario
   */
  public async login(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const loginData: LoginRequestDTO = req.body;
      
      if (!loginData.email || !loginData.password) {
        throw new Error('Email y contraseña son requeridos');
      }

      // TODO: Implementar cuando estén disponibles los casos de uso
      const mockResponse: LoginResponseDTO = {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          cedula: '1234567890',
          nombres: 'Usuario Mock',
          apellidos: 'Apellido Mock',
          email: loginData.email,
          telefono: '0987654321',
          rol: 'estudiante',
          fechaCreacion: new Date(),
          estado: true
        },
        expiresIn: 3600
      };
      
      return mockResponse;
    });
  }

  /**
   * POST /api/auth/register
   * Registrar nuevo usuario
   */
  public async register(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const userData = req.body;
      
      // Validación básica
      if (!userData.cedula || !userData.firstName || !userData.lastName || !userData.email || !userData.password) {
        throw new Error('Faltan campos obligatorios');
      }

      const registerUseCase = this.container.getRegisterUserUseCase();
      const user = await registerUseCase.execute({
        cedula: userData.cedula,
        firstName: userData.firstName,
        secondName: userData.secondName,
        lastName: userData.lastName,
        secondLastName: userData.secondLastName,
        email: userData.email,
        password: userData.password,
        phoneNumber: userData.phoneNumber,
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : new Date(),
        careerId: userData.careerId
      });
      
      return {
        message: 'Usuario registrado exitosamente',
        user: this.mapToUserResponse(user)
      };
    });
  }

  /**
   * POST /api/auth/logout
   * Cerrar sesión de usuario
   */
  public async logout(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const userId = this.getUserId(req);
      
      const logoutUseCase = this.container.getLogoutUseCase();
      await logoutUseCase.execute(userId);
      
      return { message: 'Sesión cerrada exitosamente' };
    });
  }

  /**
   * GET /api/auth/profile
   * Obtener perfil del usuario autenticado
   */
  public async getProfile(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const userId = this.getUserId(req);
      
      const getUserByIdUseCase = this.container.getUserByIdUseCase();
      const user = await getUserByIdUseCase.execute(userId);
      
      return this.mapToUserResponse(user);
    });
  }

  /**
   * PUT /api/auth/profile
   * Actualizar perfil del usuario autenticado
   */
  public async updateProfile(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const userId = this.getUserId(req);
      const updateData = req.body;
      
      const updateUserUseCase = this.container.getUpdateUserUseCase();
      const user = await updateUserUseCase.execute(userId, {
        firstName: updateData.firstName,
        secondName: updateData.secondName,
        lastName: updateData.lastName,
        secondLastName: updateData.secondLastName,
        phoneNumber: updateData.phoneNumber,
        dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
        careerId: updateData.careerId
      });
      
      return this.mapToUserResponse(user);
    });
  }

  /**
   * POST /api/auth/change-password
   * Cambiar contraseña del usuario autenticado
   */
  public async changePassword(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const userId = this.getUserId(req);
      const passwordData: ChangePasswordDTO = req.body;
      
      if (!passwordData.currentPassword || !passwordData.newPassword) {
        throw new Error('Contraseña actual y nueva contraseña son requeridas');
      }

      const changePasswordUseCase = this.container.getChangePasswordUseCase();
      await changePasswordUseCase.execute({
        userId,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      return { message: 'Contraseña actualizada exitosamente' };
    });
  }

  /**
   * POST /api/auth/forgot-password
   * Solicitar restablecimiento de contraseña
   */
  public async forgotPassword(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const resetData: PasswordResetRequestDTO = req.body;
      
      if (!resetData.email) {
        throw new Error('Email es requerido');
      }

      const forgotPasswordUseCase = this.container.getForgotPasswordUseCase();
      await forgotPasswordUseCase.execute(resetData.email);
      
      return { message: 'Se ha enviado un enlace de restablecimiento a tu email' };
    });
  }

  /**
   * POST /api/auth/reset-password
   * Confirmar restablecimiento de contraseña
   */
  public async resetPassword(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const resetData: PasswordResetConfirmDTO = req.body;
      
      if (!resetData.token || !resetData.newPassword) {
        throw new Error('Token y nueva contraseña son requeridos');
      }

      const resetPasswordUseCase = this.container.getResetPasswordUseCase();
      await resetPasswordUseCase.execute({
        token: resetData.token,
        newPassword: resetData.newPassword
      });
      
      return { message: 'Contraseña restablecida exitosamente' };
    });
  }

  /**
   * POST /api/auth/verify-email
   * Verificar email de usuario
   */
  public async verifyEmail(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const { token } = req.body;
      
      if (!token) {
        throw new Error('Token de verificación es requerido');
      }

      const verifyEmailUseCase = this.container.getVerifyEmailUseCase();
      await verifyEmailUseCase.execute(token);
      
      return { message: 'Email verificado exitosamente' };
    });
  }

  /**
   * POST /api/auth/resend-verification
   * Reenviar email de verificación
   */
  public async resendVerification(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const { email } = req.body;
      
      if (!email) {
        throw new Error('Email es requerido');
      }

      const resendVerificationUseCase = this.container.getResendVerificationUseCase();
      await resendVerificationUseCase.execute(email);
      
      return { message: 'Email de verificación reenviado' };
    });
  }

  /**
   * POST /api/auth/refresh-token
   * Refrescar token de acceso
   */
  public async refreshToken(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        throw new Error('Refresh token es requerido');
      }

      const refreshTokenUseCase = this.container.getRefreshTokenUseCase();
      const result = await refreshTokenUseCase.execute(refreshToken);
      
      return {
        token: result.token,
        expiresIn: result.expiresIn
      };
    });
  }

  /**
   * Mapea un usuario del dominio a DTO de respuesta
   */
  private mapToUserResponse(user: User & { account?: any }): UserResponseDTO {
    return {
      id: user.id,
      cedula: user.cedula,
      nombres: user.firstName + (user.secondName ? ` ${user.secondName}` : ''),
      apellidos: user.lastName + (user.secondLastName ? ` ${user.secondLastName}` : ''),
      email: user.account?.email || '',
      telefono: user.phoneNumber || '',
      rol: user.account?.role || 'estudiante',
      fechaCreacion: user.createdAt,
      estado: (user as any).isActive ?? true
    };
  }
}