"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const BaseController_1 = require("./BaseController");
/**
 * Controlador para gestión de eventos
 * Maneja todas las operaciones CRUD y funcionalidades relacionadas con eventos
 */
class EventController extends BaseController_1.BaseController {
    constructor() {
        super();
    }
    /**
     * GET /api/events
     * Obtener lista de eventos con filtros
     */
    async getEvents(req, res) {
        await this.execute(req, res, async () => {
            const { page, pageSize } = this.getPaginationParams(req);
            const { search, area, modalidad, proximosEventos } = req.query;
            // TODO: Implement when getEventsUseCase is available in DIContainer
            // const getEventsUseCase = this.container.getGetEventsUseCase();
            // Mock response for now
            const response = {
                events: [
                    {
                        id: 1,
                        nombre: "Evento Mock",
                        descripcion: "Descripción del evento mock",
                        fechaInicio: new Date(),
                        fechaFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        area: "Tecnología",
                        audiencia: "Estudiantes",
                        capacidadMaxima: 100,
                        inscritosActuales: 0,
                        carreras: [{ id: 1, nombre: "Carrera Mock" }],
                        precio: 50,
                        modalidad: "virtual",
                        estado: true,
                        fechaCreacion: new Date(),
                    },
                ],
                total: 1,
                page: page,
                pageSize: pageSize,
            };
            return response;
        });
    }
    /**
     * GET /api/events/:id
     * Obtener evento por ID
     */
    async getEventById(req, res) {
        await this.execute(req, res, async () => {
            const eventId = parseInt(req.params.id);
            if (isNaN(eventId)) {
                throw new Error("ID de evento inválido");
            }
            // TODO: Implement when getEventByIdUseCase is available in DIContainer
            // const getEventByIdUseCase = this.container.getGetEventByIdUseCase();
            // Mock response for now
            return {
                id: eventId,
                nombre: "Evento Mock",
                descripcion: "Descripción del evento mock",
                fechaInicio: new Date(),
                fechaFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                area: "Tecnología",
                audiencia: "Estudiantes",
                capacidadMaxima: 100,
                inscritosActuales: 0,
                carreras: [{ id: 1, nombre: "Carrera Mock" }],
                precio: 50,
                modalidad: "virtual",
                estado: true,
                fechaCreacion: new Date(),
            };
        });
    }
    /**
     * POST /api/events
     * Crear nuevo evento
     */
    async createEvent(req, res) {
        await this.execute(req, res, async () => {
            const eventData = req.body;
            // Validación básica
            if (!eventData.nombre ||
                !eventData.descripcion ||
                !eventData.fechaInicio ||
                !eventData.fechaFin) {
                throw new Error("Faltan campos obligatorios: nombre, descripcion, fechaInicio, fechaFin");
            }
            // TODO: Implement when createEventUseCase is available in DIContainer
            // const createEventUseCase = this.container.getCreateEventUseCase();
            // Mock response for now
            return {
                id: Date.now(),
                nombre: eventData.nombre,
                descripcion: eventData.descripcion,
                fechaInicio: new Date(eventData.fechaInicio),
                fechaFin: new Date(eventData.fechaFin),
                area: eventData.area,
                audiencia: eventData.audiencia,
                capacidadMaxima: eventData.capacidadMaxima,
                inscritosActuales: 0,
                carreras: eventData.carreraIds.map((id) => ({
                    id,
                    nombre: `Carrera ${id}`,
                })),
                precio: eventData.precio || 0,
                modalidad: eventData.modalidad,
                estado: eventData.estado ?? true,
                fechaCreacion: new Date(),
            };
        });
    }
    /**
     * PUT /api/events/:id
     * Actualizar evento
     */
    async updateEvent(req, res) {
        await this.execute(req, res, async () => {
            const eventId = parseInt(req.params.id);
            if (isNaN(eventId)) {
                throw new Error("ID de evento inválido");
            }
            const eventData = req.body;
            // TODO: Implement when updateEventUseCase is available in DIContainer
            // const updateEventUseCase = this.container.getUpdateEventUseCase();
            // Mock response for now
            return {
                id: eventId,
                nombre: eventData.nombre || "Evento Mock Actualizado",
                descripcion: eventData.descripcion || "Descripción actualizada",
                fechaInicio: eventData.fechaInicio
                    ? new Date(eventData.fechaInicio)
                    : new Date(),
                fechaFin: eventData.fechaFin
                    ? new Date(eventData.fechaFin)
                    : new Date(),
                area: eventData.area || "Tecnología",
                audiencia: eventData.audiencia || "Estudiantes",
                capacidadMaxima: eventData.capacidadMaxima || 100,
                inscritosActuales: 0,
                carreras: eventData.carreraIds?.map((id) => ({
                    id,
                    nombre: `Carrera ${id}`,
                })) || [{ id: 1, nombre: "Carrera Mock" }],
                precio: eventData.precio || 0,
                modalidad: eventData.modalidad || "virtual",
                estado: eventData.estado ?? true,
                fechaCreacion: new Date(),
            };
        });
    }
    /**
     * DELETE /api/events/:id
     * Eliminar evento
     */
    async deleteEvent(req, res) {
        await this.execute(req, res, async () => {
            const eventId = parseInt(req.params.id);
            if (isNaN(eventId)) {
                throw new Error("ID de evento inválido");
            }
            // TODO: Implement when deleteEventUseCase is available in DIContainer
            // const deleteEventUseCase = this.container.getDeleteEventUseCase();
            // Mock response for now
            return { message: "Evento eliminado exitosamente" };
        });
    }
    /**
     * POST /api/events/:id/enroll
     * Inscribirse a un evento
     */
    async enrollToEvent(req, res) {
        await this.execute(req, res, async () => {
            const eventId = parseInt(req.params.id);
            const userId = this.getUserId(req);
            const enrollmentData = req.body;
            if (isNaN(eventId)) {
                throw new Error("ID de evento inválido");
            }
            // TODO: Implement when enrollToEventUseCase is available in DIContainer
            // const enrollToEventUseCase = this.container.getEnrollToEventUseCase();
            // Mock response for now
            return {
                id: Date.now(),
                usuario: {
                    id: userId,
                    nombres: "Usuario Mock",
                    apellidos: "Apellido Mock",
                    email: "user@mock.com",
                },
                evento: {
                    id: eventId,
                    nombre: "Evento Mock",
                },
                fechaInscripcion: new Date(),
                estadoPago: "pendiente",
                certificadoGenerado: false,
            };
        });
    }
    /**
     * GET /api/events/:id/enrollments
     * Obtener inscripciones de un evento (solo para administradores/organizadores)
     */
    async getEventEnrollments(req, res) {
        await this.execute(req, res, async () => {
            const eventId = parseInt(req.params.id);
            const { page, pageSize } = this.getPaginationParams(req);
            if (isNaN(eventId)) {
                throw new Error("ID de evento inválido");
            }
            // TODO: Implement when getEventEnrollmentsUseCase is available in DIContainer
            // const getEventEnrollmentsUseCase = this.container.getGetEventEnrollmentsUseCase();
            // Mock response for now
            return {
                enrollments: [
                    {
                        id: 1,
                        usuario: {
                            id: 1,
                            nombres: "Usuario Mock",
                            apellidos: "Apellido Mock",
                            email: "user@mock.com",
                        },
                        evento: {
                            id: eventId,
                            nombre: "Evento Mock",
                        },
                        fechaInscripcion: new Date(),
                        estadoPago: "completado",
                        certificadoGenerado: false,
                    },
                ],
                total: 1,
                page: page,
                pageSize: pageSize,
            };
        });
    }
    /**
     * GET /api/events/upcoming
     * Obtener eventos próximos
     */
    async getUpcomingEvents(req, res) {
        await this.execute(req, res, async () => {
            const { page, pageSize } = this.getPaginationParams(req);
            const { area, diasAnticipacion } = req.query;
            // TODO: Implement when getUpcomingEventsUseCase is available in DIContainer
            // const getUpcomingEventsUseCase = this.container.getGetUpcomingEventsUseCase();
            // Mock response for now
            const response = {
                events: [
                    {
                        id: 1,
                        nombre: "Evento Próximo Mock",
                        descripcion: "Descripción del evento próximo",
                        fechaInicio: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Próxima semana
                        fechaFin: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
                        area: "Tecnología",
                        audiencia: "Estudiantes",
                        capacidadMaxima: 100,
                        inscritosActuales: 15,
                        carreras: [{ id: 1, nombre: "Carrera Mock" }],
                        precio: 50,
                        modalidad: "virtual",
                        estado: true,
                        fechaCreacion: new Date(),
                    },
                ],
                total: 1,
                page: page,
                pageSize: pageSize,
            };
            return response;
        });
    }
    /**
     * GET /api/events/my-events
     * Obtener eventos del usuario autenticado
     */
    async getUserEvents(req, res) {
        await this.execute(req, res, async () => {
            const userId = this.getUserId(req);
            const { page, pageSize } = this.getPaginationParams(req);
            const { status } = req.query;
            // TODO: Implement when getUserEventsUseCase is available in DIContainer
            // const getUserEventsUseCase = this.container.getGetUserEventsUseCase();
            // Mock response for now
            return {
                enrollments: [
                    {
                        id: 1,
                        usuario: {
                            id: userId,
                            nombres: "Usuario Mock",
                            apellidos: "Apellido Mock",
                            email: "user@mock.com",
                        },
                        evento: {
                            id: 1,
                            nombre: "Mi Evento Mock",
                        },
                        fechaInscripcion: new Date(),
                        estadoPago: "completado",
                        certificadoGenerado: true,
                    },
                ],
                total: 1,
                page: page,
                pageSize: pageSize,
            };
        });
    }
    /**
     * GET /api/events/by-area
     * Obtener eventos por área
     */
    async getEventsByArea(req, res) {
        await this.execute(req, res, async () => {
            const { area } = req.params;
            const { page, pageSize } = this.getPaginationParams(req);
            const { modalidad, proximosEventos } = req.query;
            // TODO: Implement when getEventsByAreaUseCase is available in DIContainer
            // const getEventsByAreaUseCase = this.container.getGetEventsByAreaUseCase();
            // Mock response for now
            const response = {
                events: [
                    {
                        id: 1,
                        nombre: `Evento de ${area || "General"} Mock`,
                        descripcion: `Descripción del evento de ${area || "General"}`,
                        fechaInicio: new Date(),
                        fechaFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        area: area || "General",
                        audiencia: "Estudiantes",
                        capacidadMaxima: 100,
                        inscritosActuales: 10,
                        carreras: [{ id: 1, nombre: "Carrera Mock" }],
                        precio: 50,
                        modalidad: "virtual",
                        estado: true,
                        fechaCreacion: new Date(),
                    },
                ],
                total: 1,
                page: page,
                pageSize: pageSize,
            };
            return response;
        });
    }
}
exports.EventController = EventController;
//# sourceMappingURL=EventController.js.map