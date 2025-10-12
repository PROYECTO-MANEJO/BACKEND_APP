"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareerRoutes = void 0;
const express_1 = require("express");
const CareerController_1 = require("../controllers/CareerController");
const DIContainer_1 = require("../../infrastructure/DIContainer");
const jwtMiddleware_1 = require("../middleware/jwtMiddleware");
class CareerRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        const container = DIContainer_1.DIContainer.getInstance();
        this.careerController = new CareerController_1.CareerController(container);
        this.setupRoutes();
    }
    setupRoutes() {
        /**
         * @route GET /careers
         * @description Obtener todas las carreras
         * @access Public
         */
        this.router.get("/", this.careerController.getAllCareers.bind(this.careerController));
        /**
         * @route GET /careers/:id
         * @description Obtener una carrera por ID
         * @access Public
         */
        this.router.get("/:id", this.careerController.getCareerById.bind(this.careerController));
        /**
         * @route POST /careers
         * @description Crear una nueva carrera
         * @access Private (Admin, Master)
         */
        this.router.post("/", jwtMiddleware_1.validateJWT, this.careerController.createCareer.bind(this.careerController));
        /**
         * @route PUT /careers/:id
         * @description Actualizar una carrera
         * @access Private (Admin, Master)
         */
        this.router.put("/:id", jwtMiddleware_1.validateJWT, this.careerController.updateCareer.bind(this.careerController));
        /**
         * @route DELETE /careers/:id
         * @description Eliminar una carrera
         * @access Private (Admin, Master)
         */
        this.router.delete("/:id", jwtMiddleware_1.validateJWT, this.careerController.deleteCareer.bind(this.careerController));
        /**
         * @route GET /careers/:id/stats
         * @description Obtener estadísticas de una carrera
         * @access Private (Admin, Master, Organizador)
         */
        this.router.get("/:id/stats", jwtMiddleware_1.validateJWT, this.careerController.getCareerStats.bind(this.careerController));
    }
    getRouter() {
        return this.router;
    }
}
exports.CareerRoutes = CareerRoutes;
//# sourceMappingURL=careerRoutes.js.map