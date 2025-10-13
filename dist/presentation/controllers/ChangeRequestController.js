"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeRequestController = void 0;
const BaseController_1 = require("./BaseController");
class ChangeRequestController extends BaseController_1.BaseController {
    constructor(container) {
        super();
        this.container = container;
    }
    /**
     * POST /api/change-requests
     * Crear una nueva solicitud de cambio
     */
    async createChangeRequest(req, res) {
        try {
            const { titulo_sol, descripcion_sol, justificacion_sol, tipo_cambio_sol, prioridad_sol = 'MEDIA', urgencia_sol = 'NORMAL' } = req.body;
            const usuario_id = req.usuario?.id_usu || req.uid;
            if (!usuario_id) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }
            // Validaciones básicas
            if (!titulo_sol || !descripcion_sol || !justificacion_sol || !tipo_cambio_sol) {
                res.status(400).json({
                    success: false,
                    message: 'Título, descripción, justificación y tipo de cambio son requeridos'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            // Crear la solicitud
            const nuevaSolicitud = await prisma.solicitudCambio.create({
                data: {
                    titulo_sol,
                    descripcion_sol,
                    justificacion_sol,
                    tipo_cambio_sol,
                    prioridad_sol: prioridad_sol,
                    urgencia_sol: urgencia_sol,
                    id_usuario_sol: usuario_id,
                    estado_sol: 'BORRADOR'
                },
                include: {
                    usuario: {
                        select: {
                            id_usu: true,
                            nom_usu1: true,
                            ape_usu1: true,
                            ced_usu: true
                        }
                    }
                }
            });
            res.status(201).json({
                success: true,
                message: 'Solicitud de cambio creada exitosamente',
                data: {
                    id_sol: nuevaSolicitud.id_sol,
                    titulo_sol: nuevaSolicitud.titulo_sol,
                    descripcion_sol: nuevaSolicitud.descripcion_sol,
                    justificacion_sol: nuevaSolicitud.justificacion_sol,
                    tipo_cambio_sol: nuevaSolicitud.tipo_cambio_sol,
                    prioridad_sol: nuevaSolicitud.prioridad_sol,
                    urgencia_sol: nuevaSolicitud.urgencia_sol,
                    estado_sol: nuevaSolicitud.estado_sol,
                    fec_creacion_sol: nuevaSolicitud.fec_creacion_sol,
                    usuarioSolicitante: nuevaSolicitud.usuario
                }
            });
        }
        catch (error) {
            console.error('[createChangeRequest] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * GET /api/change-requests/my-requests
     * Obtener solicitudes del usuario autenticado
     */
    async getMyChangeRequests(req, res) {
        try {
            const usuario_id = req.usuario?.id_usu || req.uid;
            if (!usuario_id) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            const solicitudes = await prisma.solicitudCambio.findMany({
                where: { id_usuario_sol: usuario_id },
                include: {
                    usuario: {
                        select: {
                            id_usu: true,
                            nom_usu1: true,
                            ape_usu1: true,
                            ced_usu: true
                        }
                    },
                    adminResponsable: {
                        select: {
                            id_usu: true,
                            nom_usu1: true,
                            ape_usu1: true
                        }
                    },
                    desarrolladorAsignado: {
                        select: {
                            id_usu: true,
                            nom_usu1: true,
                            ape_usu1: true
                        }
                    }
                },
                orderBy: { fec_creacion_sol: 'desc' }
            });
            res.json({
                success: true,
                data: {
                    solicitudes: solicitudes.map(sol => ({
                        id_sol: sol.id_sol,
                        titulo_sol: sol.titulo_sol,
                        descripcion_sol: sol.descripcion_sol,
                        justificacion_sol: sol.justificacion_sol,
                        tipo_cambio_sol: sol.tipo_cambio_sol,
                        prioridad_sol: sol.prioridad_sol,
                        urgencia_sol: sol.urgencia_sol,
                        estado_sol: sol.estado_sol,
                        fec_creacion_sol: sol.fec_creacion_sol,
                        fec_ultima_actualizacion: sol.fec_ultima_actualizacion,
                        comentarios_admin_sol: sol.comentarios_admin_sol,
                        usuarioSolicitante: sol.usuario,
                        adminResponsable: sol.adminResponsable,
                        desarrolladorAsignado: sol.desarrolladorAsignado,
                        // Indicar si puede editar (solo en BORRADOR)
                        puede_editar: sol.estado_sol === 'BORRADOR',
                        puede_cancelar: sol.estado_sol === 'BORRADOR',
                        puede_enviar: sol.estado_sol === 'BORRADOR'
                    })),
                    total: solicitudes.length
                }
            });
        }
        catch (error) {
            console.error('[getMyChangeRequests] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * GET /api/change-requests (Admin only)
     * Obtener todas las solicitudes (solo administradores)
     */
    async getAllChangeRequests(req, res) {
        try {
            // La validación de roles ya se hace en el middleware validateRoles
            // No necesitamos validar aquí nuevamente
            const prisma = this.container.getPrismaClient();
            const { estado, prioridad, page = 1, limit = 10 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const where = {};
            if (estado)
                where.estado_sol = estado;
            if (prioridad)
                where.prioridad_sol = prioridad;
            const [solicitudes, total] = await Promise.all([
                prisma.solicitudCambio.findMany({
                    where,
                    include: {
                        usuario: {
                            select: {
                                id_usu: true,
                                nom_usu1: true,
                                ape_usu1: true,
                                ced_usu: true
                            }
                        },
                        adminResponsable: {
                            select: {
                                id_usu: true,
                                nom_usu1: true,
                                ape_usu1: true
                            }
                        },
                        desarrolladorAsignado: {
                            select: {
                                id_usu: true,
                                nom_usu1: true,
                                ape_usu1: true
                            }
                        }
                    },
                    orderBy: { fec_creacion_sol: 'desc' },
                    skip,
                    take: Number(limit)
                }),
                prisma.solicitudCambio.count({ where })
            ]);
            res.json({
                success: true,
                solicitudes: solicitudes.map(sol => ({
                    id_sol: sol.id_sol,
                    titulo_sol: sol.titulo_sol,
                    descripcion_sol: sol.descripcion_sol,
                    estado_sol: sol.estado_sol,
                    prioridad_sol: sol.prioridad_sol,
                    urgencia_sol: sol.urgencia_sol,
                    tipo_cambio_sol: sol.tipo_cambio_sol,
                    fec_creacion_sol: sol.fec_creacion_sol,
                    fec_ultima_actualizacion: sol.fec_ultima_actualizacion,
                    usuario: sol.usuario,
                    adminResponsable: sol.adminResponsable,
                    desarrolladorAsignado: sol.desarrolladorAsignado
                })),
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            });
        }
        catch (error) {
            console.error('[getAllChangeRequests] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * PUT /api/change-requests/:id/status (Admin only)
     * Actualizar estado de solicitud
     */
    async updateChangeRequestStatus(req, res) {
        try {
            const { id } = req.params;
            const { estado_sol, obs_admin_sol } = req.body;
            const usuario_id = req.usuario?.id_usu || req.uid;
            // Obtener el rol correctamente desde las cuentas del usuario
            const usuario_rol = req.usuario?.cuentas?.[0]?.rol_cue;
            if (usuario_rol !== 'ADMINISTRADOR' && usuario_rol !== 'MASTER') {
                res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para esta acción'
                });
                return;
            }
            if (!estado_sol) {
                res.status(400).json({
                    success: false,
                    message: 'Estado es requerido'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            const solicitud = await prisma.solicitudCambio.findUnique({
                where: { id_sol: id }
            });
            if (!solicitud) {
                res.status(404).json({
                    success: false,
                    message: 'Solicitud no encontrada'
                });
                return;
            }
            const solicitudActualizada = await prisma.solicitudCambio.update({
                where: { id_sol: id },
                data: {
                    estado_sol: estado_sol,
                    comentarios_admin_sol: obs_admin_sol || solicitud.comentarios_admin_sol,
                    id_admin_resp_sol: usuario_id,
                    fec_ultima_actualizacion: new Date()
                },
                include: {
                    usuario: {
                        select: {
                            id_usu: true,
                            nom_usu1: true,
                            ape_usu1: true,
                            ced_usu: true
                        }
                    },
                    adminResponsable: {
                        select: {
                            id_usu: true,
                            nom_usu1: true,
                            ape_usu1: true
                        }
                    }
                }
            });
            res.json({
                success: true,
                message: 'Estado de solicitud actualizado exitosamente',
                solicitud: {
                    id_sol: solicitudActualizada.id_sol,
                    titulo_sol: solicitudActualizada.titulo_sol,
                    estado_sol: solicitudActualizada.estado_sol,
                    comentarios_admin_sol: solicitudActualizada.comentarios_admin_sol,
                    fec_ultima_actualizacion: solicitudActualizada.fec_ultima_actualizacion,
                    usuario: solicitudActualizada.usuario,
                    adminResponsable: solicitudActualizada.adminResponsable
                }
            });
        }
        catch (error) {
            console.error('[updateChangeRequestStatus] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * PUT /api/solicitudes-cambio/:id/editar
     * Actualizar solicitud (solo BORRADOR)
     */
    async updateChangeRequest(req, res) {
        try {
            const { id } = req.params;
            const usuario_id = req.usuario?.id_usu || req.uid;
            const { titulo_sol, descripcion_sol, justificacion_sol, tipo_cambio_sol, prioridad_sol, urgencia_sol } = req.body;
            if (!usuario_id) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            // Verificar que la solicitud existe y es del usuario
            const solicitudExistente = await prisma.solicitudCambio.findFirst({
                where: {
                    id_sol: id,
                    id_usuario_sol: usuario_id
                }
            });
            if (!solicitudExistente) {
                res.status(404).json({
                    success: false,
                    message: 'Solicitud no encontrada'
                });
                return;
            }
            // Solo se puede editar si está en BORRADOR
            if (solicitudExistente.estado_sol !== 'BORRADOR') {
                res.status(400).json({
                    success: false,
                    message: 'Solo se pueden editar solicitudes en estado BORRADOR'
                });
                return;
            }
            // Actualizar la solicitud
            const solicitudActualizada = await prisma.solicitudCambio.update({
                where: { id_sol: id },
                data: {
                    titulo_sol,
                    descripcion_sol,
                    justificacion_sol,
                    tipo_cambio_sol,
                    prioridad_sol: prioridad_sol,
                    urgencia_sol: urgencia_sol,
                    fec_ultima_actualizacion: new Date()
                },
                include: {
                    usuario: {
                        select: {
                            id_usu: true,
                            nom_usu1: true,
                            ape_usu1: true,
                            ced_usu: true
                        }
                    }
                }
            });
            res.json({
                success: true,
                message: 'Solicitud actualizada exitosamente',
                data: {
                    id_sol: solicitudActualizada.id_sol,
                    titulo_sol: solicitudActualizada.titulo_sol,
                    descripcion_sol: solicitudActualizada.descripcion_sol,
                    justificacion_sol: solicitudActualizada.justificacion_sol,
                    tipo_cambio_sol: solicitudActualizada.tipo_cambio_sol,
                    prioridad_sol: solicitudActualizada.prioridad_sol,
                    urgencia_sol: solicitudActualizada.urgencia_sol,
                    estado_sol: solicitudActualizada.estado_sol,
                    fec_ultima_actualizacion: solicitudActualizada.fec_ultima_actualizacion,
                    usuarioSolicitante: solicitudActualizada.usuario
                }
            });
        }
        catch (error) {
            console.error('[updateChangeRequest] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * PUT /api/solicitudes-cambio/:id/enviar
     * Enviar solicitud (BORRADOR → PENDIENTE)
     */
    async submitChangeRequest(req, res) {
        try {
            const { id } = req.params;
            const usuario_id = req.usuario?.id_usu || req.uid;
            if (!usuario_id) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            // Verificar que la solicitud existe y es del usuario
            const solicitudExistente = await prisma.solicitudCambio.findFirst({
                where: {
                    id_sol: id,
                    id_usuario_sol: usuario_id
                }
            });
            if (!solicitudExistente) {
                res.status(404).json({
                    success: false,
                    message: 'Solicitud no encontrada'
                });
                return;
            }
            // Solo se puede enviar si está en BORRADOR
            if (solicitudExistente.estado_sol !== 'BORRADOR') {
                res.status(400).json({
                    success: false,
                    message: 'Solo se pueden enviar solicitudes en estado BORRADOR'
                });
                return;
            }
            // Cambiar estado a PENDIENTE
            const solicitudActualizada = await prisma.solicitudCambio.update({
                where: { id_sol: id },
                data: {
                    estado_sol: 'PENDIENTE',
                    fec_ultima_actualizacion: new Date()
                },
                include: {
                    usuario: {
                        select: {
                            id_usu: true,
                            nom_usu1: true,
                            ape_usu1: true,
                            ced_usu: true
                        }
                    }
                }
            });
            res.json({
                success: true,
                message: 'Solicitud enviada exitosamente',
                data: {
                    id_sol: solicitudActualizada.id_sol,
                    estado_sol: solicitudActualizada.estado_sol,
                    fec_ultima_actualizacion: solicitudActualizada.fec_ultima_actualizacion,
                    usuarioSolicitante: solicitudActualizada.usuario
                }
            });
        }
        catch (error) {
            console.error('[submitChangeRequest] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * PUT /api/solicitudes-cambio/:id/cancelar
     * Cancelar solicitud (solo BORRADOR)
     */
    async cancelChangeRequest(req, res) {
        try {
            const { id } = req.params;
            const usuario_id = req.usuario?.id_usu || req.uid;
            if (!usuario_id) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            // Verificar que la solicitud existe y es del usuario
            const solicitudExistente = await prisma.solicitudCambio.findFirst({
                where: {
                    id_sol: id,
                    id_usuario_sol: usuario_id
                }
            });
            if (!solicitudExistente) {
                res.status(404).json({
                    success: false,
                    message: 'Solicitud no encontrada'
                });
                return;
            }
            // Solo se puede cancelar si está en BORRADOR
            if (solicitudExistente.estado_sol !== 'BORRADOR') {
                res.status(400).json({
                    success: false,
                    message: 'Solo se pueden cancelar solicitudes en estado BORRADOR'
                });
                return;
            }
            // Cambiar estado a CANCELADA
            const solicitudActualizada = await prisma.solicitudCambio.update({
                where: { id_sol: id },
                data: {
                    estado_sol: 'CANCELADA',
                    fec_ultima_actualizacion: new Date()
                },
                include: {
                    usuario: {
                        select: {
                            id_usu: true,
                            nom_usu1: true,
                            ape_usu1: true,
                            ced_usu: true
                        }
                    }
                }
            });
            res.json({
                success: true,
                message: 'Solicitud cancelada exitosamente',
                data: {
                    id_sol: solicitudActualizada.id_sol,
                    estado_sol: solicitudActualizada.estado_sol,
                    fec_ultima_actualizacion: solicitudActualizada.fec_ultima_actualizacion,
                    usuarioSolicitante: solicitudActualizada.usuario
                }
            });
        }
        catch (error) {
            console.error('[cancelChangeRequest] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * GET /api/solicitudes-cambio/mis-estadisticas
     * Obtener estadísticas del usuario
     */
    async getMyStatistics(req, res) {
        try {
            const usuario_id = req.usuario?.id_usu || req.uid;
            if (!usuario_id) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            // Obtener estadísticas por estado
            const estadisticas = await prisma.solicitudCambio.groupBy({
                by: ['estado_sol'],
                where: {
                    id_usuario_sol: usuario_id
                },
                _count: {
                    estado_sol: true
                }
            });
            // Formatear estadísticas
            const estadisticasFormateadas = {
                total: 0,
                borrador: 0,
                pendiente: 0,
                en_revision: 0,
                aprobada: 0,
                rechazada: 0,
                cancelada: 0,
                en_desarrollo: 0,
                completada: 0
            };
            estadisticas.forEach(stat => {
                const count = stat._count.estado_sol;
                estadisticasFormateadas.total += count;
                switch (stat.estado_sol) {
                    case 'BORRADOR':
                        estadisticasFormateadas.borrador = count;
                        break;
                    case 'PENDIENTE':
                        estadisticasFormateadas.pendiente = count;
                        break;
                    case 'EN_REVISION':
                        estadisticasFormateadas.en_revision = count;
                        break;
                    case 'APROBADA':
                        estadisticasFormateadas.aprobada = count;
                        break;
                    case 'RECHAZADA':
                        estadisticasFormateadas.rechazada = count;
                        break;
                    case 'CANCELADA':
                        estadisticasFormateadas.cancelada = count;
                        break;
                    case 'EN_DESARROLLO':
                        estadisticasFormateadas.en_desarrollo = count;
                        break;
                    case 'COMPLETADA':
                        estadisticasFormateadas.completada = count;
                        break;
                }
            });
            res.json({
                success: true,
                data: estadisticasFormateadas
            });
        }
        catch (error) {
            console.error('[getMyStatistics] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * GET /api/solicitudes-cambio/admin/desarrolladores
     * Obtener lista de desarrolladores disponibles (Admin/Master only)
     */
    async getDevelopers(req, res) {
        try {
            const prisma = this.container.getPrismaClient();
            // Obtener usuarios con rol DESARROLLADOR
            const desarrolladores = await prisma.usuario.findMany({
                where: {
                    cuentas: {
                        some: {
                            rol_cue: 'DESARROLLADOR'
                        }
                    }
                },
                include: {
                    cuentas: {
                        select: {
                            cor_cue: true,
                            rol_cue: true
                        }
                    }
                },
                orderBy: {
                    nom_usu1: 'asc'
                }
            });
            const desarrolladoresFormateados = desarrolladores.map(dev => ({
                id_usu: dev.id_usu,
                ced_usu: dev.ced_usu,
                nom_usu1: dev.nom_usu1,
                nom_usu2: dev.nom_usu2,
                ape_usu1: dev.ape_usu1,
                ape_usu2: dev.ape_usu2,
                email: dev.cuentas[0]?.cor_cue,
                rol: dev.cuentas[0]?.rol_cue,
                nombre_completo: `${dev.nom_usu1} ${dev.nom_usu2 || ''} ${dev.ape_usu1} ${dev.ape_usu2 || ''}`.trim()
            }));
            res.json({
                success: true,
                data: desarrolladoresFormateados,
                total: desarrolladoresFormateados.length
            });
        }
        catch (error) {
            console.error('[getDevelopers] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * GET /api/solicitudes-cambio/admin/estadisticas
     * Obtener estadísticas generales del sistema (Admin/Master only)
     */
    async getAdminStatistics(req, res) {
        try {
            const prisma = this.container.getPrismaClient();
            // Obtener estadísticas generales por estado
            const estadisticasPorEstado = await prisma.solicitudCambio.groupBy({
                by: ['estado_sol'],
                _count: {
                    id_sol: true
                }
            });
            // Obtener estadísticas por prioridad
            const estadisticasPorPrioridad = await prisma.solicitudCambio.groupBy({
                by: ['prioridad_sol'],
                _count: {
                    id_sol: true
                }
            });
            // Obtener estadísticas por tipo
            const estadisticasPorTipo = await prisma.solicitudCambio.groupBy({
                by: ['tipo_cambio_sol'],
                _count: {
                    id_sol: true
                }
            });
            // Obtener total de solicitudes
            const totalSolicitudes = await prisma.solicitudCambio.count();
            // Obtener solicitudes recientes (últimos 30 días)
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - 30);
            const solicitudesRecientes = await prisma.solicitudCambio.count({
                where: {
                    fec_creacion_sol: {
                        gte: fechaLimite
                    }
                }
            });
            // Formatear respuesta
            const estadisticas = {
                total: totalSolicitudes,
                recientes_30_dias: solicitudesRecientes,
                por_estado: estadisticasPorEstado.reduce((acc, curr) => {
                    acc[curr.estado_sol.toLowerCase()] = curr._count?.id_sol || 0;
                    return acc;
                }, {}),
                por_prioridad: estadisticasPorPrioridad.reduce((acc, curr) => {
                    acc[curr.prioridad_sol.toLowerCase()] = curr._count?.id_sol || 0;
                    return acc;
                }, {}),
                por_tipo: estadisticasPorTipo.reduce((acc, curr) => {
                    acc[curr.tipo_cambio_sol.toLowerCase()] = curr._count?.id_sol || 0;
                    return acc;
                }, {})
            };
            res.json({
                success: true,
                data: estadisticas
            });
        }
        catch (error) {
            console.error('[getAdminStatistics] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * GET /api/solicitudes-cambio/admin/solicitud/:id
     * Obtener una solicitud específica para admin/master
     */
    async getChangeRequestById(req, res) {
        try {
            const { id } = req.params;
            const prisma = this.container.getPrismaClient();
            // Buscar la solicitud con todos los datos relacionados
            const solicitud = await prisma.solicitudCambio.findUnique({
                where: { id_sol: id },
                include: {
                    usuario: {
                        select: {
                            id_usu: true,
                            ced_usu: true,
                            nom_usu1: true,
                            nom_usu2: true,
                            ape_usu1: true,
                            ape_usu2: true,
                            cuentas: {
                                select: {
                                    cor_cue: true,
                                    rol_cue: true
                                }
                            }
                        }
                    },
                    desarrolladorAsignado: {
                        select: {
                            id_usu: true,
                            ced_usu: true,
                            nom_usu1: true,
                            nom_usu2: true,
                            ape_usu1: true,
                            ape_usu2: true,
                            cuentas: {
                                select: {
                                    cor_cue: true
                                }
                            }
                        }
                    }
                }
            });
            if (!solicitud) {
                res.status(404).json({
                    success: false,
                    message: 'Solicitud de cambio no encontrada'
                });
                return;
            }
            // Formatear la respuesta
            const solicitudFormateada = {
                id_sol: solicitud.id_sol,
                titulo_sol: solicitud.titulo_sol,
                descripcion_sol: solicitud.descripcion_sol,
                justificacion_sol: solicitud.justificacion_sol,
                tipo_cambio_sol: solicitud.tipo_cambio_sol,
                prioridad_sol: solicitud.prioridad_sol,
                urgencia_sol: solicitud.urgencia_sol,
                impacto_negocio_sol: solicitud.impacto_negocio_sol,
                impacto_tecnico_sol: solicitud.impacto_tecnico_sol,
                riesgo_cambio_sol: solicitud.riesgo_cambio_sol,
                categoria_cambio_sol: solicitud.categoria_cambio_sol,
                estado_sol: solicitud.estado_sol,
                fec_creacion_sol: solicitud.fec_creacion_sol,
                fec_ultima_actualizacion: solicitud.fec_ultima_actualizacion,
                comentarios_admin_sol: solicitud.comentarios_admin_sol,
                github_repo_url: solicitud.github_repo_url,
                // Datos del usuario solicitante
                usuario: {
                    id_usu: solicitud.usuario.id_usu,
                    cedula: solicitud.usuario.ced_usu,
                    nombre_completo: `${solicitud.usuario.nom_usu1} ${solicitud.usuario.nom_usu2 || ''} ${solicitud.usuario.ape_usu1} ${solicitud.usuario.ape_usu2 || ''}`.trim(),
                    email: solicitud.usuario.cuentas[0]?.cor_cue,
                    rol: solicitud.usuario.cuentas[0]?.rol_cue
                },
                // Datos del desarrollador asignado (si existe)
                desarrollador_asignado: solicitud.desarrolladorAsignado ? {
                    id_usu: solicitud.desarrolladorAsignado.id_usu,
                    cedula: solicitud.desarrolladorAsignado.ced_usu,
                    nombre_completo: `${solicitud.desarrolladorAsignado.nom_usu1} ${solicitud.desarrolladorAsignado.nom_usu2 || ''} ${solicitud.desarrolladorAsignado.ape_usu1} ${solicitud.desarrolladorAsignado.ape_usu2 || ''}`.trim(),
                    email: solicitud.desarrolladorAsignado.cuentas[0]?.cor_cue
                } : null,
                // Campos de gestión
                id_desarrollador_asignado: solicitud.id_desarrollador_asignado,
                tiempo_estimado_horas_sol: solicitud.tiempo_estimado_horas_sol,
                plan_implementacion_sol: solicitud.plan_implementacion_sol,
                plan_rollout_sol: solicitud.plan_rollout_sol
            };
            // Si es la primera vez que un admin ve esta solicitud y está PENDIENTE,
            // cambiar automáticamente el estado a EN_REVISION
            if (solicitud.estado_sol === 'PENDIENTE') {
                await prisma.solicitudCambio.update({
                    where: { id_sol: id },
                    data: {
                        estado_sol: 'EN_REVISION',
                        fec_ultima_actualizacion: new Date()
                    }
                });
                solicitudFormateada.estado_sol = 'EN_REVISION';
                solicitudFormateada.fec_ultima_actualizacion = new Date();
            }
            res.json({
                success: true,
                data: solicitudFormateada
            });
        }
        catch (error) {
            console.error('[getChangeRequestById] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * PUT /api/solicitudes-cambio/admin/:id/aprobar
     * Aprobar una solicitud de cambio (EN_REVISION → APROBADA)
     */
    async approveChangeRequest(req, res) {
        try {
            const { id } = req.params;
            const { comentarios_admin_sol } = req.body;
            const prisma = this.container.getPrismaClient();
            // Verificar que la solicitud existe
            const solicitud = await prisma.solicitudCambio.findUnique({
                where: { id_sol: id }
            });
            if (!solicitud) {
                res.status(404).json({
                    success: false,
                    message: 'Solicitud de cambio no encontrada'
                });
                return;
            }
            // Verificar que la solicitud está en estado EN_REVISION
            if (solicitud.estado_sol !== 'EN_REVISION') {
                res.status(400).json({
                    success: false,
                    message: 'Solo se pueden aprobar solicitudes en estado EN_REVISION'
                });
                return;
            }
            // Actualizar la solicitud
            const solicitudActualizada = await prisma.solicitudCambio.update({
                where: { id_sol: id },
                data: {
                    estado_sol: 'APROBADA',
                    fec_ultima_actualizacion: new Date(),
                    fec_respuesta_sol: new Date(),
                    comentarios_admin_sol: comentarios_admin_sol || null
                }
            });
            res.json({
                success: true,
                message: 'Solicitud aprobada exitosamente',
                data: {
                    id_sol: solicitudActualizada.id_sol,
                    estado_sol: solicitudActualizada.estado_sol,
                    fec_respuesta_sol: solicitudActualizada.fec_respuesta_sol,
                    comentarios_admin_sol: solicitudActualizada.comentarios_admin_sol
                }
            });
        }
        catch (error) {
            console.error('[approveChangeRequest] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * PUT /api/solicitudes-cambio/admin/:id/rechazar
     * Rechazar una solicitud de cambio (EN_REVISION → RECHAZADA)
     */
    async rejectChangeRequest(req, res) {
        try {
            const { id } = req.params;
            const { comentarios_admin_sol, motivo_rechazo } = req.body;
            const prisma = this.container.getPrismaClient();
            // Verificar que la solicitud existe
            const solicitud = await prisma.solicitudCambio.findUnique({
                where: { id_sol: id }
            });
            if (!solicitud) {
                res.status(404).json({
                    success: false,
                    message: 'Solicitud de cambio no encontrada'
                });
                return;
            }
            // Verificar que la solicitud está en estado EN_REVISION
            if (solicitud.estado_sol !== 'EN_REVISION') {
                res.status(400).json({
                    success: false,
                    message: 'Solo se pueden rechazar solicitudes en estado EN_REVISION'
                });
                return;
            }
            // Actualizar la solicitud
            const solicitudActualizada = await prisma.solicitudCambio.update({
                where: { id_sol: id },
                data: {
                    estado_sol: 'RECHAZADA',
                    fec_ultima_actualizacion: new Date(),
                    fec_respuesta_sol: new Date(),
                    comentarios_admin_sol: comentarios_admin_sol || null,
                    // Nota: El campo motivo_rechazo no existe en el schema, usar comentarios_admin_sol
                }
            });
            res.json({
                success: true,
                message: 'Solicitud rechazada exitosamente',
                data: {
                    id_sol: solicitudActualizada.id_sol,
                    estado_sol: solicitudActualizada.estado_sol,
                    fec_respuesta_sol: solicitudActualizada.fec_respuesta_sol,
                    comentarios_admin_sol: solicitudActualizada.comentarios_admin_sol
                }
            });
        }
        catch (error) {
            console.error('[rejectChangeRequest] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * PUT /api/solicitudes-cambio/admin/:id/actualizar
     * Actualizar solicitud con campos de admin/master
     */
    async updateChangeRequestMaster(req, res) {
        try {
            const { id } = req.params;
            const { impacto_negocio_sol, impacto_tecnico_sol, riesgo_cambio_sol, categoria_cambio_sol, comentarios_admin_sol, fecha_planificada_inicio_sol, fecha_planificada_fin_sol, hora_planificada_inicio_sol, hora_planificada_fin_sol, tiempo_estimado_horas_sol, id_desarrollador_asignado, plan_implementacion_sol, plan_rollout_sol, estado_sol } = req.body;
            const prisma = this.container.getPrismaClient();
            // Verificar que la solicitud existe
            const solicitudExistente = await prisma.solicitudCambio.findUnique({
                where: { id_sol: id }
            });
            if (!solicitudExistente) {
                res.status(404).json({
                    success: false,
                    message: 'Solicitud no encontrada'
                });
                return;
            }
            // Solo permitir actualización en estados específicos
            const estadosPermitidos = ['PENDIENTE', 'EN_REVISION', 'APROBADA', 'EN_DESARROLLO'];
            if (!estadosPermitidos.includes(solicitudExistente.estado_sol)) {
                res.status(403).json({
                    success: false,
                    message: `No se puede actualizar la solicitud en estado ${solicitudExistente.estado_sol}`
                });
                return;
            }
            // Preparar datos para actualización - SOLO CAMPOS DEL ADMIN MASTER
            const datosActualizacion = {
                fec_ultima_actualizacion: new Date()
            };
            // Agregar campos que tienen valor
            if (impacto_negocio_sol !== undefined) {
                datosActualizacion.impacto_negocio_sol = impacto_negocio_sol;
            }
            if (impacto_tecnico_sol !== undefined) {
                datosActualizacion.impacto_tecnico_sol = impacto_tecnico_sol;
            }
            if (riesgo_cambio_sol !== undefined) {
                datosActualizacion.riesgo_cambio_sol = riesgo_cambio_sol;
            }
            if (categoria_cambio_sol !== undefined) {
                datosActualizacion.categoria_cambio_sol = categoria_cambio_sol;
            }
            if (comentarios_admin_sol !== undefined) {
                datosActualizacion.comentarios_admin_sol = comentarios_admin_sol;
            }
            if (fecha_planificada_inicio_sol !== undefined) {
                datosActualizacion.fecha_planificada_inicio_sol = fecha_planificada_inicio_sol ? new Date(fecha_planificada_inicio_sol) : null;
            }
            if (fecha_planificada_fin_sol !== undefined) {
                datosActualizacion.fecha_planificada_fin_sol = fecha_planificada_fin_sol ? new Date(fecha_planificada_fin_sol) : null;
            }
            if (hora_planificada_inicio_sol !== undefined) {
                datosActualizacion.hora_planificada_inicio_sol = hora_planificada_inicio_sol;
            }
            if (hora_planificada_fin_sol !== undefined) {
                datosActualizacion.hora_planificada_fin_sol = hora_planificada_fin_sol;
            }
            if (tiempo_estimado_horas_sol !== undefined) {
                datosActualizacion.tiempo_estimado_horas_sol = tiempo_estimado_horas_sol ? parseInt(tiempo_estimado_horas_sol.toString()) : null;
            }
            if (id_desarrollador_asignado !== undefined) {
                datosActualizacion.id_desarrollador_asignado = id_desarrollador_asignado || null;
            }
            // Agregar campos de planes técnicos
            if (plan_implementacion_sol !== undefined) {
                datosActualizacion.plan_implementacion_sol = plan_implementacion_sol;
            }
            if (plan_rollout_sol !== undefined) {
                datosActualizacion.plan_rollout_sol = plan_rollout_sol;
            }
            // Manejo del cambio de estado
            if (estado_sol !== undefined) {
                // Validar transiciones de estado permitidas
                const transicionesPermitidas = {
                    'APROBADA': ['EN_DESARROLLO'],
                    'EN_DESARROLLO': ['EN_TESTING', 'LISTO_PARA_IMPLEMENTAR']
                };
                if (transicionesPermitidas[solicitudExistente.estado_sol]?.includes(estado_sol)) {
                    datosActualizacion.estado_sol = estado_sol;
                    datosActualizacion.fec_respuesta_sol = new Date();
                }
            }
            // Actualizar la solicitud
            const solicitudActualizada = await prisma.solicitudCambio.update({
                where: { id_sol: id },
                data: datosActualizacion,
                include: {
                    usuario: {
                        select: {
                            nom_usu1: true,
                            nom_usu2: true,
                            ape_usu1: true,
                            ape_usu2: true,
                            ced_usu: true,
                            cuentas: {
                                select: {
                                    cor_cue: true,
                                    rol_cue: true
                                }
                            }
                        }
                    },
                    desarrolladorAsignado: {
                        select: {
                            nom_usu1: true,
                            nom_usu2: true,
                            ape_usu1: true,
                            ape_usu2: true,
                            ced_usu: true,
                            cuentas: {
                                select: {
                                    cor_cue: true
                                }
                            }
                        }
                    }
                }
            });
            res.json({
                success: true,
                message: 'Solicitud actualizada exitosamente',
                data: {
                    id_sol: solicitudActualizada.id_sol,
                    titulo_sol: solicitudActualizada.titulo_sol,
                    estado_sol: solicitudActualizada.estado_sol,
                    fec_ultima_actualizacion: solicitudActualizada.fec_ultima_actualizacion,
                    impacto_negocio_sol: solicitudActualizada.impacto_negocio_sol,
                    impacto_tecnico_sol: solicitudActualizada.impacto_tecnico_sol,
                    riesgo_cambio_sol: solicitudActualizada.riesgo_cambio_sol,
                    categoria_cambio_sol: solicitudActualizada.categoria_cambio_sol,
                    comentarios_admin_sol: solicitudActualizada.comentarios_admin_sol,
                    tiempo_estimado_horas_sol: solicitudActualizada.tiempo_estimado_horas_sol,
                    id_desarrollador_asignado: solicitudActualizada.id_desarrollador_asignado,
                    plan_implementacion_sol: solicitudActualizada.plan_implementacion_sol,
                    plan_rollout_sol: solicitudActualizada.plan_rollout_sol,
                    usuario: solicitudActualizada.usuario,
                    desarrollador_asignado: solicitudActualizada.desarrolladorAsignado
                }
            });
        }
        catch (error) {
            console.error('[updateChangeRequestMaster] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}
exports.ChangeRequestController = ChangeRequestController;
//# sourceMappingURL=ChangeRequestController.js.map