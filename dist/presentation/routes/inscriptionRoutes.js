"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InscriptionRoutes = void 0;
const express_1 = require("express");
const InscriptionController_1 = require("../controllers/InscriptionController");
const DIContainer_1 = require("../../infrastructure/DIContainer");
const jwtMiddleware_1 = require("../middleware/jwtMiddleware");
class InscriptionRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        const container = DIContainer_1.DIContainer.getInstance();
        this.inscriptionController = new InscriptionController_1.InscriptionController(container);
        this.setupRoutes();
    }
    setupRoutes() {
        /**
         * @route POST /inscriptions/events
         * @description Inscribir usuario a un evento
         * @access Private (Usuario autenticado)
         */
        this.router.post("/events", jwtMiddleware_1.validateJWT, this.inscriptionController.enrollInEvent.bind(this.inscriptionController));
        /**
         * @route POST /inscriptions/courses
         * @description Inscribir usuario a un curso
         * @access Private (Usuario autenticado)
         */
        this.router.post("/courses", jwtMiddleware_1.validateJWT, this.inscriptionController.enrollInCourse.bind(this.inscriptionController));
        /**
         * @route GET /inscriptions/my-events
         * @description Obtener inscripciones de eventos del usuario
         * @access Private (Usuario autenticado)
         */
        this.router.get("/my-events", jwtMiddleware_1.validateJWT, this.inscriptionController.getMyEventInscriptions.bind(this.inscriptionController));
        /**
         * @route GET /inscriptions/my-courses
         * @description Obtener inscripciones de cursos del usuario
         * @access Private (Usuario autenticado)
         */
        this.router.get("/my-courses", jwtMiddleware_1.validateJWT, this.inscriptionController.getMyCourseInscriptions.bind(this.inscriptionController));
    }
    getRouter() {
        return this.router;
    }
}
exports.InscriptionRoutes = InscriptionRoutes;
//# sourceMappingURL=inscriptionRoutes.js.map