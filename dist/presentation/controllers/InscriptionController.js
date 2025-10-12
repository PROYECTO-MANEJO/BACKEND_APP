"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InscriptionController = void 0;
const BaseController_1 = require("./BaseController");
class InscriptionController extends BaseController_1.BaseController {
    constructor(container) {
        super();
        this.container = container;
    }
    /**
     * POST /api/inscriptions/events
     * Inscribir usuario a un evento
     */
    async enrollInEvent(req, res) {
        try {
            console.log('📝 Iniciando inscripción en evento...');
            const { idEvento, metodoPago, cartaMotivacion } = req.body;
            const idUsuario = req.usuario?.id_usu;
            if (!idUsuario || !idEvento) {
                res.status(400).json({
                    success: false,
                    message: 'ID de usuario e ID de evento son obligatorios'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            // Verificar que el usuario existe
            const usuario = await prisma.usuario.findUnique({
                where: { id_usu: idUsuario },
                include: {
                    cuentas: {
                        select: { rol_cue: true }
                    }
                }
            });
            if (!usuario) {
                res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
                return;
            }
            // Verificación de documentos
            if (!usuario.documentos_verificados) {
                res.status(400).json({
                    success: false,
                    message: 'Debes tener tus documentos verificados por un administrador antes de poder inscribirte.'
                });
                return;
            }
            // Verificar que el evento existe y está activo
            const evento = await prisma.evento.findUnique({
                where: { id_eve: idEvento }
            });
            if (!evento) {
                res.status(404).json({
                    success: false,
                    message: 'Evento no encontrado'
                });
                return;
            }
            if (evento.estado !== 'ACTIVO') {
                res.status(400).json({
                    success: false,
                    message: 'El evento no está disponible para inscripciones'
                });
                return;
            }
            // Verificar si ya está inscrito
            const inscripcionExistente = await prisma.inscripcion.findFirst({
                where: {
                    id_usu_ins: idUsuario,
                    id_eve_ins: idEvento
                }
            });
            if (inscripcionExistente) {
                res.status(400).json({
                    success: false,
                    message: 'Ya estás inscrito en este evento'
                });
                return;
            }
            // Verificar capacidad
            const inscripcionesActuales = await prisma.inscripcion.count({
                where: { id_eve_ins: idEvento }
            });
            if (inscripcionesActuales >= evento.capacidad_max_eve) {
                res.status(400).json({
                    success: false,
                    message: 'El evento ha alcanzado su capacidad máxima'
                });
                return;
            }
            // Crear inscripción
            const nuevaInscripcion = await prisma.inscripcion.create({
                data: {
                    id_usu_ins: idUsuario,
                    id_eve_ins: idEvento,
                    fec_ins: new Date(),
                    estado_pago: 'PENDIENTE',
                    met_pag_ins: metodoPago || 'GRATUITO',
                    carta_motivacion: cartaMotivacion || null
                },
                include: {
                    evento: {
                        select: {
                            nom_eve: true,
                            fec_ini_eve: true,
                            precio: true,
                            es_gratuito: true
                        }
                    },
                    usuario: {
                        select: {
                            nom_usu1: true,
                            ape_usu1: true,
                            ced_usu: true
                        }
                    }
                }
            });
            res.status(201).json({
                success: true,
                message: 'Inscripción realizada exitosamente',
                inscripcion: {
                    id_ins: nuevaInscripcion.id_ins,
                    evento: nuevaInscripcion.evento.nom_eve,
                    fecha_inscripcion: nuevaInscripcion.fec_ins,
                    estado: nuevaInscripcion.estado_pago,
                    metodo_pago: nuevaInscripcion.met_pag_ins
                }
            });
        }
        catch (error) {
            console.error('[enrollInEvent] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * POST /api/inscriptions/courses
     * Inscribir usuario a un curso
     */
    async enrollInCourse(req, res) {
        try {
            console.log('📝 Iniciando inscripción en curso...');
            const { idCurso, metodoPago, cartaMotivacion } = req.body;
            const idUsuario = req.usuario?.id_usu;
            if (!idUsuario || !idCurso) {
                res.status(400).json({
                    success: false,
                    message: 'ID de usuario e ID de curso son obligatorios'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            // Verificar que el usuario existe
            const usuario = await prisma.usuario.findUnique({
                where: { id_usu: idUsuario },
                include: {
                    cuentas: {
                        select: { rol_cue: true }
                    }
                }
            });
            if (!usuario) {
                res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
                return;
            }
            // Verificación de documentos
            if (!usuario.documentos_verificados) {
                res.status(400).json({
                    success: false,
                    message: 'Debes tener tus documentos verificados por un administrador antes de poder inscribirte.'
                });
                return;
            }
            // Verificar que el curso existe y está activo
            const curso = await prisma.curso.findUnique({
                where: { id_cur: idCurso }
            });
            if (!curso) {
                res.status(404).json({
                    success: false,
                    message: 'Curso no encontrado'
                });
                return;
            }
            if (curso.estado !== 'ACTIVO') {
                res.status(400).json({
                    success: false,
                    message: 'El curso no está disponible para inscripciones'
                });
                return;
            }
            // Verificar si ya está inscrito
            const inscripcionExistente = await prisma.inscripcionCurso.findFirst({
                where: {
                    id_usu_ins_cur: idUsuario,
                    id_cur_ins: idCurso
                }
            });
            if (inscripcionExistente) {
                res.status(400).json({
                    success: false,
                    message: 'Ya estás inscrito en este curso'
                });
                return;
            }
            // Verificar capacidad
            const inscripcionesActuales = await prisma.inscripcionCurso.count({
                where: { id_cur_ins: idCurso }
            });
            if (inscripcionesActuales >= curso.capacidad_max_cur) {
                res.status(400).json({
                    success: false,
                    message: 'El curso ha alcanzado su capacidad máxima'
                });
                return;
            }
            // Crear inscripción
            const nuevaInscripcion = await prisma.inscripcionCurso.create({
                data: {
                    id_usu_ins_cur: idUsuario,
                    id_cur_ins: idCurso,
                    fec_ins_cur: new Date(),
                    estado_pago_cur: 'PENDIENTE',
                    met_pag_ins_cur: metodoPago || 'GRATUITO',
                    carta_motivacion: cartaMotivacion || null
                },
                include: {
                    curso: {
                        select: {
                            nom_cur: true,
                            fec_ini_cur: true,
                            precio: true,
                            es_gratuito: true
                        }
                    },
                    usuario: {
                        select: {
                            nom_usu1: true,
                            ape_usu1: true,
                            ced_usu: true
                        }
                    }
                }
            });
            res.status(201).json({
                success: true,
                message: 'Inscripción realizada exitosamente',
                inscripcion: {
                    id_ins_cur: nuevaInscripcion.id_ins_cur,
                    curso: nuevaInscripcion.curso.nom_cur,
                    fecha_inscripcion: nuevaInscripcion.fec_ins_cur,
                    estado: nuevaInscripcion.estado_pago_cur,
                    metodo_pago: nuevaInscripcion.met_pag_ins_cur
                }
            });
        }
        catch (error) {
            console.error('[enrollInCourse] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * GET /api/inscriptions/my-events
     * Obtener inscripciones de eventos del usuario
     */
    async getMyEventInscriptions(req, res) {
        try {
            const idUsuario = req.usuario?.id_usu;
            if (!idUsuario) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            const inscripciones = await prisma.inscripcion.findMany({
                where: { id_usu_ins: idUsuario },
                include: {
                    evento: {
                        select: {
                            id_eve: true,
                            nom_eve: true,
                            des_eve: true,
                            fec_ini_eve: true,
                            fec_fin_eve: true,
                            hor_ini_eve: true,
                            hor_fin_eve: true,
                            ubi_eve: true,
                            estado: true,
                            precio: true,
                            es_gratuito: true
                        }
                    }
                },
                orderBy: { fec_ins: 'desc' }
            });
            res.json({
                success: true,
                inscripciones: inscripciones.map(ins => ({
                    id_ins: ins.id_ins,
                    fecha_inscripcion: ins.fec_ins,
                    estado: ins.estado_pago,
                    metodo_pago: ins.met_pag_ins,
                    evento: ins.evento
                })),
                total: inscripciones.length
            });
        }
        catch (error) {
            console.error('[getMyEventInscriptions] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * GET /api/inscriptions/my-courses
     * Obtener inscripciones de cursos del usuario
     */
    async getMyCourseInscriptions(req, res) {
        try {
            const idUsuario = req.usuario?.id_usu;
            if (!idUsuario) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            const inscripciones = await prisma.inscripcionCurso.findMany({
                where: { id_usu_ins_cur: idUsuario },
                include: {
                    curso: {
                        select: {
                            id_cur: true,
                            nom_cur: true,
                            des_cur: true,
                            fec_ini_cur: true,
                            fec_fin_cur: true,
                            dur_cur: true,
                            estado: true,
                            precio: true,
                            es_gratuito: true
                        }
                    }
                },
                orderBy: { fec_ins_cur: 'desc' }
            });
            res.json({
                success: true,
                inscripciones: inscripciones.map(ins => ({
                    id_ins_cur: ins.id_ins_cur,
                    fecha_inscripcion: ins.fec_ins_cur,
                    estado: ins.estado_pago_cur,
                    metodo_pago: ins.met_pag_ins_cur,
                    curso: ins.curso
                })),
                total: inscripciones.length
            });
        }
        catch (error) {
            console.error('[getMyCourseInscriptions] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}
exports.InscriptionController = InscriptionController;
//# sourceMappingURL=InscriptionController.js.map