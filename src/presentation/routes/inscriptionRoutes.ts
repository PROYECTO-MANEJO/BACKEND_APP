import { Router } from "express";
import { InscriptionController } from "../controllers/InscriptionController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { validateJWT } from "../middleware/jwtMiddleware";

export class InscriptionRoutes {
  private router: Router;
  private inscriptionController: InscriptionController;

  constructor() {
    this.router = Router();
    const container = DIContainer.getInstance();
    this.inscriptionController = new InscriptionController(container);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    /**
     * @route POST /inscriptions/events
     * @description Inscribir usuario a un evento
     * @access Private (Usuario autenticado)
     */
    this.router.post(
      "/events",
      validateJWT,
      this.inscriptionController.enrollInEvent.bind(this.inscriptionController)
    );

    /**
     * @route POST /inscriptions/courses
     * @description Inscribir usuario a un curso
     * @access Private (Usuario autenticado)
     */
    this.router.post(
      "/courses",
      validateJWT,
      this.inscriptionController.enrollInCourse.bind(this.inscriptionController)
    );

    /**
     * @route GET /inscriptions/my-events
     * @description Obtener inscripciones de eventos del usuario
     * @access Private (Usuario autenticado)
     */
    this.router.get(
      "/my-events",
      validateJWT,
      this.inscriptionController.getMyEventInscriptions.bind(this.inscriptionController)
    );

    /**
     * @route GET /inscriptions/my-courses
     * @description Obtener inscripciones de cursos del usuario
     * @access Private (Usuario autenticado)
     */
    this.router.get(
      "/my-courses",
      validateJWT,
      this.inscriptionController.getMyCourseInscriptions.bind(this.inscriptionController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
