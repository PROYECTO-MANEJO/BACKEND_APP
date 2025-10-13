"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizerRoutes = void 0;
const express_1 = require("express");
const OrganizerController_1 = require("../controllers/OrganizerController");
const DIContainer_1 = require("../../infrastructure/DIContainer");
// Crear instancia del controlador con inyección de dependencias
const diContainer = DIContainer_1.DIContainer.getInstance();
const organizerController = new OrganizerController_1.OrganizerController(diContainer);
const router = (0, express_1.Router)();
exports.organizerRoutes = router;
/**
 * Rutas para gestión de organizadores
 * Siguiendo principios RESTful y Clean Architecture
 */
// GET /api/organizadores - Obtener todos los organizadores
router.get("/", organizerController.getOrganizadores.bind(organizerController));
// GET /api/organizadores/:cedula - Obtener organizador por cédula
router.get("/:cedula", organizerController.getOrganizadorByCedula.bind(organizerController));
// POST /api/organizadores - Crear nuevo organizador (Admin only)
router.post("/", organizerController.createOrganizador.bind(organizerController));
// PUT /api/organizadores/:cedula - Actualizar organizador (Admin only)
router.put("/:cedula", organizerController.updateOrganizador.bind(organizerController));
// DELETE /api/organizadores/:cedula - Eliminar organizador (Admin only)
router.delete("/:cedula", organizerController.deleteOrganizador.bind(organizerController));
//# sourceMappingURL=organizerRoutes.js.map