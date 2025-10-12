"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipationRoutes = void 0;
const express_1 = require("express");
const ParticipationController_1 = require("../controllers/ParticipationController");
const DIContainer_1 = require("../../infrastructure/DIContainer");
const jwtMiddleware_1 = require("../middleware/jwtMiddleware");
class ParticipationRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        const container = DIContainer_1.DIContainer.getInstance();
        this.participationController = new ParticipationController_1.ParticipationController(container);
        this.setupRoutes();
    }
    setupRoutes() {
        /**
         * @route GET /participations/courses/:courseId
         * @description Obtener participaciones de un curso
         * @access Private (Admin, Master, Organizador)
         */
        this.router.get("/courses/:courseId", jwtMiddleware_1.validateJWT, this.participationController.getCourseParticipations.bind(this.participationController));
        /**
         * @route GET /participations/events/:eventId
         * @description Obtener participaciones de un evento
         * @access Private (Admin, Master, Organizador)
         */
        this.router.get("/events/:eventId", jwtMiddleware_1.validateJWT, this.participationController.getEventParticipations.bind(this.participationController));
        /**
         * @route PUT /participations/courses/:courseId/participants/:userId
         * @description Actualizar participación de usuario en curso
         * @access Private (Admin, Master, Organizador)
         */
        this.router.put("/courses/:courseId/participants/:userId", jwtMiddleware_1.validateJWT, this.participationController.updateCourseParticipation.bind(this.participationController));
        /**
         * @route PUT /participations/events/:eventId/participants/:userId
         * @description Actualizar participación de usuario en evento
         * @access Private (Admin, Master, Organizador)
         */
        this.router.put("/events/:eventId/participants/:userId", jwtMiddleware_1.validateJWT, this.participationController.updateEventParticipation.bind(this.participationController));
    }
    getRouter() {
        return this.router;
    }
}
exports.ParticipationRoutes = ParticipationRoutes;
//# sourceMappingURL=participationRoutes.js.map