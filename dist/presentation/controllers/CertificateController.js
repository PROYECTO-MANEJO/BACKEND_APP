"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateController = void 0;
const BaseController_1 = require("./BaseController");
/**
 * Controlador para gestión de certificados
 * Maneja todas las operaciones relacionadas con certificados
 */
class CertificateController extends BaseController_1.BaseController {
    constructor(container) {
        super();
        this.container = container;
    }
    /**
     * GET /api/certificates/my-certificates
     * Obtener certificados del usuario autenticado
     */
    async getUserCertificates(req, res) {
        await this.execute(req, res, async () => {
            const userId = req.usuario?.id_usu || req.uid;
            const prisma = this.container.getPrismaClient();
            // Obtener certificados de eventos
            const certificadosEventos = await prisma.participacion.findMany({
                where: {
                    inscripcion: {
                        id_usu_ins: userId
                    },
                    aprobado: true,
                    certificado_pdf: {
                        not: null
                    }
                },
                include: {
                    inscripcion: {
                        include: {
                            evento: {
                                select: {
                                    id_eve: true,
                                    nom_eve: true,
                                    fec_ini_eve: true,
                                    fec_fin_eve: true,
                                    categoria: {
                                        select: {
                                            nom_cat: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            // Obtener certificados de cursos
            const certificadosCursos = await prisma.participacionCurso.findMany({
                where: {
                    inscripcionCurso: {
                        id_usu_ins_cur: userId
                    },
                    aprobado: true,
                    certificado_pdf: {
                        not: null
                    }
                },
                include: {
                    inscripcionCurso: {
                        include: {
                            curso: {
                                select: {
                                    id_cur: true,
                                    nom_cur: true,
                                    fec_ini_cur: true,
                                    fec_fin_cur: true,
                                    categoria: {
                                        select: {
                                            nom_cat: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            // Formatear certificados de eventos
            const eventosFormateados = certificadosEventos.map(cert => ({
                id: cert.id_par,
                tipo: 'evento',
                nombre: cert.inscripcion.evento.nom_eve,
                categoria: cert.inscripcion.evento.categoria.nom_cat,
                fecha_inicio: cert.inscripcion.evento.fec_ini_eve,
                fecha_fin: cert.inscripcion.evento.fec_fin_eve,
                fecha_certificado: cert.fec_cer_par,
                filename: cert.certificado_filename,
                size: cert.certificado_size,
                asistencia: cert.asi_par,
                nota: null, // Los eventos no tienen nota, solo asistencia
                aprobado: cert.aprobado
            }));
            // Formatear certificados de cursos
            const cursosFormateados = certificadosCursos.map(cert => ({
                id: cert.id_par_cur,
                tipo: 'curso',
                nombre: cert.inscripcionCurso.curso.nom_cur,
                categoria: cert.inscripcionCurso.curso.categoria.nom_cat,
                fecha_inicio: cert.inscripcionCurso.curso.fec_ini_cur,
                fecha_fin: cert.inscripcionCurso.curso.fec_fin_cur,
                fecha_certificado: cert.fec_cer_par_cur,
                filename: cert.certificado_filename,
                size: cert.certificado_size,
                asistencia: cert.asistencia_porcentaje,
                nota: cert.nota_final,
                aprobado: cert.aprobado
            }));
            // Combinar y ordenar por fecha de certificado
            const todosCertificados = [...eventosFormateados, ...cursosFormateados]
                .sort((a, b) => new Date(b.fecha_certificado || 0).getTime() - new Date(a.fecha_certificado || 0).getTime());
            return {
                success: true,
                certificados: todosCertificados,
                total: todosCertificados.length,
                eventos: eventosFormateados.length,
                cursos: cursosFormateados.length
            };
        });
    }
    /**
     * GET /api/certificates/download/:tipo/:idParticipacion
     * Descargar certificado en PDF
     */
    async downloadCertificate(req, res) {
        try {
            const { tipo, idParticipacion } = req.params;
            const userId = req.usuario?.id_usu || req.uid;
            const prisma = this.container.getPrismaClient();
            let participacion = null;
            if (tipo === 'evento') {
                participacion = await prisma.participacion.findFirst({
                    where: {
                        id_par: idParticipacion,
                        inscripcion: {
                            id_usu_ins: userId
                        }
                    },
                    include: {
                        inscripcion: {
                            include: {
                                evento: true,
                                usuario: true
                            }
                        }
                    }
                });
            }
            else if (tipo === 'curso') {
                participacion = await prisma.participacionCurso.findFirst({
                    where: {
                        id_par_cur: idParticipacion,
                        inscripcionCurso: {
                            id_usu_ins_cur: userId
                        }
                    },
                    include: {
                        inscripcionCurso: {
                            include: {
                                curso: true,
                                usuario: true
                            }
                        }
                    }
                });
            }
            if (!participacion) {
                res.status(404).json({
                    success: false,
                    message: 'Participación no encontrada'
                });
                return;
            }
            // Verificar que el certificado existe
            const certificadoPdf = tipo === 'evento' ? participacion.certificado_pdf : participacion.certificado_pdf;
            const filename = tipo === 'evento' ? participacion.certificado_filename : participacion.certificado_filename;
            if (!certificadoPdf) {
                res.status(404).json({
                    success: false,
                    message: 'Certificado no encontrado. Debe generar el certificado primero.'
                });
                return;
            }
            // Configurar headers para descarga de PDF
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', certificadoPdf.length);
            // Enviar el PDF
            res.send(certificadoPdf);
        }
        catch (error) {
            console.error('❌ Error al descargar certificado:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    /**
     * GET /api/certificates/participaciones-terminadas
     * Obtener participaciones terminadas (para generar certificados)
     */
    async getCompletedParticipations(req, res) {
        try {
            const userId = req.usuario?.id_usu || req.uid;
            const prisma = this.container.getPrismaClient();
            // Obtener participaciones de eventos terminadas
            const participacionesEventos = await prisma.participacion.findMany({
                where: {
                    inscripcion: {
                        id_usu_ins: userId,
                        estado_pago: 'APROBADO'
                    }
                },
                include: {
                    inscripcion: {
                        include: {
                            evento: {
                                select: {
                                    id_eve: true,
                                    nom_eve: true,
                                    fec_ini_eve: true,
                                    fec_fin_eve: true,
                                    estado: true,
                                    categoria: {
                                        select: {
                                            nom_cat: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            // Obtener participaciones de cursos terminadas
            const participacionesCursos = await prisma.participacionCurso.findMany({
                where: {
                    inscripcionCurso: {
                        id_usu_ins_cur: userId,
                        estado_pago_cur: 'APROBADO'
                    }
                },
                include: {
                    inscripcionCurso: {
                        include: {
                            curso: {
                                select: {
                                    id_cur: true,
                                    nom_cur: true,
                                    fec_ini_cur: true,
                                    fec_fin_cur: true,
                                    estado: true,
                                    categoria: {
                                        select: {
                                            nom_cat: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            // Formatear eventos
            const eventosFormateados = participacionesEventos.map(part => ({
                id_participacion: part.id_par,
                tipo: 'evento',
                nombre: part.inscripcion.evento.nom_eve,
                categoria: part.inscripcion.evento.categoria.nom_cat,
                fecha_inicio: part.inscripcion.evento.fec_ini_eve,
                fecha_fin: part.inscripcion.evento.fec_fin_eve,
                asistencia: part.asi_par,
                aprobado: part.aprobado,
                tiene_certificado: !!part.certificado_pdf,
                fecha_certificado: part.fec_cer_par
            }));
            // Formatear cursos
            const cursosFormateados = participacionesCursos.map(part => ({
                id_participacion: part.id_par_cur,
                tipo: 'curso',
                nombre: part.inscripcionCurso.curso.nom_cur,
                categoria: part.inscripcionCurso.curso.categoria.nom_cat,
                fecha_inicio: part.inscripcionCurso.curso.fec_ini_cur,
                fecha_fin: part.inscripcionCurso.curso.fec_fin_cur,
                asistencia: part.asistencia_porcentaje,
                nota: part.nota_final,
                aprobado: part.aprobado,
                tiene_certificado: !!part.certificado_pdf,
                fecha_certificado: part.fec_cer_par_cur
            }));
            const todasParticipaciones = [...eventosFormateados, ...cursosFormateados];
            console.log(`📊 getCompletedParticipations - Usuario: ${userId}`);
            console.log(`📊 Participaciones encontradas: ${todasParticipaciones.length}`);
            console.log(`📊 Eventos: ${eventosFormateados.length}, Cursos: ${cursosFormateados.length}`);
            // Log de participaciones para depuración
            todasParticipaciones.forEach(p => {
                console.log(`📋 ${p.tipo}: ${p.nombre} - Aprobado: ${p.aprobado}`);
            });
            res.json({
                success: true,
                participaciones: {
                    eventos: eventosFormateados,
                    cursos: cursosFormateados
                },
                total: todasParticipaciones.length
            });
        }
        catch (error) {
            console.error('[getCompletedParticipations] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * POST /api/certificates/generar-evento/:idParticipacion
     * Generar certificado de evento por ID de participación
     */
    async generateEventCertificate(req, res) {
        try {
            const { idParticipacion } = req.params;
            const userId = req.usuario?.id_usu || req.uid;
            const prisma = this.container.getPrismaClient();
            console.log(`🔍 generateEventCertificate - idParticipacion: "${idParticipacion}", userId: "${userId}"`);
            // Validar que idParticipacion exista
            if (!idParticipacion) {
                console.error(`❌ ID de participación no proporcionado`);
                res.status(400).json({
                    success: false,
                    message: 'ID de participación es requerido'
                });
                return;
            }
            // Validar que idParticipacion sea un UUID válido
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(idParticipacion)) {
                console.error(`❌ ID de participación inválido: "${idParticipacion}"`);
                res.status(400).json({
                    success: false,
                    message: 'ID de participación inválido'
                });
                return;
            }
            // Buscar la participación
            const participacion = await prisma.participacion.findFirst({
                where: {
                    id_par: idParticipacion,
                    inscripcion: {
                        id_usu_ins: userId
                    }
                },
                include: {
                    inscripcion: {
                        include: {
                            evento: {
                                include: {
                                    categoria: true,
                                    organizador: true
                                }
                            },
                            usuario: {
                                select: {
                                    nom_usu1: true,
                                    nom_usu2: true,
                                    ape_usu1: true,
                                    ape_usu2: true,
                                    ced_usu: true
                                }
                            }
                        }
                    }
                }
            });
            if (!participacion) {
                res.status(404).json({
                    success: false,
                    message: 'Participación no encontrada'
                });
                return;
            }
            // Verificar que está aprobado
            if (!participacion.aprobado) {
                res.status(400).json({
                    success: false,
                    message: 'El participante no ha sido aprobado en el evento. Se requiere asistencia >= 80%.'
                });
                return;
            }
            // Generar el certificado PDF
            const certificadoBuffer = await this.generateEventCertificatePDF(participacion);
            // Generar nombre único para el archivo
            const nombreArchivo = `certificado_evento_${participacion.inscripcion.evento.nom_eve.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
            // Actualizar la participación con el certificado
            await prisma.participacion.update({
                where: { id_par: idParticipacion },
                data: {
                    certificado_pdf: certificadoBuffer,
                    certificado_filename: nombreArchivo,
                    certificado_size: certificadoBuffer.length,
                    fec_cer_par: new Date()
                }
            });
            res.json({
                success: true,
                message: 'Certificado generado exitosamente',
                certificado: {
                    filename: nombreArchivo,
                    size: certificadoBuffer.length,
                    fecha_generacion: new Date()
                }
            });
        }
        catch (error) {
            console.error('[generateEventCertificate] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * POST /api/certificates/generar-curso/:idParticipacion
     * Generar certificado de curso por ID de participación
     */
    async generateCourseCertificate(req, res) {
        try {
            const { idParticipacion } = req.params;
            const userId = req.usuario?.id_usu || req.uid;
            const prisma = this.container.getPrismaClient();
            console.log(`🔍 generateCourseCertificate - idParticipacion: "${idParticipacion}", userId: "${userId}"`);
            // Validar que idParticipacion exista
            if (!idParticipacion) {
                console.error(`❌ ID de participación no proporcionado`);
                res.status(400).json({
                    success: false,
                    message: 'ID de participación es requerido'
                });
                return;
            }
            // Validar que idParticipacion sea un UUID válido
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(idParticipacion)) {
                console.error(`❌ ID de participación inválido: "${idParticipacion}"`);
                res.status(400).json({
                    success: false,
                    message: 'ID de participación inválido'
                });
                return;
            }
            // Buscar la participación
            const participacion = await prisma.participacionCurso.findFirst({
                where: {
                    id_par_cur: idParticipacion,
                    inscripcionCurso: {
                        id_usu_ins_cur: userId
                    }
                },
                include: {
                    inscripcionCurso: {
                        include: {
                            curso: {
                                include: {
                                    categoria: true,
                                    organizador: true
                                }
                            },
                            usuario: {
                                select: {
                                    nom_usu1: true,
                                    nom_usu2: true,
                                    ape_usu1: true,
                                    ape_usu2: true,
                                    ced_usu: true
                                }
                            }
                        }
                    }
                }
            });
            if (!participacion) {
                res.status(404).json({
                    success: false,
                    message: 'Participación no encontrada'
                });
                return;
            }
            // Verificar que está aprobado
            if (!participacion.aprobado) {
                res.status(400).json({
                    success: false,
                    message: 'El participante no ha sido aprobado en el curso. Se requiere nota >= 70 y asistencia >= 70%.'
                });
                return;
            }
            // Generar el certificado PDF
            const certificadoBuffer = await this.generateCourseCertificatePDF(participacion);
            // Generar nombre único para el archivo
            const nombreArchivo = `certificado_curso_${participacion.inscripcionCurso.curso.nom_cur.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
            // Actualizar la participación con el certificado
            await prisma.participacionCurso.update({
                where: { id_par_cur: idParticipacion },
                data: {
                    certificado_pdf: certificadoBuffer,
                    certificado_filename: nombreArchivo,
                    certificado_size: certificadoBuffer.length,
                    fec_cer_par_cur: new Date()
                }
            });
            res.json({
                success: true,
                message: 'Certificado generado exitosamente',
                certificado: {
                    filename: nombreArchivo,
                    size: certificadoBuffer.length,
                    fecha_generacion: new Date()
                }
            });
        }
        catch (error) {
            console.error('[generateCourseCertificate] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * Generar PDF del certificado de evento
     */
    async generateEventCertificatePDF(participacion) {
        const PDFDocument = require('pdfkit');
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                const evento = participacion.inscripcion.evento;
                const usuario = participacion.inscripcion.usuario;
                const nombreCompleto = `${usuario.nom_usu1} ${usuario.nom_usu2 || ''} ${usuario.ape_usu1} ${usuario.ape_usu2 || ''}`.trim();
                // Configurar fuentes y colores
                doc.fillColor('#1a365d');
                // Título principal
                doc.fontSize(28).text('CERTIFICADO DE PARTICIPACIÓN', 100, 100, { align: 'center' });
                // Línea decorativa
                doc.moveTo(100, 150).lineTo(700, 150).stroke();
                // Contenido del certificado
                doc.fontSize(16).fillColor('#2d3748');
                doc.text('Se certifica que', 100, 200, { align: 'center' });
                doc.fontSize(22).fillColor('#1a365d');
                doc.text(nombreCompleto, 100, 240, { align: 'center' });
                doc.fontSize(16).fillColor('#2d3748');
                doc.text('participó exitosamente en el evento', 100, 280, { align: 'center' });
                doc.fontSize(20).fillColor('#1a365d');
                doc.text(evento.nom_eve, 100, 320, { align: 'center' });
                doc.fontSize(14).fillColor('#4a5568');
                doc.text(`Categoría: ${evento.categoria.nom_cat}`, 100, 360, { align: 'center' });
                doc.text(`Realizado del ${new Date(evento.fec_ini_eve).toLocaleDateString()} al ${new Date(evento.fec_fin_eve).toLocaleDateString()}`, 100, 380, { align: 'center' });
                doc.text(`Asistencia: ${participacion.asi_par}%`, 100, 400, { align: 'center' });
                // Firma y fecha
                doc.fontSize(12).fillColor('#718096');
                doc.text(`Certificado generado el ${new Date().toLocaleDateString()}`, 100, 480, { align: 'center' });
                doc.text(`Cédula: ${usuario.ced_usu}`, 100, 500, { align: 'center' });
                doc.end();
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Generar PDF del certificado de curso
     */
    async generateCourseCertificatePDF(participacion) {
        const PDFDocument = require('pdfkit');
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                const curso = participacion.inscripcionCurso.curso;
                const usuario = participacion.inscripcionCurso.usuario;
                const nombreCompleto = `${usuario.nom_usu1} ${usuario.nom_usu2 || ''} ${usuario.ape_usu1} ${usuario.ape_usu2 || ''}`.trim();
                // Configurar fuentes y colores
                doc.fillColor('#1a365d');
                // Título principal
                doc.fontSize(28).text('CERTIFICADO DE APROBACIÓN', 100, 100, { align: 'center' });
                // Línea decorativa
                doc.moveTo(100, 150).lineTo(700, 150).stroke();
                // Contenido del certificado
                doc.fontSize(16).fillColor('#2d3748');
                doc.text('Se certifica que', 100, 200, { align: 'center' });
                doc.fontSize(22).fillColor('#1a365d');
                doc.text(nombreCompleto, 100, 240, { align: 'center' });
                doc.fontSize(16).fillColor('#2d3748');
                doc.text('aprobó satisfactoriamente el curso', 100, 280, { align: 'center' });
                doc.fontSize(20).fillColor('#1a365d');
                doc.text(curso.nom_cur, 100, 320, { align: 'center' });
                doc.fontSize(14).fillColor('#4a5568');
                doc.text(`Categoría: ${curso.categoria.nom_cat}`, 100, 360, { align: 'center' });
                doc.text(`Duración: ${curso.dur_cur} horas`, 100, 380, { align: 'center' });
                doc.text(`Realizado del ${new Date(curso.fec_ini_cur).toLocaleDateString()} al ${new Date(curso.fec_fin_cur).toLocaleDateString()}`, 100, 400, { align: 'center' });
                doc.text(`Nota final: ${participacion.nota_final}/10 - Asistencia: ${participacion.asistencia_porcentaje}%`, 100, 420, { align: 'center' });
                // Firma y fecha
                doc.fontSize(12).fillColor('#718096');
                doc.text(`Certificado generado el ${new Date().toLocaleDateString()}`, 100, 480, { align: 'center' });
                doc.text(`Cédula: ${usuario.ced_usu}`, 100, 500, { align: 'center' });
                doc.end();
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
exports.CertificateController = CertificateController;
//# sourceMappingURL=CertificateController.js.map