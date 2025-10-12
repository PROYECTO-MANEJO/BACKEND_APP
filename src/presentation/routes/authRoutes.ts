import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { DIContainer } from "../../infrastructure/DIContainer";
import {
  handleValidationErrors,
  validateLogin,
  validateChangePassword,
} from "../middleware/validationMiddleware";
import { authenticateToken } from "../middleware/authMiddleware";

export class AuthRoutes {
  private router: Router;
  private authController: AuthController;

  constructor() {
    this.router = Router();
    // Use DIContainer for AuthController
    const container = DIContainer.getInstance();
    this.authController = new AuthController(container);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    /**
     * POST /api/auth/login
     * Iniciar sesión
     */
    this.router.post(
      "/login",
      validateLogin,
      handleValidationErrors,
      this.authController.login.bind(this.authController)
    );

    /**
     * POST /api/auth/register
     * Registrar nuevo usuario
     */
    this.router.post(
      "/register",
      // TODO: Agregar validación cuando esté implementada
      this.authController.register.bind(this.authController)
    );

    /**
     * POST /api/auth/logout
     * Cerrar sesión
     */
    this.router.post(
      "/logout",
      authenticateToken,
      this.authController.logout.bind(this.authController)
    );

    /**
     * GET /api/auth/profile
     * Obtener perfil del usuario autenticado
     */
    this.router.get(
      "/profile",
      authenticateToken,
      this.authController.getProfile.bind(this.authController)
    );

    /**
     * POST /api/auth/change-password
     * Cambiar contraseña
     */
    this.router.post(
      "/change-password",
      authenticateToken,
      validateChangePassword,
      handleValidationErrors,
      this.authController.changePassword.bind(this.authController)
    );

    /**
     * POST /api/auth/forgot-password
     * Solicitar restablecimiento de contraseña
     */
    this.router.post(
      "/forgot-password",
      // TODO: Agregar validación
      this.authController.forgotPassword.bind(this.authController)
    );

    /**
     * POST /api/auth/reset-password
     * Confirmar restablecimiento de contraseña
     */
    this.router.post(
      "/reset-password",
      // TODO: Agregar validación
      this.authController.resetPassword.bind(this.authController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
