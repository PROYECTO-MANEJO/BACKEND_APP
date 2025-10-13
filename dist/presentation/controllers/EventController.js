"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const BaseController_1 = require("./BaseController");
const EventService_1 = require("../../application/services/EventService");
const EventDTO_1 = require("../dto/EventDTO");
/**
 * Event Controller - Presentation Layer
 *
 * ✅ SRP: Responsabilidad única - Manejo de HTTP requests/responses para eventos
 * - Delega validaciones a EventValidator
 * - Delega lógica de negocio a EventService
 * - Delega transformaciones a EventDTOTransformer
 */
class EventController extends BaseController_1.BaseController {
    constructor(container) {
        super();
        this.eventService = new EventService_1.EventService(container);
    }
    /**
     * GET /api/events
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    async getEvents(req, res) {
        await this.execute(req, res, async () => {
            // ✅ SRP: Delegar lógica de negocio al servicio
            const events = await this.eventService.getAllEvents();
            // ✅ SRP: Delegar transformación al DTOTransformer
            const eventosFormateados = EventDTO_1.EventDTOTransformer.toResponseDTOList(events);
            return {
                eventos: eventosFormateados,
                total: eventosFormateados.length,
            };
        });
    }
    /**
     * GET /api/events/:id
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    async getEventById(req, res) {
        await this.execute(req, res, async () => {
            const { id } = req.params;
            if (!id)
                throw new Error("ID is required");
            // ✅ SRP: Delegar lógica de negocio al servicio
            const event = await this.eventService.getEventById(id);
            if (!event) {
                throw new Error("Event not found");
            }
            // ✅ SRP: Delegar transformación al DTOTransformer
            const eventoFormateado = EventDTO_1.EventDTOTransformer.toResponseDTO(event);
            return {
                evento: eventoFormateado,
            };
        });
    }
    /**
     * POST /api/events
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    async createEvent(req, res) {
        await this.execute(req, res, async () => {
            // ✅ SRP: Validar estructura básica del request (responsabilidad del controlador)
            const requiredFields = [
                "nom_eve",
                "des_eve",
                "id_cat_eve",
                "fec_ini_eve",
                "hor_ini_eve",
                "dur_eve",
                "are_eve",
                "ubi_eve",
                "ced_org_eve",
                "capacidad_max_eve",
                "porcentaje_asistencia_aprobacion",
            ];
            for (const field of requiredFields) {
                if (req.body[field] == null) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }
            // ✅ SRP: Delegar transformación al DTOTransformer
            const createEventDTO = req.body;
            // ✅ SRP: Validar tipos básicos (responsabilidad del DTOTransformer)
            EventDTO_1.EventDTOTransformer.validateBasicTypes(createEventDTO);
            // ✅ SRP: Convertir DTO a datos del dominio (responsabilidad del DTOTransformer)
            const eventData = EventDTO_1.EventDTOTransformer.fromCreateDTO(createEventDTO);
            // ✅ SRP: Delegar lógica de negocio al servicio
            const createdEvent = await this.eventService.createEvent(eventData);
            // ✅ SRP: Delegar transformación de respuesta al DTOTransformer
            const eventoResponse = EventDTO_1.EventDTOTransformer.toResponseDTO(createdEvent);
            return {
                message: "Event created successfully",
                evento: eventoResponse,
            };
        });
    }
    /**
     * PUT /api/events/:id
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    async updateEvent(req, res) {
        await this.execute(req, res, async () => {
            const { id } = req.params;
            if (!id)
                throw new Error("ID is required");
            // ✅ SRP: Delegar lógica de negocio al servicio
            const updatedEvent = await this.eventService.updateEvent(id, req.body);
            // ✅ SRP: Delegar transformación al DTOTransformer
            const eventoResponse = EventDTO_1.EventDTOTransformer.toResponseDTO(updatedEvent);
            return {
                message: "Event updated successfully",
                evento: eventoResponse,
            };
        });
    }
    /**
     * DELETE /api/events/:id
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    async deleteEvent(req, res) {
        await this.execute(req, res, async () => {
            const { id } = req.params;
            if (!id)
                throw new Error("ID is required");
            // ✅ SRP: Delegar lógica de negocio al servicio
            await this.eventService.deleteEvent(id);
            return {
                message: "Event deleted successfully",
            };
        });
    }
    /**
     * POST /api/events/:id/close
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    async closeEvent(req, res) {
        await this.execute(req, res, async () => {
            const { id } = req.params;
            if (!id)
                throw new Error("ID is required");
            // ✅ SRP: Delegar lógica de negocio al servicio
            const closedEvent = await this.eventService.closeEvent(id);
            // ✅ SRP: Delegar transformación al DTOTransformer
            const eventoResponse = EventDTO_1.EventDTOTransformer.toResponseDTO(closedEvent);
            return {
                message: "Event closed successfully",
                evento: eventoResponse,
            };
        });
    }
    /**
     * GET /api/eventos (Admin)
     * ✅ SRP: Solo maneja HTTP request/response para admin, delega todo lo demás
     */
    async getEventosAdmin(req, res) {
        await this.execute(req, res, async () => {
            // ✅ SRP: Delegar lógica de negocio al servicio
            const events = await this.eventService.getAllEvents();
            // ✅ SRP: Delegar transformación al DTOTransformer
            const eventosFormateados = EventDTO_1.EventDTOTransformer.toResponseDTOList(events);
            return {
                eventos: eventosFormateados,
                total: eventosFormateados.length,
            };
        });
    }
    /**
     * GET /api/events/available
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    async getAvailableEvents(req, res) {
        await this.execute(req, res, async () => {
            // TODO: Implementar lógica para obtener eventos disponibles
            // Por ahora, devolver todos los eventos activos
            const events = await this.eventService.getAllEvents();
            // Filtrar eventos activos y futuros
            const now = new Date();
            const availableEvents = events.filter((event) => {
                const eventData = event.toPlainObject();
                return (eventData.estado_eve === "ACTIVO" &&
                    new Date(eventData.fec_ini_eve) >= now);
            });
            const eventosFormateados = EventDTO_1.EventDTOTransformer.toResponseDTOList(availableEvents);
            return {
                eventos: eventosFormateados,
                total: eventosFormateados.length,
            };
        });
    }
    /**
     * GET /api/events/my-events
     * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
     */
    async getMyEvents(req, res) {
        await this.execute(req, res, async () => {
            // TODO: Implementar lógica para obtener eventos del usuario
            // Por ahora, devolver array vacío hasta implementar inscripciones
            return {
                eventos: [],
                total: 0,
            };
        });
    }
}
exports.EventController = EventController;
//# sourceMappingURL=EventController.js.map