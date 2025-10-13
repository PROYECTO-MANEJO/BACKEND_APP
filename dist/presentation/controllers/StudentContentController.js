"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentContentController = void 0;
const BaseController_1 = require("./BaseController");
class StudentContentController extends BaseController_1.BaseController {
    constructor(container) {
        super();
        this.container = container;
    }
    /**
     * GET /api/student/events/available
     * Obtener eventos disponibles para estudiantes (igual que Usuario Normal pero con validación de documentos)
     */
    async getAvailableEvents(req, res) {
        try {
            const userId = req.usuario?.id_usu || req.uid;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            // Obtener información del usuario
            const usuario = await prisma.usuario.findUnique({
                where: { id_usu: userId },
                select: {
                    documentos_verificados: true,
                    id_car_per: true
                }
            });
            if (!usuario) {
                res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
                return;
            }
            // Obtener eventos disponibles (misma lógica que Usuario Normal)
            const eventos = await prisma.evento.findMany({
                where: {
                    estado: 'ACTIVO',
                    fec_ini_eve: { gte: new Date() }
                },
                include: {
                    categoria: {
                        select: { nom_cat: true }
                    },
                    organizador: {
                        select: {
                            nom_org1: true,
                            ape_org1: true
                        }
                    },
                    _count: { select: { inscripciones: true } }
                },
                orderBy: { fec_ini_eve: 'asc' }
            });
            res.json({
                success: true,
                data: {
                    eventos: eventos.map(evento => ({
                        id_eve: evento.id_eve,
                        nom_eve: evento.nom_eve,
                        des_eve: evento.des_eve,
                        fec_ini_eve: evento.fec_ini_eve,
                        fec_fin_eve: evento.fec_fin_eve,
                        ubi_eve: evento.ubi_eve,
                        capacidad_max_eve: evento.capacidad_max_eve,
                        inscritos_actuales: evento._count.inscripciones,
                        cupos_disponibles: evento.capacidad_max_eve - evento._count.inscripciones,
                        es_gratuito: evento.es_gratuito,
                        precio: evento.precio ? Number(evento.precio) : null,
                        categoria: evento.categoria.nom_cat,
                        organizador: `${evento.organizador.nom_org1} ${evento.organizador.ape_org1}`,
                        puede_inscribirse: this.canStudentEnroll(usuario)
                    })),
                    usuario: {
                        documentos_verificados: usuario.documentos_verificados,
                        tiene_carrera: !!usuario.id_car_per
                    }
                }
            });
        }
        catch (error) {
            console.error('[getAvailableEvents] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * GET /api/student/courses/available
     * Obtener cursos disponibles para estudiantes (igual que Usuario Normal pero con validación de documentos)
     */
    async getAvailableCourses(req, res) {
        try {
            const userId = req.usuario?.id_usu || req.uid;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }
            const prisma = this.container.getPrismaClient();
            // Obtener información del usuario
            const usuario = await prisma.usuario.findUnique({
                where: { id_usu: userId },
                select: {
                    documentos_verificados: true,
                    id_car_per: true
                }
            });
            if (!usuario) {
                res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
                return;
            }
            // Obtener cursos disponibles (misma lógica que Usuario Normal)
            const cursos = await prisma.curso.findMany({
                where: {
                    estado: 'ACTIVO',
                    fec_ini_cur: { gte: new Date() }
                },
                include: {
                    categoria: {
                        select: { nom_cat: true }
                    },
                    organizador: {
                        select: {
                            nom_org1: true,
                            ape_org1: true
                        }
                    },
                    _count: { select: { inscripcionesCurso: true } }
                },
                orderBy: { fec_ini_cur: 'asc' }
            });
            res.json({
                success: true,
                data: {
                    cursos: cursos.map(curso => ({
                        id_cur: curso.id_cur,
                        nom_cur: curso.nom_cur,
                        des_cur: curso.des_cur,
                        fec_ini_cur: curso.fec_ini_cur,
                        fec_fin_cur: curso.fec_fin_cur,
                        capacidad_max_cur: curso.capacidad_max_cur,
                        inscritos_actuales: curso._count.inscripcionesCurso,
                        cupos_disponibles: curso.capacidad_max_cur - curso._count.inscripcionesCurso,
                        es_gratuito: curso.es_gratuito,
                        precio: curso.precio ? Number(curso.precio) : null,
                        requiere_verificacion_docs: curso.requiere_verificacion_docs,
                        categoria: curso.categoria.nom_cat,
                        organizador: `${curso.organizador.nom_org1} ${curso.organizador.ape_org1}`,
                        puede_inscribirse: this.canStudentEnrollInCourse(curso, usuario)
                    })),
                    usuario: {
                        documentos_verificados: usuario.documentos_verificados,
                        tiene_carrera: !!usuario.id_car_per
                    }
                }
            });
        }
        catch (error) {
            console.error('[getAvailableCourses] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    // =====================================================
    // MÉTODOS AUXILIARES PRIVADOS (SIMPLIFICADOS)
    // =====================================================
    /**
     * Verificar si un estudiante puede inscribirse (validación básica de documentos)
     */
    canStudentEnroll(usuario) {
        // Para estudiantes, se requieren documentos verificados
        return usuario.documentos_verificados;
    }
    /**
     * Verificar si un estudiante puede inscribirse en un curso específico
     */
    canStudentEnrollInCourse(curso, usuario) {
        // Verificar cupos disponibles
        const cuposDisponibles = curso.capacidad_max_cur - curso._count.inscripcionesCurso;
        if (cuposDisponibles <= 0)
            return false;
        // Verificar documentos si es requerido por el curso
        if (curso.requiere_verificacion_docs && !usuario.documentos_verificados) {
            return false;
        }
        return true;
    }
}
exports.StudentContentController = StudentContentController;
//# sourceMappingURL=StudentContentController.js.map