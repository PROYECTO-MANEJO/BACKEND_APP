"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeRequestRoutes = void 0;
const express_1 = require("express");
const ChangeRequestController_1 = require("../controllers/ChangeRequestController");
const DIContainer_1 = require("../../infrastructure/DIContainer");
const jwtMiddleware_1 = require("../middleware/jwtMiddleware");
class ChangeRequestRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        const container = DIContainer_1.DIContainer.getInstance();
        this.changeRequestController = new ChangeRequestController_1.ChangeRequestController(container);
        this.setupRoutes();
    }
    setupRoutes() {
        /**
         * @route POST /change-requests
         * @description Crear nueva solicitud de cambio
         * @access Private (Usuario autenticado)
         */
        this.router.post("/", jwtMiddleware_1.validateJWT, this.changeRequestController.createChangeRequest.bind(this.changeRequestController));
        /**
         * @route GET /change-requests/my-requests
         * @description Obtener solicitudes del usuario autenticado
         * @access Private (Usuario autenticado)
         */
        this.router.get("/my-requests", jwtMiddleware_1.validateJWT, this.changeRequestController.getMyChangeRequests.bind(this.changeRequestController));
        /**
         * @route GET /change-requests/:id
         * @description Obtener solicitud por ID
         * @access Private (Creador, Admin o Desarrollador asignado)
         */
        this.router.get("/:id", jwtMiddleware_1.validateJWT, this.changeRequestController.getChangeRequestById.bind(this.changeRequestController));
        /**
         * @route GET /change-requests
         * @description Obtener todas las solicitudes (Admin only)
         * @access Private (Admin only)
         */
        this.router.get("/", jwtMiddleware_1.validateJWT, this.changeRequestController.getAllChangeRequests.bind(this.changeRequestController));
        /**
         * @route PUT /change-requests/:id/status
         * @description Actualizar estado de solicitud
         * @access Private (Admin only)
         */
        this.router.put("/:id/status", jwtMiddleware_1.validateJWT, this.changeRequestController.updateChangeRequestStatus.bind(this.changeRequestController));
    }
    getRouter() {
        return this.router;
    }
}
exports.ChangeRequestRoutes = ChangeRequestRoutes;
//# sourceMappingURL=changeRequestRoutes.js.map