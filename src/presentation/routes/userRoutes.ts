import { Router } from 'express';
import { DIContainer } from '../../infrastructure/config/DIContainer';
import { UserController } from '../controllers/UserController';
import {
  authenticateToken,
  authorize,
  authorizeOwnerOrAdmin
} from '../middleware/authMiddleware';
import {
  handleValidationErrors,
  validateUserCreation,
  validateUserUpdate,
  validatePagination,
  validateIdParam
} from '../middleware/validationMiddleware';

export class UserRoutes {
  private router: Router;
  private userController: UserController;

  constructor(container: DIContainer) {
    this.router = Router();
    this.userController = new UserController(container);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    /**
     * GET /api/users
     * Obtener lista de usuarios (solo administradores)
     */
    this.router.get(
      '/',
      authenticateToken,
      authorize('administrador', 'admin'),
      validatePagination,
      handleValidationErrors,
      this.userController.getUsers.bind(this.userController)
    );

    /**
     * GET /api/users/:id
     * Obtener usuario por ID (solo el mismo usuario o administradores)
     */
    this.router.get(
      '/:id',
      authenticateToken,
      validateIdParam,
      handleValidationErrors,
      authorizeOwnerOrAdmin,
      this.userController.getUserById.bind(this.userController)
    );

    /**
     * POST /api/users
     * Crear nuevo usuario (solo administradores)
     */
    this.router.post(
      '/',
      authenticateToken,
      authorize('administrador', 'admin'),
      validateUserCreation,
      handleValidationErrors,
      this.userController.createUser.bind(this.userController)
    );

    /**
     * PUT /api/users/:id
     * Actualizar usuario (solo el mismo usuario o administradores)
     */
    this.router.put(
      '/:id',
      authenticateToken,
      validateIdParam,
      validateUserUpdate,
      handleValidationErrors,
      authorizeOwnerOrAdmin,
      this.userController.updateUser.bind(this.userController)
    );

    /**
     * DELETE /api/users/:id
     * Eliminar usuario (solo administradores)
     */
    this.router.delete(
      '/:id',
      authenticateToken,
      authorize('administrador', 'admin'),
      validateIdParam,
      handleValidationErrors,
      this.userController.deleteUser.bind(this.userController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}