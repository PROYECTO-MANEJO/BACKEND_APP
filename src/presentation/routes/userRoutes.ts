import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { DIContainer } from "../../infrastructure/DIContainer";

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
      // TODO: Add JWT middleware
      this.userController.getUserProfile.bind(this.userController)
    );

    /**
     * PUT /api/users/profile
     * Update current user profile (requires JWT token)
     */
    this.router.put(
      "/profile",
      // TODO: Add JWT middleware and validation
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
  }

  public getRouter(): Router {
    return this.router;
  }
}
