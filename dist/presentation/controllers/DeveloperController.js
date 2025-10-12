"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeveloperController = void 0;
const BaseController_1 = require("./BaseController");
class DeveloperController extends BaseController_1.BaseController {
    constructor(container) {
        super();
        this.container = container;
    }
    /**
     * GET /api/developers
     * Obtener lista de desarrolladores disponibles
     */
    async getAllDevelopers(req, res) {
        try {
            const userRole = req.usuario?.rol;
            if (!userRole || !["ADMINISTRADOR", "MASTER", "DESARROLLADOR"].includes(userRole)) {
                res.status(403).json({
                    success: false,
                    message: "Acceso denegado"
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            // Obtener todos los usuarios con rol DESARROLLADOR
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
                            rol_cue: true,
                            cor_cue: true
                        }
                    },
                    // Incluir solicitudes asignadas para calcular carga de trabajo
                    solicitudesAsignadas: {
                        where: {
                            estado_sol: {
                                in: ['EN_DESARROLLO', 'EN_TESTING', 'APROBADA']
                            }
                        },
                        select: {
                            id_sol: true,
                            titulo_sol: true,
                            estado_sol: true,
                            prioridad_sol: true
                        }
                    }
                },
                orderBy: { nom_usu1: 'asc' }
            });
            res.json({
                success: true,
                data: desarrolladores.map(dev => ({
                    id_usu: dev.id_usu,
                    nombre_completo: `${dev.nom_usu1} ${dev.ape_usu1}`,
                    ced_usu: dev.ced_usu,
                    email: dev.cuentas[0]?.cor_cue,
                    github_username: dev.github_username,
                    carga_trabajo_actual: dev.solicitudesAsignadas.length,
                    solicitudes_activas: dev.solicitudesAsignadas.map(sol => ({
                        id_sol: sol.id_sol,
                        titulo_sol: sol.titulo_sol,
                        estado_sol: sol.estado_sol,
                        prioridad_sol: sol.prioridad_sol
                    }))
                })),
                total: desarrolladores.length
            });
        }
        catch (error) {
            console.error('[getAllDevelopers] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * GET /api/developers/:developerId/assigned-requests
     * Obtener solicitudes asignadas a un desarrollador específico
     */
    async getAssignedRequests(req, res) {
        try {
            const { developerId } = req.params;
            const userRole = req.usuario?.rol;
            const userId = req.usuario?.id_usu;
            // Verificar permisos: admin, master o el mismo desarrollador
            const isAdmin = userRole === 'ADMINISTRADOR' || userRole === 'MASTER';
            const isSameDeveloper = userId === developerId;
            if (!isAdmin && !isSameDeveloper) {
                res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver estas solicitudes'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            // Verificar que el desarrollador existe
            const desarrollador = await prisma.usuario.findFirst({
                where: {
                    id_usu: developerId,
                    cuentas: {
                        some: {
                            rol_cue: 'DESARROLLADOR'
                        }
                    }
                },
                include: {
                    cuentas: {
                        select: {
                            cor_cue: true
                        }
                    }
                }
            });
            if (!desarrollador) {
                res.status(404).json({
                    success: false,
                    message: 'Desarrollador no encontrado'
                });
                return;
            }
            // Obtener solicitudes asignadas
            const solicitudes = await prisma.solicitudCambio.findMany({
                where: {
                    id_desarrollador_asignado: developerId,
                    estado_sol: {
                        in: ['APROBADA', 'EN_DESARROLLO', 'EN_TESTING', 'COMPLETADA', 'FALLIDA']
                    }
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
                },
                orderBy: { fec_creacion_sol: 'desc' }
            });
            res.json({
                success: true,
                desarrollador: {
                    id_usu: desarrollador.id_usu,
                    nombre_completo: `${desarrollador.nom_usu1} ${desarrollador.ape_usu1}`,
                    email: desarrollador.cuentas[0]?.cor_cue,
                    github_username: desarrollador.github_username
                },
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
                    adminResponsable: sol.adminResponsable
                })),
                total: solicitudes.length
            });
        }
        catch (error) {
            console.error('[getAssignedRequests] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * PUT /api/developers/requests/:requestId/status
     * Actualizar estado de solicitud (solo desarrollador asignado)
     */
    async updateRequestStatus(req, res) {
        try {
            const { requestId } = req.params;
            const { estado_sol, comentarios_tecnicos_sol } = req.body;
            const userId = req.usuario?.id_usu;
            const userRole = req.usuario?.rol;
            if (!estado_sol) {
                res.status(400).json({
                    success: false,
                    message: 'Estado es requerido'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            // Verificar que la solicitud existe y está asignada al desarrollador
            const solicitud = await prisma.solicitudCambio.findUnique({
                where: { id_sol: requestId },
                include: {
                    usuario: {
                        select: {
                            nom_usu1: true,
                            ape_usu1: true
                        }
                    }
                }
            });
            if (!solicitud) {
                res.status(404).json({
                    success: false,
                    message: 'Solicitud no encontrada'
                });
                return;
            }
            // Verificar permisos: debe ser el desarrollador asignado o admin/master
            const isAssignedDeveloper = solicitud.id_desarrollador_asignado === userId;
            const isAdmin = userRole === 'ADMINISTRADOR' || userRole === 'MASTER';
            if (!isAssignedDeveloper && !isAdmin) {
                res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para actualizar esta solicitud'
                });
                return;
            }
            // Validar transiciones de estado permitidas para desarrolladores
            const allowedStates = ['EN_DESARROLLO', 'EN_TESTING', 'COMPLETADA', 'FALLIDA'];
            if (!isAdmin && !allowedStates.includes(estado_sol)) {
                res.status(400).json({
                    success: false,
                    message: 'Estado no permitido para desarrolladores'
                });
                return;
            }
            // Actualizar la solicitud
            const solicitudActualizada = await prisma.solicitudCambio.update({
                where: { id_sol: requestId },
                data: {
                    estado_sol: estado_sol,
                    comentarios_tecnicos_sol: comentarios_tecnicos_sol || solicitud.comentarios_tecnicos_sol,
                    fec_ultima_actualizacion: new Date()
                },
                include: {
                    usuario: {
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
                }
            });
            res.json({
                success: true,
                message: 'Estado de solicitud actualizado exitosamente',
                solicitud: {
                    id_sol: solicitudActualizada.id_sol,
                    titulo_sol: solicitudActualizada.titulo_sol,
                    estado_sol: solicitudActualizada.estado_sol,
                    comentarios_tecnicos_sol: solicitudActualizada.comentarios_tecnicos_sol,
                    fec_ultima_actualizacion: solicitudActualizada.fec_ultima_actualizacion,
                    usuario: solicitudActualizada.usuario,
                    desarrolladorAsignado: solicitudActualizada.desarrolladorAsignado
                }
            });
        }
        catch (error) {
            console.error('[updateRequestStatus] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * GET /api/developers/workload-stats
     * Obtener estadísticas de carga de trabajo de desarrolladores
     */
    async getWorkloadStats(req, res) {
        try {
            const userRole = req.usuario?.rol;
            if (userRole !== 'ADMINISTRADOR' && userRole !== 'MASTER') {
                res.status(403).json({
                    success: false,
                    message: 'Acceso denegado'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            // Obtener estadísticas de carga de trabajo
            const stats = await prisma.usuario.findMany({
                where: {
                    cuentas: {
                        some: {
                            rol_cue: 'DESARROLLADOR'
                        }
                    }
                },
                include: {
                    solicitudesAsignadas: {
                        select: {
                            estado_sol: true,
                            prioridad_sol: true
                        }
                    }
                },
                orderBy: { nom_usu1: 'asc' }
            });
            const workloadStats = stats.map(dev => {
                const solicitudes = dev.solicitudesAsignadas;
                const enDesarrollo = solicitudes.filter(s => s.estado_sol === 'EN_DESARROLLO').length;
                const enTesting = solicitudes.filter(s => s.estado_sol === 'EN_TESTING').length;
                const aprobadas = solicitudes.filter(s => s.estado_sol === 'APROBADA').length;
                const alta = solicitudes.filter(s => s.prioridad_sol === 'ALTA' || s.prioridad_sol === 'CRITICA').length;
                return {
                    desarrollador: {
                        id_usu: dev.id_usu,
                        nombre_completo: `${dev.nom_usu1} ${dev.ape_usu1}`,
                        github_username: dev.github_username
                    },
                    carga_total: solicitudes.length,
                    en_desarrollo: enDesarrollo,
                    en_testing: enTesting,
                    pendientes_inicio: aprobadas,
                    alta_prioridad: alta,
                    disponibilidad: solicitudes.length < 5 ? 'DISPONIBLE' : solicitudes.length < 10 ? 'OCUPADO' : 'SOBRECARGADO'
                };
            });
            res.json({
                success: true,
                estadisticas: workloadStats,
                resumen: {
                    total_desarrolladores: workloadStats.length,
                    disponibles: workloadStats.filter(s => s.disponibilidad === 'DISPONIBLE').length,
                    ocupados: workloadStats.filter(s => s.disponibilidad === 'OCUPADO').length,
                    sobrecargados: workloadStats.filter(s => s.disponibilidad === 'SOBRECARGADO').length
                }
            });
        }
        catch (error) {
            console.error('[getWorkloadStats] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}
exports.DeveloperController = DeveloperController;
//# sourceMappingURL=DeveloperController.js.map