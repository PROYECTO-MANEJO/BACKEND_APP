import { Router } from "express";
import { ChangeRequestController } from "@presentation/controllers/ChangeRequestController";
import { DeveloperController } from "@presentation/controllers/DeveloperController";
import {
  validateCreateChangeRequest,
  validateUpdateStatus,
  validateAssignDeveloper,
  validateGetById,
  validatePagination,
  validateSearchFilters,
  validateDeveloperId,
  validateGithubCredentials,
  validateRequestType,
} from "@presentation/middleware/changeRequestValidation";

// Importar middleware de autenticación existente
const { validateJWT } = require("../../../middlewares/validateJWT");

const router = Router();

// Instanciar controladores
const changeRequestController = new ChangeRequestController();
const developerController = new DeveloperController();

// ==========================================
// RUTAS DE SOLICITUDES DE CAMBIO
// ==========================================

/**
 * POST /api/solicitudes-cambio
 * Crear una nueva solicitud de cambio
 */
router.post(
  "/solicitudes-cambio",
  validateJWT,
  validateCreateChangeRequest,
  changeRequestController.createChangeRequest.bind(changeRequestController)
);

/**
 * GET /api/solicitudes-cambio/:id
 * Obtener una solicitud de cambio por ID
 */
router.get(
  "/solicitudes-cambio/:id",
  validateJWT,
  validateGetById,
  changeRequestController.getChangeRequestById.bind(changeRequestController)
);

/**
 * GET /api/solicitudes-cambio/mis-solicitudes
 * Obtener las solicitudes del usuario autenticado
 */
router.get(
  "/solicitudes-cambio/mis-solicitudes",
  validateJWT,
  validatePagination,
  changeRequestController.getMyChangeRequests.bind(changeRequestController)
);

/**
 * GET /api/solicitudes-cambio
 * Obtener todas las solicitudes con filtros (solo admin/master)
 */
router.get(
  "/solicitudes-cambio",
  validateJWT,
  validatePagination,
  validateSearchFilters,
  changeRequestController.getAllChangeRequests.bind(changeRequestController)
);

/**
 * PUT /api/solicitudes-cambio/:id/estado
 * Actualizar el estado de una solicitud
 */
router.put(
  "/solicitudes-cambio/:id/estado",
  validateJWT,
  validateUpdateStatus,
  changeRequestController.updateChangeRequestStatus.bind(
    changeRequestController
  )
);

/**
 * PUT /api/solicitudes-cambio/:id/asignar-desarrollador
 * Asignar un desarrollador a una solicitud
 */
router.put(
  "/solicitudes-cambio/:id/asignar-desarrollador",
  validateJWT,
  validateAssignDeveloper,
  changeRequestController.assignDeveloper.bind(changeRequestController)
);

/**
 * GET /api/solicitudes-cambio/estadisticas
 * Obtener estadísticas de solicitudes de cambio
 */
router.get(
  "/solicitudes-cambio/estadisticas",
  validateJWT,
  changeRequestController.getStatistics.bind(changeRequestController)
);

// ==========================================
// RUTAS DE DESARROLLADORES
// ==========================================

/**
 * GET /api/developers
 * Obtener lista de desarrolladores
 */
router.get(
  "/developers",
  validateJWT,
  developerController.getAllDevelopers.bind(developerController)
);

/**
 * GET /api/developers/:id
 * Obtener un desarrollador por ID
 */
router.get(
  "/developers/:id",
  validateJWT,
  validateDeveloperId,
  developerController.getDeveloperById.bind(developerController)
);

/**
 * GET /api/developers/available
 * Obtener desarrolladores disponibles para asignación
 */
router.get(
  "/developers/available",
  validateJWT,
  developerController.getAvailableDevelopers.bind(developerController)
);

/**
 * GET /api/developers/statistics
 * Obtener estadísticas de desarrolladores
 */
router.get(
  "/developers/statistics",
  validateJWT,
  developerController.getDeveloperStatistics.bind(developerController)
);

/**
 * GET /api/developers/workload
 * Obtener estadísticas de carga de trabajo
 */
router.get(
  "/developers/workload",
  validateJWT,
  developerController.getWorkloadStatistics.bind(developerController)
);

/**
 * GET /api/developers/recommended/:requestType
 * Obtener desarrolladores recomendados para un tipo de solicitud
 */
router.get(
  "/developers/recommended/:requestType",
  validateJWT,
  validateRequestType,
  developerController.getRecommendedDevelopers.bind(developerController)
);

/**
 * PUT /api/developers/:id/github
 * Actualizar credenciales de GitHub de un desarrollador
 */
router.put(
  "/developers/:id/github",
  validateJWT,
  validateDeveloperId,
  validateGithubCredentials,
  developerController.updateGithubCredentials.bind(developerController)
);

export default router;
