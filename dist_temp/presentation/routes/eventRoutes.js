"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRoutes = void 0;
const express_1 = require("express");
const EventController_1 = require("../controllers/EventController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
class EventRoutes {
    constructor(container) {
        this.router = (0, express_1.Router)();
        this.eventController = new EventController_1.EventController(container);
        this.setupRoutes();
    }
    setupRoutes() {
        /**
         * GET /api/events
         * Obtener lista de eventos (público con paginación)
         */
        this.router.get('/', authMiddleware_1.optionalAuth, validationMiddleware_1.validatePagination, validationMiddleware_1.handleValidationErrors, this.eventController.getEvents.bind(this.eventController));
        /**
         * GET /api/events/upcoming
         * Obtener eventos próximos (público)
         */
        this.router.get('/upcoming', authMiddleware_1.optionalAuth, validationMiddleware_1.validatePagination, validationMiddleware_1.handleValidationErrors, this.eventController.getUpcomingEvents.bind(this.eventController));
        /**
         * GET /api/events/my-events
         * Obtener mis eventos inscritos
         */
        this.router.get('/my-events', authMiddleware_1.authenticateToken, validationMiddleware_1.validatePagination, validationMiddleware_1.handleValidationErrors, this.eventController.getUserEvents.bind(this.eventController));
        /**
         * GET /api/events/by-area/:area
         * Obtener eventos por área (público)
         */
        this.router.get('/by-area/:area', authMiddleware_1.optionalAuth, validationMiddleware_1.validatePagination, validationMiddleware_1.handleValidationErrors, this.eventController.getEventsByArea.bind(this.eventController));
        /**
         * GET /api/events/:id
         * Obtener evento por ID (público)
         */
        this.router.get('/:id', validationMiddleware_1.validateIdParam, validationMiddleware_1.handleValidationErrors, this.eventController.getEventById.bind(this.eventController));
        /**
         * POST /api/events
         * Crear nuevo evento (solo organizadores y administradores)
         */
        this.router.post('/', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorize)('organizador', 'administrador'), validationMiddleware_1.validateEventCreation, validationMiddleware_1.handleValidationErrors, this.eventController.createEvent.bind(this.eventController));
        /**
         * PUT /api/events/:id
         * Actualizar evento (solo organizadores y administradores)
         */
        this.router.put('/:id', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorize)('organizador', 'administrador'), validationMiddleware_1.validateIdParam, validationMiddleware_1.handleValidationErrors, this.eventController.updateEvent.bind(this.eventController));
        /**
         * DELETE /api/events/:id
         * Eliminar evento (solo administradores)
         */
        this.router.delete('/:id', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorize)('administrador'), validationMiddleware_1.validateIdParam, validationMiddleware_1.handleValidationErrors, this.eventController.deleteEvent.bind(this.eventController));
        /**
         * POST /api/events/:id/enroll
         * Inscribirse a un evento
         */
        this.router.post('/:id/enroll', authMiddleware_1.authenticateToken, validationMiddleware_1.validateIdParam, validationMiddleware_1.handleValidationErrors, this.eventController.enrollToEvent.bind(this.eventController));
        /**
         * GET /api/events/:id/enrollments
         * Obtener inscripciones de un evento (solo organizadores y administradores)
         */
        this.router.get('/:id/enrollments', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorize)('organizador', 'administrador'), validationMiddleware_1.validateIdParam, validationMiddleware_1.validatePagination, validationMiddleware_1.handleValidationErrors, this.eventController.getEventEnrollments.bind(this.eventController));
    }
    getRouter() {
        return this.router;
    }
}
exports.EventRoutes = EventRoutes;
