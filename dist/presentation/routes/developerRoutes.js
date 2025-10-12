"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeveloperRoutes = void 0;
const express_1 = require("express");
const DeveloperController_1 = require("../controllers/DeveloperController");
const DIContainer_1 = require("../../infrastructure/DIContainer");
const jwtMiddleware_1 = require("../middleware/jwtMiddleware");
class DeveloperRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        const container = DIContainer_1.DIContainer.getInstance();
        this.developerController = new DeveloperController_1.DeveloperController(container);
        this.setupRoutes();
    }
    setupRoutes() {
        /**
         * @route GET /developers
         * @description Obtener lista de desarrolladores disponibles
         * @access Private (Admin, Master, Desarrollador)
         */
        this.router.get("/", jwtMiddleware_1.validateJWT, this.developerController.getAllDevelopers.bind(this.developerController));
        /**
         * @route GET /developers/:developerId/assigned-requests
         * @description Obtener solicitudes asignadas a un desarrollador específico
         * @access Private (Admin, Master, o el mismo desarrollador)
         */
        this.router.get("/:developerId/assigned-requests", jwtMiddleware_1.validateJWT, this.developerController.getAssignedRequests.bind(this.developerController));
        /**
         * @route PUT /developers/requests/:requestId/status
         * @description Actualizar estado de solicitud (desarrollador asignado)
         * @access Private (Desarrollador asignado, Admin, Master)
         */
        this.router.put("/requests/:requestId/status", jwtMiddleware_1.validateJWT, this.developerController.updateRequestStatus.bind(this.developerController));
        /**
         * @route GET /developers/workload-stats
         * @description Obtener estadísticas de carga de trabajo
         * @access Private (Admin, Master only)
         */
        this.router.get("/workload-stats", jwtMiddleware_1.validateJWT, this.developerController.getWorkloadStats.bind(this.developerController));
    }
    getRouter() {
        return this.router;
    }
}
exports.DeveloperRoutes = DeveloperRoutes;
//# sourceMappingURL=developerRoutes.js.map