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
            const idUsuario = req.usuario?.id_usu || req.uid;
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
            const datosInscripcion = {
                id_usu_ins: idUsuario,
                id_eve_ins: idEvento,
                fec_ins: new Date(),
                carta_motivacion: cartaMotivacion || null
            };
            // Configurar estado de pago según si es gratuito o no
            if (evento.es_gratuito) {
                datosInscripcion.estado_pago = 'APROBADO';
                datosInscripcion.met_pag_ins = null; // No hay método de pago para eventos gratuitos
            }
            else {
                datosInscripcion.estado_pago = 'PENDIENTE';
                datosInscripcion.met_pag_ins = metodoPago || 'TRANFERENCIA';
            }
            const nuevaInscripcion = await prisma.inscripcion.create({
                data: datosInscripcion,
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
            const idUsuario = req.usuario?.id_usu || req.uid;
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
            const datosInscripcionCurso = {
                id_usu_ins_cur: idUsuario,
                id_cur_ins: idCurso,
                fec_ins_cur: new Date(),
                carta_motivacion: cartaMotivacion || null
            };
            // Configurar estado de pago según si es gratuito o no
            if (curso.es_gratuito) {
                datosInscripcionCurso.estado_pago_cur = 'APROBADO';
                datosInscripcionCurso.met_pag_ins_cur = null; // No hay método de pago para cursos gratuitos
                datosInscripcionCurso.val_ins_cur = null; // No hay valor para cursos gratuitos
            }
            else {
                datosInscripcionCurso.estado_pago_cur = 'PENDIENTE';
                datosInscripcionCurso.met_pag_ins_cur = metodoPago || 'TRANFERENCIA';
                datosInscripcionCurso.val_ins_cur = curso.precio || 0;
            }
            const nuevaInscripcion = await prisma.inscripcionCurso.create({
                data: datosInscripcionCurso,
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
            const idUsuario = req.usuario?.id_usu || req.uid;
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
                data: inscripciones.map(ins => ({
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
            const idUsuario = req.usuario?.id_usu || req.uid;
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
                data: inscripciones.map(ins => ({
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
    /**
     * POST /api/inscripciones
     * Inscribir usuario a un evento con archivo (LEGACY)
     */
    async enrollInEventWithFile(req, res) {
        try {
            console.log('📝 Iniciando inscripción en evento con archivo...');
            const { idUsuario, idEvento, metodoPago, cartaMotivacion } = req.body;
            const comprobantePago = req.file;
            const usuario_id = req.usuario?.id_usu || req.uid || idUsuario;
            if (!usuario_id || !idEvento) {
                res.status(400).json({
                    success: false,
                    message: 'ID de usuario e ID de evento son obligatorios'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            // Verificar que el usuario existe
            const usuario = await prisma.usuario.findUnique({
                where: { id_usu: usuario_id },
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
            // Verificar que el evento existe
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
            // Verificar si ya está inscrito
            const inscripcionExistente = await prisma.inscripcion.findFirst({
                where: {
                    id_usu_ins: usuario_id,
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
            // Preparar datos de inscripción
            const datosInscripcion = {
                id_usu_ins: usuario_id,
                id_eve_ins: idEvento,
                fec_ins: new Date(),
                carta_motivacion: cartaMotivacion || null
            };
            if (evento.es_gratuito) {
                datosInscripcion.estado_pago = 'APROBADO';
                datosInscripcion.met_pag_ins = null; // Para eventos gratuitos no hay método de pago
            }
            else {
                datosInscripcion.estado_pago = 'PENDIENTE';
                datosInscripcion.met_pag_ins = metodoPago || 'TRANFERENCIA';
                if (comprobantePago) {
                    const fs = require('fs');
                    const pdfBuffer = fs.readFileSync(comprobantePago.path);
                    datosInscripcion.comprobante_pago_pdf = pdfBuffer;
                    datosInscripcion.comprobante_filename = comprobantePago.originalname;
                    datosInscripcion.comprobante_size = comprobantePago.size;
                    datosInscripcion.fec_subida_comprobante = new Date();
                    // Eliminar el archivo temporal
                    fs.unlinkSync(comprobantePago.path);
                }
            }
            const nuevaInscripcion = await prisma.inscripcion.create({
                data: datosInscripcion
            });
            res.status(201).json({
                success: true,
                message: 'Inscripción realizada exitosamente',
                inscripcion: {
                    id_ins: nuevaInscripcion.id_ins,
                    estado: nuevaInscripcion.estado_pago,
                    fecha: nuevaInscripcion.fec_ins
                }
            });
        }
        catch (error) {
            console.error('[enrollInEventWithFile] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * POST /api/inscripcionesCursos
     * Inscribir usuario a un curso con archivo (LEGACY)
     */
    async enrollInCourseWithFile(req, res) {
        try {
            console.log('📝 Iniciando inscripción en curso con archivo...');
            const { idUsuario, idCurso, metodoPago, cartaMotivacion } = req.body;
            const comprobantePago = req.file;
            const usuario_id = req.usuario?.id_usu || req.uid || idUsuario;
            if (!usuario_id || !idCurso) {
                res.status(400).json({
                    success: false,
                    message: 'ID de usuario e ID de curso son obligatorios'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            // Verificar que el usuario existe
            const usuario = await prisma.usuario.findUnique({
                where: { id_usu: usuario_id }
            });
            if (!usuario) {
                res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
                return;
            }
            // Verificar que el curso existe
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
            // Verificar si ya está inscrito
            const inscripcionExistente = await prisma.inscripcionCurso.findFirst({
                where: {
                    id_usu_ins_cur: usuario_id,
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
            // Preparar datos de inscripción
            const datosInscripcion = {
                id_usu_ins_cur: usuario_id,
                id_cur_ins: idCurso,
                fec_ins_cur: new Date(),
                carta_motivacion: cartaMotivacion || null
            };
            if (curso.es_gratuito) {
                datosInscripcion.estado_pago_cur = 'APROBADO';
                datosInscripcion.met_pag_ins_cur = null; // Cursos gratuitos no tienen método de pago
                datosInscripcion.val_ins_cur = null; // Cursos gratuitos no tienen valor
            }
            else {
                datosInscripcion.estado_pago_cur = 'PENDIENTE';
                datosInscripcion.met_pag_ins_cur = metodoPago || 'TRANFERENCIA'; // Usar el valor correcto del enum
                datosInscripcion.val_ins_cur = curso.precio || 0; // Establecer el valor del curso
                if (comprobantePago) {
                    const fs = require('fs');
                    const pdfBuffer = fs.readFileSync(comprobantePago.path);
                    datosInscripcion.comprobante_pago_pdf = pdfBuffer;
                    datosInscripcion.comprobante_filename = comprobantePago.originalname;
                    datosInscripcion.comprobante_size = comprobantePago.size;
                    datosInscripcion.fec_subida_comprobante = new Date();
                    // Eliminar el archivo temporal
                    fs.unlinkSync(comprobantePago.path);
                }
            }
            const nuevaInscripcion = await prisma.inscripcionCurso.create({
                data: datosInscripcion
            });
            res.status(201).json({
                success: true,
                message: 'Inscripción realizada exitosamente',
                inscripcion: {
                    id_ins_cur: nuevaInscripcion.id_ins_cur,
                    estado: nuevaInscripcion.estado_pago_cur,
                    fecha: nuevaInscripcion.fec_ins_cur
                }
            });
        }
        catch (error) {
            console.error('[enrollInCourseWithFile] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * GET /api/inscripciones/evento/comprobante/:inscripcionId
     * Obtener comprobante de pago de evento (LEGACY)
     */
    async getEventPaymentReceipt(req, res) {
        try {
            const { inscripcionId } = req.params;
            const usuario_id = req.usuario?.id_usu || req.uid;
            if (!usuario_id) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            const inscripcion = await prisma.inscripcion.findFirst({
                where: {
                    id_ins: inscripcionId,
                    id_usu_ins: usuario_id
                }
            });
            if (!inscripcion) {
                res.status(404).json({
                    success: false,
                    message: 'Inscripción no encontrada'
                });
                return;
            }
            if (!inscripcion.comprobante_pago_pdf) {
                res.status(404).json({
                    success: false,
                    message: 'No hay comprobante de pago disponible'
                });
                return;
            }
            // Servir el PDF desde la base de datos
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="comprobante-${inscripcionId}.pdf"`);
            res.setHeader('Content-Length', inscripcion.comprobante_pago_pdf.length.toString());
            res.send(Buffer.from(inscripcion.comprobante_pago_pdf));
        }
        catch (error) {
            console.error('[getEventPaymentReceipt] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * GET /api/inscripcionesCursos/curso/comprobante/:inscripcionId
     * Obtener comprobante de pago de curso (LEGACY)
     */
    async getCoursePaymentReceipt(req, res) {
        try {
            const { inscripcionId } = req.params;
            const usuario_id = req.usuario?.id_usu || req.uid;
            if (!usuario_id) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            const inscripcion = await prisma.inscripcionCurso.findFirst({
                where: {
                    id_ins_cur: inscripcionId,
                    id_usu_ins_cur: usuario_id
                }
            });
            if (!inscripcion) {
                res.status(404).json({
                    success: false,
                    message: 'Inscripción no encontrada'
                });
                return;
            }
            if (!inscripcion.comprobante_pago_pdf) {
                res.status(404).json({
                    success: false,
                    message: 'No hay comprobante de pago disponible'
                });
                return;
            }
            // Servir el PDF desde la base de datos
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="comprobante-${inscripcionId}.pdf"`);
            res.setHeader('Content-Length', inscripcion.comprobante_pago_pdf.length.toString());
            res.send(Buffer.from(inscripcion.comprobante_pago_pdf));
        }
        catch (error) {
            console.error('[getCoursePaymentReceipt] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}
exports.InscriptionController = InscriptionController;
//# sourceMappingURL=InscriptionController.js.map