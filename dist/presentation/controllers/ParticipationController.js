"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipationController = void 0;
const BaseController_1 = require("./BaseController");
class ParticipationController extends BaseController_1.BaseController {
    constructor(container) {
        super();
        this.container = container;
    }
    /**
     * GET /api/participations/courses/:courseId
     * Obtener participaciones de un curso (para gestión de notas/asistencia)
     */
    async getCourseParticipations(req, res) {
        try {
            const { courseId } = req.params;
            const userRole = req.usuario?.rol;
            // Solo admin, master u organizadores pueden ver participaciones
            if (!userRole || !['ADMINISTRADOR', 'MASTER', 'ORGANIZADOR'].includes(userRole)) {
                res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver las participaciones'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            const curso = await prisma.curso.findUnique({
                where: { id_cur: courseId },
                include: {
                    inscripcionesCurso: {
                        include: {
                            usuario: {
                                select: {
                                    id_usu: true,
                                    nom_usu1: true,
                                    nom_usu2: true,
                                    ape_usu1: true,
                                    ape_usu2: true,
                                    ced_usu: true
                                }
                            },
                            participacionesCurso: true
                        }
                    }
                }
            });
            if (!curso) {
                res.status(404).json({
                    success: false,
                    message: 'Curso no encontrado'
                });
                return;
            }
            const participaciones = curso.inscripcionesCurso.map(inscripcion => {
                const participacion = inscripcion.participacionesCurso[0]; // Asumiendo una participación por inscripción
                return {
                    inscripcion: {
                        id_ins_cur: inscripcion.id_ins_cur,
                        fecha_inscripcion: inscripcion.fec_ins_cur,
                        estado: inscripcion.estado_pago_cur
                    },
                    usuario: {
                        id_usu: inscripcion.usuario.id_usu,
                        nombre_completo: `${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.nom_usu2 || ''} ${inscripcion.usuario.ape_usu1} ${inscripcion.usuario.ape_usu2 || ''}`.trim(),
                        cedula: inscripcion.usuario.ced_usu
                    },
                    participacion: participacion ? {
                        id_par_cur: participacion.id_par_cur,
                        asistencia_porcentaje: participacion.asistencia_porcentaje,
                        nota_final: participacion.nota_final,
                        aprobado: participacion.aprobado,
                        fecha_certificado: participacion.fec_cer_par_cur
                    } : null
                };
            });
            res.json({
                success: true,
                curso: {
                    id_cur: curso.id_cur,
                    nombre: curso.nom_cur,
                    estado: curso.estado,
                    porcentaje_asistencia_aprobacion: curso.porcentaje_asistencia_aprobacion,
                    nota_minima_aprobacion: curso.nota_minima_aprobacion
                },
                participaciones,
                total: participaciones.length
            });
        }
        catch (error) {
            console.error('[getCourseParticipations] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * GET /api/participations/events/:eventId
     * Obtener participaciones de un evento
     */
    async getEventParticipations(req, res) {
        try {
            const { eventId } = req.params;
            const userRole = req.usuario?.rol;
            // Solo admin, master u organizadores pueden ver participaciones
            if (!userRole || !['ADMINISTRADOR', 'MASTER', 'ORGANIZADOR'].includes(userRole)) {
                res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver las participaciones'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            const evento = await prisma.evento.findUnique({
                where: { id_eve: eventId },
                include: {
                    inscripciones: {
                        include: {
                            usuario: {
                                select: {
                                    id_usu: true,
                                    nom_usu1: true,
                                    nom_usu2: true,
                                    ape_usu1: true,
                                    ape_usu2: true,
                                    ced_usu: true
                                }
                            },
                            participaciones: true
                        }
                    }
                }
            });
            if (!evento) {
                res.status(404).json({
                    success: false,
                    message: 'Evento no encontrado'
                });
                return;
            }
            const participaciones = evento.inscripciones.map(inscripcion => {
                const participacion = inscripcion.participaciones[0]; // Asumiendo una participación por inscripción
                return {
                    inscripcion: {
                        id_ins: inscripcion.id_ins,
                        fecha_inscripcion: inscripcion.fec_ins,
                        estado: inscripcion.estado_pago
                    },
                    usuario: {
                        id_usu: inscripcion.usuario.id_usu,
                        nombre_completo: `${inscripcion.usuario.nom_usu1} ${inscripcion.usuario.nom_usu2 || ''} ${inscripcion.usuario.ape_usu1} ${inscripcion.usuario.ape_usu2 || ''}`.trim(),
                        cedula: inscripcion.usuario.ced_usu
                    },
                    participacion: participacion ? {
                        id_par: participacion.id_par,
                        asistencia: participacion.asi_par,
                        aprobado: participacion.aprobado,
                        fecha_certificado: participacion.fec_cer_par
                    } : null
                };
            });
            res.json({
                success: true,
                evento: {
                    id_eve: evento.id_eve,
                    nombre: evento.nom_eve,
                    estado: evento.estado,
                    porcentaje_asistencia_aprobacion: evento.porcentaje_asistencia_aprobacion
                },
                participaciones,
                total: participaciones.length
            });
        }
        catch (error) {
            console.error('[getEventParticipations] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * PUT /api/participations/courses/:courseId/participants/:userId
     * Actualizar participación de un usuario en un curso
     */
    async updateCourseParticipation(req, res) {
        try {
            const { courseId, userId } = req.params;
            const { asistencia_porcentaje, nota_final } = req.body;
            const userRole = req.usuario?.rol;
            // Solo admin, master u organizadores pueden actualizar participaciones
            if (!userRole || !['ADMINISTRADOR', 'MASTER', 'ORGANIZADOR'].includes(userRole)) {
                res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para actualizar participaciones'
                });
                return;
            }
            if (asistencia_porcentaje == null || nota_final == null) {
                res.status(400).json({
                    success: false,
                    message: 'Porcentaje de asistencia y nota final son requeridos'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            // Verificar que existe la inscripción
            const inscripcion = await prisma.inscripcionCurso.findFirst({
                where: {
                    id_cur_ins: courseId,
                    id_usu_ins_cur: userId
                }
            });
            if (!inscripcion) {
                res.status(404).json({
                    success: false,
                    message: 'Inscripción no encontrada'
                });
                return;
            }
            // Obtener criterios de aprobación del curso
            const curso = await prisma.curso.findUnique({
                where: { id_cur: courseId },
                select: {
                    porcentaje_asistencia_aprobacion: true,
                    nota_minima_aprobacion: true
                }
            });
            if (!curso) {
                res.status(404).json({
                    success: false,
                    message: 'Curso no encontrado'
                });
                return;
            }
            // Determinar si aprobó
            const aprobado = asistencia_porcentaje >= curso.porcentaje_asistencia_aprobacion &&
                nota_final >= curso.nota_minima_aprobacion;
            // Crear o actualizar participación
            const participacion = await prisma.participacionCurso.upsert({
                where: {
                    id_ins_cur_per: inscripcion.id_ins_cur
                },
                update: {
                    asistencia_porcentaje: parseFloat(asistencia_porcentaje),
                    nota_final: parseFloat(nota_final),
                    aprobado,
                    fec_cer_par_cur: aprobado ? new Date() : null
                },
                create: {
                    id_ins_cur_per: inscripcion.id_ins_cur,
                    asistencia_porcentaje: parseFloat(asistencia_porcentaje),
                    nota_final: parseFloat(nota_final),
                    aprobado,
                    fec_cer_par_cur: aprobado ? new Date() : null
                }
            });
            res.json({
                success: true,
                message: 'Participación actualizada exitosamente',
                participacion: {
                    id_par_cur: participacion.id_par_cur,
                    asistencia_porcentaje: participacion.asistencia_porcentaje,
                    nota_final: participacion.nota_final,
                    aprobado: participacion.aprobado,
                    fecha_certificado: participacion.fec_cer_par_cur
                }
            });
        }
        catch (error) {
            console.error('[updateCourseParticipation] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * PUT /api/participations/events/:eventId/participants/:userId
     * Actualizar participación de un usuario en un evento
     */
    async updateEventParticipation(req, res) {
        try {
            const { eventId, userId } = req.params;
            const { asistencia } = req.body;
            const userRole = req.usuario?.rol;
            // Solo admin, master u organizadores pueden actualizar participaciones
            if (!userRole || !['ADMINISTRADOR', 'MASTER', 'ORGANIZADOR'].includes(userRole)) {
                res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para actualizar participaciones'
                });
                return;
            }
            if (asistencia == null) {
                res.status(400).json({
                    success: false,
                    message: 'Porcentaje de asistencia es requerido'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            // Verificar que existe la inscripción
            const inscripcion = await prisma.inscripcion.findFirst({
                where: {
                    id_eve_ins: eventId,
                    id_usu_ins: userId
                }
            });
            if (!inscripcion) {
                res.status(404).json({
                    success: false,
                    message: 'Inscripción no encontrada'
                });
                return;
            }
            // Obtener criterio de aprobación del evento
            const evento = await prisma.evento.findUnique({
                where: { id_eve: eventId },
                select: {
                    porcentaje_asistencia_aprobacion: true
                }
            });
            if (!evento) {
                res.status(404).json({
                    success: false,
                    message: 'Evento no encontrado'
                });
                return;
            }
            // Determinar si aprobó
            const aprobado = asistencia >= evento.porcentaje_asistencia_aprobacion;
            // Crear o actualizar participación
            const participacion = await prisma.participacion.upsert({
                where: {
                    id_ins_per: inscripcion.id_ins
                },
                update: {
                    asi_par: parseFloat(asistencia),
                    aprobado,
                    fec_cer_par: aprobado ? new Date() : null
                },
                create: {
                    id_ins_per: inscripcion.id_ins,
                    asi_par: parseFloat(asistencia),
                    aprobado,
                    fec_cer_par: aprobado ? new Date() : null
                }
            });
            res.json({
                success: true,
                message: 'Participación actualizada exitosamente',
                participacion: {
                    id_par: participacion.id_par,
                    asistencia: participacion.asi_par,
                    aprobado: participacion.aprobado,
                    fecha_certificado: participacion.fec_cer_par
                }
            });
        }
        catch (error) {
            console.error('[updateEventParticipation] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}
exports.ParticipationController = ParticipationController;
//# sourceMappingURL=ParticipationController.js.map