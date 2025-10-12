import { Router } from "express";
import { DeveloperController } from "../controllers/DeveloperController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { validateJWT } from "../middleware/jwtMiddleware";

export class DeveloperRoutes {
  private router: Router;
  private developerController: DeveloperController;

  constructor() {
    this.router = Router();
    const container = DIContainer.getInstance();
    this.developerController = new DeveloperController(container);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    /**
     * @route GET /developers
     * @description Obtener lista de desarrolladores disponibles
     * @access Private (Admin, Master, Desarrollador)
     */
    this.router.get(
      "/",
      validateJWT,
      this.developerController.getAllDevelopers.bind(this.developerController)
    );

    /**
     * @route GET /developers/:developerId/assigned-requests
     * @description Obtener solicitudes asignadas a un desarrollador específico
     * @access Private (Admin, Master, o el mismo desarrollador)
     */
    this.router.get(
      "/:developerId/assigned-requests",
      validateJWT,
      this.developerController.getAssignedRequests.bind(this.developerController)
    );

    /**
     * @route PUT /developers/requests/:requestId/status
     * @description Actualizar estado de solicitud (desarrollador asignado)
     * @access Private (Desarrollador asignado, Admin, Master)
     */
    this.router.put(
      "/requests/:requestId/status",
      validateJWT,
      this.developerController.updateRequestStatus.bind(this.developerController)
    );

    /**
     * @route GET /developers/workload-stats
     * @description Obtener estadísticas de carga de trabajo
     * @access Private (Admin, Master only)
     */
    this.router.get(
      "/workload-stats",
      validateJWT,
      this.developerController.getWorkloadStats.bind(this.developerController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
