import { Router } from "express";
import { OrganizerController } from "../controllers/OrganizerController";
import { DIContainer } from "../../infrastructure/DIContainer";

// Crear instancia del controlador con inyección de dependencias
const diContainer = DIContainer.getInstance();
const organizerController = new OrganizerController(diContainer);

const router = Router();

/**
 * Rutas para gestión de organizadores
 * Siguiendo principios RESTful y Clean Architecture
 */

// GET /api/organizadores - Obtener todos los organizadores
router.get("/", organizerController.getOrganizadores.bind(organizerController));

// GET /api/organizadores/:cedula - Obtener organizador por cédula
router.get(
  "/:cedula",
  organizerController.getOrganizadorByCedula.bind(organizerController)
);

// POST /api/organizadores - Crear nuevo organizador (Admin only)
router.post(
  "/",
  organizerController.createOrganizador.bind(organizerController)
);

// PUT /api/organizadores/:cedula - Actualizar organizador (Admin only)
router.put(
  "/:cedula",
  organizerController.updateOrganizador.bind(organizerController)
);

// DELETE /api/organizadores/:cedula - Eliminar organizador (Admin only)
router.delete(
  "/:cedula",
  organizerController.deleteOrganizador.bind(organizerController)
);

export { router as organizerRoutes };
