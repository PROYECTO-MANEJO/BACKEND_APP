import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { validateJWT } from "../middleware/jwtMiddleware"; // ✅ Importar middleware JWT

export class UserRoutes {
  private router: Router;
  private userController: UserController;

  constructor() {
    this.router = Router();
    const container = DIContainer.getInstance();
    this.userController = new UserController(container);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    /**
     * GET /api/users/profile
     * Get current user profile (requires JWT token)
     */
    this.router.get(
      "/profile",
      validateJWT, // ✅ Agregar middleware JWT
      this.userController.getUserProfile.bind(this.userController)
    );

    /**
     * PUT /api/users/profile
     * Update current user profile (requires JWT token)
     */
    this.router.put(
      "/profile",
      validateJWT, // ✅ Agregar middleware JWT
      this.userController.updateUserProfile.bind(this.userController)
    );

    /**
     * GET /api/users
     * Get all users (admin only)
     */
    this.router.get(
      "/",
      // TODO: Add JWT middleware and admin authorization
      this.userController.getAllUsers.bind(this.userController)
    );

    /**
     * GET /api/users/admins
     * Get only administrators (master only)
     */
    this.router.get(
      "/admins",
      validateJWT, // ✅ Requiere autenticación
      this.userController.getAdmins.bind(this.userController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
