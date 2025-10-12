import { Router } from "express";
import { ParticipationController } from "../controllers/ParticipationController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { validateJWT } from "../middleware/jwtMiddleware";

export class ParticipationRoutes {
  private router: Router;
  private participationController: ParticipationController;

  constructor() {
    this.router = Router();
    const container = DIContainer.getInstance();
    this.participationController = new ParticipationController(container);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    /**
     * @route GET /participations/courses/:courseId
     * @description Obtener participaciones de un curso
     * @access Private (Admin, Master, Organizador)
     */
    this.router.get(
      "/courses/:courseId",
      validateJWT,
      this.participationController.getCourseParticipations.bind(this.participationController)
    );

    /**
     * @route GET /participations/events/:eventId
     * @description Obtener participaciones de un evento
     * @access Private (Admin, Master, Organizador)
     */
    this.router.get(
      "/events/:eventId",
      validateJWT,
      this.participationController.getEventParticipations.bind(this.participationController)
    );

    /**
     * @route PUT /participations/courses/:courseId/participants/:userId
     * @description Actualizar participación de usuario en curso
     * @access Private (Admin, Master, Organizador)
     */
    this.router.put(
      "/courses/:courseId/participants/:userId",
      validateJWT,
      this.participationController.updateCourseParticipation.bind(this.participationController)
    );

    /**
     * @route PUT /participations/events/:eventId/participants/:userId
     * @description Actualizar participación de usuario en evento
     * @access Private (Admin, Master, Organizador)
     */
    this.router.put(
      "/events/:eventId/participants/:userId",
      validateJWT,
      this.participationController.updateEventParticipation.bind(this.participationController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
