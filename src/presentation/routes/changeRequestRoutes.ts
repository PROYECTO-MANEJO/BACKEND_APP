import { Router } from "express";
import { ChangeRequestController } from "../controllers/ChangeRequestController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { validateJWT } from "../middleware/jwtMiddleware";

export class ChangeRequestRoutes {
  private router: Router;
  private changeRequestController: ChangeRequestController;

  constructor() {
    this.router = Router();
    const container = DIContainer.getInstance();
    this.changeRequestController = new ChangeRequestController(container);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    /**
     * @route POST /change-requests
     * @description Crear nueva solicitud de cambio
     * @access Private (Usuario autenticado)
     */
    this.router.post(
      "/",
      validateJWT,
      this.changeRequestController.createChangeRequest.bind(this.changeRequestController)
    );

    /**
     * @route GET /change-requests/my-requests
     * @description Obtener solicitudes del usuario autenticado
     * @access Private (Usuario autenticado)
     */
    this.router.get(
      "/my-requests",
      validateJWT,
      this.changeRequestController.getMyChangeRequests.bind(this.changeRequestController)
    );

    /**
     * @route GET /change-requests/:id
     * @description Obtener solicitud por ID
     * @access Private (Creador, Admin o Desarrollador asignado)
     */
    this.router.get(
      "/:id",
      validateJWT,
      this.changeRequestController.getChangeRequestById.bind(this.changeRequestController)
    );

    /**
     * @route GET /change-requests
     * @description Obtener todas las solicitudes (Admin only)
     * @access Private (Admin only)
     */
    this.router.get(
      "/",
      validateJWT,
      this.changeRequestController.getAllChangeRequests.bind(this.changeRequestController)
    );

    /**
     * @route PUT /change-requests/:id/status
     * @description Actualizar estado de solicitud
     * @access Private (Admin only)
     */
    this.router.put(
      "/:id/status",
      validateJWT,
      this.changeRequestController.updateChangeRequestStatus.bind(this.changeRequestController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
