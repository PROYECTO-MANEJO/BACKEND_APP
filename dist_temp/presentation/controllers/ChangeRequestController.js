"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeRequestController = void 0;
const express_validator_1 = require("express-validator");
const DIContainer_1 = require("../../infrastructure/config/DIContainer");
class ChangeRequestController {
    constructor() {
        this.container = DIContainer_1.DIContainer.getInstance();
    }
    /**
     * POST /api/solicitudes-cambio
     * Crear una nueva solicitud de cambio
     */
    async createChangeRequest(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Datos de entrada inválidos",
                    errors: errors.array(),
                });
                return;
            }
            const { titulo_sol: title, descripcion_sol: description, justificacion_sol: justification, tipo_cambio_sol: changeType, prioridad_sol: priority = "MEDIA", urgencia_sol: urgency = "NORMAL", } = req.body;
            const requesterId = req.usuario?.id_usu;
            if (!requesterId) {
                res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado",
                });
                return;
            }
            const createUseCase = this.container.createChangeRequestUseCase;
            const changeRequest = await createUseCase.execute({
                title,
                description,
                justification,
                changeType,
                priority,
                urgency,
                requesterId,
            });
            res.status(201).json({
                success: true,
                message: "Solicitud de cambio creada exitosamente",
                data: changeRequest.toPlainObject(),
            });
        }
        catch (error) {
            console.error("Error creating change request:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
                error: error instanceof Error ? error.message : "Error desconocido",
            });
        }
    }
    /**
     * GET /api/solicitudes-cambio/:id
     * Obtener una solicitud de cambio por ID
     */
    async getChangeRequestById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de solicitud requerido",
                });
                return;
            }
            const getByIdUseCase = this.container.getChangeRequestByIdUseCase;
            const changeRequest = await getByIdUseCase.execute(id);
            if (!changeRequest) {
                res.status(404).json({
                    success: false,
                    message: "Solicitud de cambio no encontrada",
                });
                return;
            }
            res.json({
                success: true,
                data: changeRequest.toPlainObject(),
            });
        }
        catch (error) {
            console.error("Error getting change request:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
                error: error instanceof Error ? error.message : "Error desconocido",
            });
        }
    }
    /**
     * GET /api/solicitudes-cambio/mis-solicitudes
     * Obtener las solicitudes del usuario autenticado
     */
    async getMyChangeRequests(req, res) {
        try {
            const userId = req.usuario?.id_usu;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado",
                });
                return;
            }
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 10, 50);
            const getMyRequestsUseCase = this.container.getMyChangeRequestsUseCase;
            const result = await getMyRequestsUseCase.execute({
                userId,
                page,
                limit,
            });
            res.json({
                success: true,
                data: {
                    solicitudes: result.items.map((item) => item.toPlainObject()),
                    pagination: {
                        page,
                        limit,
                        total: result.total,
                        totalPages: Math.ceil(result.total / limit),
                    },
                },
            });
        }
        catch (error) {
            console.error("Error getting user change requests:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
                error: error instanceof Error ? error.message : "Error desconocido",
            });
        }
    }
    /**
     * GET /api/solicitudes-cambio
     * Obtener todas las solicitudes con filtros (solo admin/master)
     */
    async getAllChangeRequests(req, res) {
        try {
            const userRole = req.usuario?.rol;
            if (!userRole || !["ADMINISTRADOR", "MASTER"].includes(userRole)) {
                res.status(403).json({
                    success: false,
                    message: "Acceso denegado. Solo administradores pueden ver todas las solicitudes",
                });
                return;
            }
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 10, 50);
            const filters = {
                status: req.query.estado,
                changeType: req.query.tipo,
                priority: req.query.prioridad,
                urgency: req.query.urgencia,
                page,
                limit,
            };
            // Usar el repositorio directamente para esta operación
            const repository = this.container.newChangeRequestRepository;
            const result = await repository.findAll(filters);
            res.json({
                success: true,
                data: {
                    solicitudes: result.items.map((item) => item.toPlainObject()),
                    pagination: {
                        page: result.page,
                        limit,
                        total: result.total,
                        totalPages: result.totalPages,
                    },
                },
            });
        }
        catch (error) {
            console.error("Error getting all change requests:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
                error: error instanceof Error ? error.message : "Error desconocido",
            });
        }
    }
    /**
     * PUT /api/solicitudes-cambio/:id/estado
     * Actualizar el estado de una solicitud
     */
    async updateChangeRequestStatus(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Datos de entrada inválidos",
                    errors: errors.array(),
                });
                return;
            }
            const { id } = req.params;
            const { nuevo_estado: newStatus, comentarios: comments } = req.body;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de solicitud requerido",
                });
                return;
            }
            const userId = req.usuario?.id_usu;
            const userRole = req.usuario?.rol;
            if (!userId || !userRole) {
                res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado",
                });
                return;
            }
            const updateStatusUseCase = this.container.updateChangeRequestStatusUseCase;
            const updatedRequest = await updateStatusUseCase.execute({
                requestId: id,
                newStatus,
                userId,
                userRole,
                comments,
            });
            res.json({
                success: true,
                message: "Estado de solicitud actualizado exitosamente",
                data: updatedRequest.toPlainObject(),
            });
        }
        catch (error) {
            console.error("Error updating change request status:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Error interno del servidor",
            });
        }
    }
    /**
     * PUT /api/solicitudes-cambio/:id/asignar-desarrollador
     * Asignar un desarrollador a una solicitud
     */
    async assignDeveloper(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Datos de entrada inválidos",
                    errors: errors.array(),
                });
                return;
            }
            const userRole = req.usuario?.rol;
            if (!userRole || !["ADMINISTRADOR", "MASTER"].includes(userRole)) {
                res.status(403).json({
                    success: false,
                    message: "Solo los administradores pueden asignar desarrolladores",
                });
                return;
            }
            const { id } = req.params;
            const { id_desarrollador: developerId } = req.body;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de solicitud requerido",
                });
                return;
            }
            const assignUseCase = this.container.assignDeveloperUseCase;
            const updatedRequest = await assignUseCase.execute({
                requestId: id,
                developerId,
                assignedBy: req.usuario?.id_usu || "",
            });
            res.json({
                success: true,
                message: "Desarrollador asignado exitosamente",
                data: updatedRequest.toPlainObject(),
            });
        }
        catch (error) {
            console.error("Error assigning developer:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Error interno del servidor",
            });
        }
    }
    /**
     * GET /api/solicitudes-cambio/estadisticas
     * Obtener estadísticas de solicitudes de cambio
     */
    async getStatistics(req, res) {
        try {
            const userRole = req.usuario?.rol;
            if (!userRole || !["ADMINISTRADOR", "MASTER"].includes(userRole)) {
                res.status(403).json({
                    success: false,
                    message: "Acceso denegado",
                });
                return;
            }
            const repository = this.container.newChangeRequestRepository;
            const statistics = await repository.getStatistics();
            res.json({
                success: true,
                data: statistics,
            });
        }
        catch (error) {
            console.error("Error getting statistics:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }
}
exports.ChangeRequestController = ChangeRequestController;
