"use strict";
/**
 * Course Repository Implementation - Infrastructure Layer
 *
 * Implementación simplificada que funciona con el esquema Prisma real
 * Maneja operaciones básicas de cursos según la estructura existente
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaCourseRepository = void 0;
class PrismaCourseRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(courseData) {
        const curso = await this.prisma.curso.create({
            data: {
                nom_cur: courseData.name,
                des_cur: courseData.description,
                dur_cur: courseData.duration,
                fec_ini_cur: courseData.startDate,
                fec_fin_cur: courseData.endDate,
                id_cat_cur: courseData.categoryId,
                ced_org_cur: courseData.organizerId,
                capacidad_max_cur: courseData.maxCapacity,
                tipo_audiencia_cur: courseData.audienceType,
                requiere_verificacion_docs: courseData.requiresDocumentVerification || true,
                es_gratuito: courseData.isFree,
                precio: courseData.price || null,
                porcentaje_asistencia_aprobacion: courseData.attendanceApprovalPercentage,
                nota_minima_aprobacion: courseData.minimumGradeApproval,
                estado: courseData.status || "ACTIVO",
                requiere_carta_motivacion: courseData.requiresMotivationLetter || false,
            },
            include: {
                categoria: true,
                organizador: true,
            },
        });
        // Crear asociaciones con carreras si existen
        if (courseData.associatedCareers &&
            courseData.associatedCareers.length > 0) {
            await this.prisma.cursoPorCarrera.createMany({
                data: courseData.associatedCareers.map((carreraId) => ({
                    id_cur_per: curso.id_cur,
                    id_car_per: carreraId,
                })),
            });
        }
        return this.mapToCourseData(curso);
    }
    async findById(id) {
        const curso = await this.prisma.curso.findUnique({
            where: { id_cur: id },
            include: {
                categoria: true,
                organizador: true,
                cursosPorCarrera: {
                    include: {
                        carrera: true,
                    },
                },
            },
        });
        if (!curso)
            return null;
        return this.mapToCourseData(curso);
    }
    async findAll() {
        const cursos = await this.prisma.curso.findMany({
            include: {
                categoria: true,
                organizador: true,
                cursosPorCarrera: {
                    include: {
                        carrera: true,
                    },
                },
            },
            orderBy: {
                fec_ini_cur: "desc",
            },
        });
        return cursos.map((curso) => this.mapToCourseData(curso));
    }
    async update(id, courseData) {
        const curso = await this.prisma.curso.update({
            where: { id_cur: id },
            data: {
                nom_cur: courseData.name,
                des_cur: courseData.description,
                dur_cur: courseData.duration,
                fec_ini_cur: courseData.startDate,
                fec_fin_cur: courseData.endDate,
                capacidad_max_cur: courseData.maxCapacity,
                requiere_verificacion_docs: courseData.requiresDocumentVerification,
                es_gratuito: courseData.isFree,
                precio: courseData.price,
                porcentaje_asistencia_aprobacion: courseData.attendanceApprovalPercentage,
                nota_minima_aprobacion: courseData.minimumGradeApproval,
                estado: courseData.status,
                requiere_carta_motivacion: courseData.requiresMotivationLetter,
            },
            include: {
                categoria: true,
                organizador: true,
                cursosPorCarrera: {
                    include: {
                        carrera: true,
                    },
                },
            },
        });
        // Actualizar asociaciones con carreras si se especifican
        if (courseData.associatedCareers !== undefined) {
            await this.prisma.cursoPorCarrera.deleteMany({
                where: { id_cur_per: id },
            });
            if (courseData.associatedCareers.length > 0) {
                await this.prisma.cursoPorCarrera.createMany({
                    data: courseData.associatedCareers.map((carreraId) => ({
                        id_cur_per: id,
                        id_car_per: carreraId,
                    })),
                });
            }
        }
        return this.mapToCourseData(curso);
    }
    async delete(id) {
        // Eliminar asociaciones con carreras primero
        await this.prisma.cursoPorCarrera.deleteMany({
            where: { id_cur_per: id },
        });
        await this.prisma.curso.delete({
            where: { id_cur: id },
        });
    }
    async findByCategory(categoryId) {
        const cursos = await this.prisma.curso.findMany({
            where: { id_cat_cur: categoryId },
            include: {
                categoria: true,
                organizador: true,
                cursosPorCarrera: {
                    include: {
                        carrera: true,
                    },
                },
            },
        });
        return cursos.map((curso) => this.mapToCourseData(curso));
    }
    async findByOrganizer(organizerId) {
        const cursos = await this.prisma.curso.findMany({
            where: { ced_org_cur: organizerId },
            include: {
                categoria: true,
                organizador: true,
                cursosPorCarrera: {
                    include: {
                        carrera: true,
                    },
                },
            },
        });
        return cursos.map((curso) => this.mapToCourseData(curso));
    }
    async findByStatus(status) {
        const cursos = await this.prisma.curso.findMany({
            where: { estado: status },
            include: {
                categoria: true,
                organizador: true,
                cursosPorCarrera: {
                    include: {
                        carrera: true,
                    },
                },
            },
        });
        return cursos.map((curso) => this.mapToCourseData(curso));
    }
    async getEnrollmentCount(courseId) {
        return await this.prisma.inscripcionCurso.count({
            where: {
                id_cur_ins: courseId,
            },
        });
    }
    mapToCourseData(curso) {
        return {
            id: curso.id_cur,
            name: curso.nom_cur,
            description: curso.des_cur,
            duration: curso.dur_cur,
            startDate: curso.fec_ini_cur,
            endDate: curso.fec_fin_cur,
            categoryId: curso.id_cat_cur,
            organizerId: curso.ced_org_cur,
            maxCapacity: curso.capacidad_max_cur,
            audienceType: curso.tipo_audiencia_cur,
            requiresDocumentVerification: curso.requiere_verificacion_docs,
            isFree: curso.es_gratuito,
            price: curso.precio || undefined,
            attendanceApprovalPercentage: curso.porcentaje_asistencia_aprobacion,
            minimumGradeApproval: parseFloat(curso.nota_minima_aprobacion.toString()),
            status: curso.estado,
            requiresMotivationLetter: curso.requiere_carta_motivacion,
            associatedCareers: curso.cursosPorCarrera?.map((cpc) => cpc.id_car_per) || [],
        };
    }
}
exports.PrismaCourseRepository = PrismaCourseRepository;
