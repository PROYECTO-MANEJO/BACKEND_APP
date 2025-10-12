"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const BaseController_1 = require("./BaseController");
class AuthController extends BaseController_1.BaseController {
    constructor(container) {
        super();
        this.container = container;
    }
    /**
     * POST /api/auth/login
     * Iniciar sesión de usuario
     */
    async login(req, res) {
        await this.execute(req, res, async () => {
            const loginData = req.body;
            if (!loginData.email || !loginData.password) {
                throw new Error('Email y contraseña son requeridos');
            }
            // TODO: Implementar cuando estén disponibles los casos de uso
            const mockResponse = {
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
    async register(req, res) {
        await this.execute(req, res, async () => {
            const userData = req.body;
            // Validación básica
            if (!userData.cedula || !userData.firstName || !userData.lastName || !userData.email || !userData.password) {
                throw new Error('Faltan campos obligatorios');
            }
            // TODO: Implementar cuando estén disponibles los casos de uso
            const mockUser = {
                id: Math.floor(Math.random() * 1000),
                cedula: userData.cedula,
                nombres: userData.firstName + (userData.secondName ? ` ${userData.secondName}` : ''),
                apellidos: userData.lastName + (userData.secondLastName ? ` ${userData.secondLastName}` : ''),
                email: userData.email,
                telefono: userData.phoneNumber || '',
                rol: 'estudiante',
                fechaCreacion: new Date(),
                estado: true
            };
            return {
                message: 'Usuario registrado exitosamente',
                user: mockUser
            };
        });
    }
    /**
     * POST /api/auth/logout
     * Cerrar sesión de usuario
     */
    async logout(req, res) {
        await this.execute(req, res, async () => {
            // TODO: Implementar cuando estén disponibles los casos de uso
            return { message: 'Sesión cerrada exitosamente' };
        });
    }
    /**
     * GET /api/auth/profile
     * Obtener perfil del usuario autenticado
     */
    async getProfile(req, res) {
        await this.execute(req, res, async () => {
            const userId = this.getUserId(req);
            // TODO: Implementar cuando estén disponibles los casos de uso
            const mockUser = {
                id: userId,
                cedula: '1234567890',
                nombres: 'Usuario Mock',
                apellidos: 'Apellido Mock',
                email: 'usuario@ejemplo.com',
                telefono: '0987654321',
                rol: 'estudiante',
                fechaCreacion: new Date(),
                estado: true
            };
            return mockUser;
        });
    }
    /**
     * PUT /api/auth/profile
     * Actualizar perfil del usuario autenticado
     */
    async updateProfile(req, res) {
        await this.execute(req, res, async () => {
            const userId = this.getUserId(req);
            const updateData = req.body;
            // TODO: Implement when updateUserUseCase is available in DIContainer
            // const updateUserUseCase = this.container.getUpdateUserUseCase();
            // Mock response for now
            return {
                id: userId,
                cedula: '1234567890',
                nombres: updateData.firstName + (updateData.secondName ? ` ${updateData.secondName}` : ''),
                apellidos: updateData.lastName + (updateData.secondLastName ? ` ${updateData.secondLastName}` : ''),
                email: 'user@example.com',
                telefono: updateData.phoneNumber || '0999999999',
                rol: 'estudiante',
                fechaCreacion: new Date(),
                estado: true
            };
        });
    }
    /**
     * POST /api/auth/change-password
     * Cambiar contraseña del usuario autenticado
     */
    async changePassword(req, res) {
        await this.execute(req, res, async () => {
            const userId = this.getUserId(req);
            const passwordData = req.body;
            if (!passwordData.currentPassword || !passwordData.newPassword) {
                throw new Error('Contraseña actual y nueva contraseña son requeridas');
            }
            // TODO: Implement when changePasswordUseCase is available in DIContainer
            // const changePasswordUseCase = this.container.getChangePasswordUseCase();
            // Mock response for now
            return { message: 'Contraseña actualizada exitosamente' };
        });
    }
    /**
     * POST /api/auth/forgot-password
     * Solicitar restablecimiento de contraseña
     */
    async forgotPassword(req, res) {
        await this.execute(req, res, async () => {
            const resetData = req.body;
            if (!resetData.email) {
                throw new Error('Email es requerido');
            }
            // TODO: Implement when forgotPasswordUseCase is available in DIContainer
            // const forgotPasswordUseCase = this.container.getForgotPasswordUseCase();
            // Mock response for now
            return { message: 'Se ha enviado un enlace de restablecimiento a tu email' };
        });
    }
    /**
     * POST /api/auth/reset-password
     * Confirmar restablecimiento de contraseña
     */
    async resetPassword(req, res) {
        await this.execute(req, res, async () => {
            const resetData = req.body;
            if (!resetData.token || !resetData.newPassword) {
                throw new Error('Token y nueva contraseña son requeridos');
            }
            // TODO: Implement when resetPasswordUseCase is available in DIContainer
            // const resetPasswordUseCase = this.container.getResetPasswordUseCase();
            // Mock response for now
            return { message: 'Contraseña restablecida exitosamente' };
        });
    }
    /**
     * POST /api/auth/verify-email
     * Verificar email de usuario
     */
    async verifyEmail(req, res) {
        await this.execute(req, res, async () => {
            const { token } = req.body;
            if (!token) {
                throw new Error('Token de verificación es requerido');
            }
            // TODO: Implement when verifyEmailUseCase is available in DIContainer
            // const verifyEmailUseCase = this.container.getVerifyEmailUseCase();
            // Mock response for now
            return { message: 'Email verificado exitosamente' };
        });
    }
    /**
     * POST /api/auth/resend-verification
     * Reenviar email de verificación
     */
    async resendVerification(req, res) {
        await this.execute(req, res, async () => {
            const { email } = req.body;
            if (!email) {
                throw new Error('Email es requerido');
            }
            // TODO: Implement when resendVerificationUseCase is available in DIContainer
            // const resendVerificationUseCase = this.container.getResendVerificationUseCase();
            // Mock response for now
            return { message: 'Email de verificación reenviado' };
        });
    }
    /**
     * POST /api/auth/refresh-token
     * Refrescar token de acceso
     */
    async refreshToken(req, res) {
        await this.execute(req, res, async () => {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                throw new Error('Refresh token es requerido');
            }
            // TODO: Implement when refreshTokenUseCase is available in DIContainer
            // const refreshTokenUseCase = this.container.getRefreshTokenUseCase();
            // Mock response for now
            return {
                token: 'new-jwt-token-mock',
                expiresIn: 3600
            };
        });
    }
    /**
     * Mapea un usuario del dominio a DTO de respuesta
     * TODO: Define proper User type when domain layer is available
     */
    mapToUserResponse(user) {
        return {
            id: user.id,
            cedula: user.cedula,
            nombres: user.firstName + (user.secondName ? ` ${user.secondName}` : ''),
            apellidos: user.lastName + (user.secondLastName ? ` ${user.secondLastName}` : ''),
            email: user.account?.email || '',
            telefono: user.phoneNumber || '',
            rol: user.account?.role || 'estudiante',
            fechaCreacion: user.createdAt,
            estado: user.isActive ?? true
        };
    }
}
exports.AuthController = AuthController;
