import { Router } from "express";
import { CareerController } from "../controllers/CareerController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { validateJWT } from "../middleware/jwtMiddleware";

export class CareerRoutes {
  private router: Router;
  private careerController: CareerController;

  constructor() {
    this.router = Router();
    const container = DIContainer.getInstance();
    this.careerController = new CareerController(container);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    /**
     * @route GET /careers
     * @description Obtener todas las carreras
     * @access Public
     */
    this.router.get(
      "/",
      this.careerController.getAllCareers.bind(this.careerController)
    );

    /**
     * @route GET /careers/:id
     * @description Obtener una carrera por ID
     * @access Public
     */
    this.router.get(
      "/:id",
      this.careerController.getCareerById.bind(this.careerController)
    );

    /**
     * @route POST /careers
     * @description Crear una nueva carrera
     * @access Private (Admin, Master)
     */
    this.router.post(
      "/",
      validateJWT,
      this.careerController.createCareer.bind(this.careerController)
    );

    /**
     * @route PUT /careers/:id
     * @description Actualizar una carrera
     * @access Private (Admin, Master)
     */
    this.router.put(
      "/:id",
      validateJWT,
      this.careerController.updateCareer.bind(this.careerController)
    );

    /**
     * @route DELETE /careers/:id
     * @description Eliminar una carrera
     * @access Private (Admin, Master)
     */
    this.router.delete(
      "/:id",
      validateJWT,
      this.careerController.deleteCareer.bind(this.careerController)
    );

    /**
     * @route GET /careers/:id/stats
     * @description Obtener estadísticas de una carrera
     * @access Private (Admin, Master, Organizador)
     */
    this.router.get(
      "/:id/stats",
      validateJWT,
      this.careerController.getCareerStats.bind(this.careerController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
