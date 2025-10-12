"use strict";
/**
 * Enrollment Repository Implementation - Infrastructure Layer
 *
 * Implementación para inscripciones tanto de eventos como de cursos
 * Maneja operaciones básicas según el esquema Prisma real
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaEnrollmentRepository = void 0;
class PrismaEnrollmentRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // ===== INSCRIPCIONES DE EVENTOS =====
    async createEventEnrollment(enrollmentData) {
        if (!enrollmentData.eventId) {
            throw new Error('Event ID is required for event enrollment');
        }
        const inscripcion = await this.prisma.inscripcion.create({
            data: {
                fec_ins: enrollmentData.enrollmentDate,
                val_ins: enrollmentData.value || null,
                met_pag_ins: enrollmentData.paymentMethod || null,
                enl_ord_pag_ins: enrollmentData.paymentOrderLink || null,
                comprobante_pago_pdf: enrollmentData.paymentProof || null,
                comprobante_filename: enrollmentData.proofFilename || null,
                comprobante_size: enrollmentData.proofSize || null,
                fec_subida_comprobante: enrollmentData.proofUploadDate || null,
                id_usu_ins: enrollmentData.userId,
                id_eve_ins: enrollmentData.eventId,
                estado_pago: enrollmentData.paymentStatus || 'PENDIENTE',
                id_admin_aprobador: enrollmentData.approvingAdminId || null,
                fec_aprobacion: enrollmentData.approvalDate || null,
                carta_motivacion: enrollmentData.motivationLetter || null
            },
            include: {
                usuario: true,
                evento: true,
                adminAprobador: true
            }
        });
        return this.mapToEnrollmentData(inscripcion, 'event');
    }
    async createCourseEnrollment(enrollmentData) {
        if (!enrollmentData.courseId) {
            throw new Error('Course ID is required for course enrollment');
        }
        const inscripcion = await this.prisma.inscripcionCurso.create({
            data: {
                fec_ins_cur: enrollmentData.enrollmentDate,
                val_ins_cur: enrollmentData.value || null,
                met_pag_ins_cur: enrollmentData.paymentMethod || null,
                enl_ord_pag_ins_cur: enrollmentData.paymentOrderLink || null,
                comprobante_pago_pdf: enrollmentData.paymentProof || null,
                comprobante_filename: enrollmentData.proofFilename || null,
                comprobante_size: enrollmentData.proofSize || null,
                fec_subida_comprobante: enrollmentData.proofUploadDate || null,
                id_usu_ins_cur: enrollmentData.userId,
                id_cur_ins: enrollmentData.courseId,
                estado_pago_cur: enrollmentData.paymentStatus || 'PENDIENTE',
                id_admin_aprobador_cur: enrollmentData.approvingAdminId || null,
                fec_aprobacion_cur: enrollmentData.approvalDate || null,
                carta_motivacion: enrollmentData.motivationLetter || null
            },
            include: {
                usuario: true,
                curso: true,
                adminAprobador: true
            }
        });
        return this.mapToEnrollmentData(inscripcion, 'course');
    }
    // ===== BÚSQUEDAS =====
    async findEventEnrollmentById(id) {
        const inscripcion = await this.prisma.inscripcion.findUnique({
            where: { id_ins: id },
            include: {
                usuario: true,
                evento: true,
                adminAprobador: true
            }
        });
        if (!inscripcion)
            return null;
        return this.mapToEnrollmentData(inscripcion, 'event');
    }
    async findCourseEnrollmentById(id) {
        const inscripcion = await this.prisma.inscripcionCurso.findUnique({
            where: { id_ins_cur: id },
            include: {
                usuario: true,
                curso: true,
                adminAprobador: true
            }
        });
        if (!inscripcion)
            return null;
        return this.mapToEnrollmentData(inscripcion, 'course');
    }
    async findEventEnrollmentsByUser(userId) {
        const inscripciones = await this.prisma.inscripcion.findMany({
            where: { id_usu_ins: userId },
            include: {
                usuario: true,
                evento: true,
                adminAprobador: true
            }
        });
        return inscripciones.map(inscripcion => this.mapToEnrollmentData(inscripcion, 'event'));
    }
    async findCourseEnrollmentsByUser(userId) {
        const inscripciones = await this.prisma.inscripcionCurso.findMany({
            where: { id_usu_ins_cur: userId },
            include: {
                usuario: true,
                curso: true,
                adminAprobador: true
            }
        });
        return inscripciones.map(inscripcion => this.mapToEnrollmentData(inscripcion, 'course'));
    }
    async findEventEnrollmentsByEvent(eventId) {
        const inscripciones = await this.prisma.inscripcion.findMany({
            where: { id_eve_ins: eventId },
            include: {
                usuario: true,
                evento: true,
                adminAprobador: true
            }
        });
        return inscripciones.map(inscripcion => this.mapToEnrollmentData(inscripcion, 'event'));
    }
    async findCourseEnrollmentsByCourse(courseId) {
        const inscripciones = await this.prisma.inscripcionCurso.findMany({
            where: { id_cur_ins: courseId },
            include: {
                usuario: true,
                curso: true,
                adminAprobador: true
            }
        });
        return inscripciones.map(inscripcion => this.mapToEnrollmentData(inscripcion, 'course'));
    }
    async findEnrollmentsByPaymentStatus(status, type) {
        if (type === 'event') {
            const inscripciones = await this.prisma.inscripcion.findMany({
                where: { estado_pago: status },
                include: {
                    usuario: true,
                    evento: true,
                    adminAprobador: true
                }
            });
            return inscripciones.map(inscripcion => this.mapToEnrollmentData(inscripcion, 'event'));
        }
        else {
            const inscripciones = await this.prisma.inscripcionCurso.findMany({
                where: { estado_pago_cur: status },
                include: {
                    usuario: true,
                    curso: true,
                    adminAprobador: true
                }
            });
            return inscripciones.map(inscripcion => this.mapToEnrollmentData(inscripcion, 'course'));
        }
    }
    // ===== ACTUALIZACIONES =====
    async updateEventEnrollment(id, enrollmentData) {
        const inscripcion = await this.prisma.inscripcion.update({
            where: { id_ins: id },
            data: {
                val_ins: enrollmentData.value,
                met_pag_ins: enrollmentData.paymentMethod,
                enl_ord_pag_ins: enrollmentData.paymentOrderLink,
                comprobante_pago_pdf: enrollmentData.paymentProof,
                comprobante_filename: enrollmentData.proofFilename,
                comprobante_size: enrollmentData.proofSize,
                fec_subida_comprobante: enrollmentData.proofUploadDate,
                estado_pago: enrollmentData.paymentStatus,
                id_admin_aprobador: enrollmentData.approvingAdminId,
                fec_aprobacion: enrollmentData.approvalDate,
                carta_motivacion: enrollmentData.motivationLetter
            },
            include: {
                usuario: true,
                evento: true,
                adminAprobador: true
            }
        });
        return this.mapToEnrollmentData(inscripcion, 'event');
    }
    async updateCourseEnrollment(id, enrollmentData) {
        const inscripcion = await this.prisma.inscripcionCurso.update({
            where: { id_ins_cur: id },
            data: {
                val_ins_cur: enrollmentData.value,
                met_pag_ins_cur: enrollmentData.paymentMethod,
                enl_ord_pag_ins_cur: enrollmentData.paymentOrderLink,
                comprobante_pago_pdf: enrollmentData.paymentProof,
                comprobante_filename: enrollmentData.proofFilename,
                comprobante_size: enrollmentData.proofSize,
                fec_subida_comprobante: enrollmentData.proofUploadDate,
                estado_pago_cur: enrollmentData.paymentStatus,
                id_admin_aprobador_cur: enrollmentData.approvingAdminId,
                fec_aprobacion_cur: enrollmentData.approvalDate,
                carta_motivacion: enrollmentData.motivationLetter
            },
            include: {
                usuario: true,
                curso: true,
                adminAprobador: true
            }
        });
        return this.mapToEnrollmentData(inscripcion, 'course');
    }
    // ===== ELIMINACIONES =====
    async deleteEventEnrollment(id) {
        await this.prisma.inscripcion.delete({
            where: { id_ins: id }
        });
    }
    async deleteCourseEnrollment(id) {
        await this.prisma.inscripcionCurso.delete({
            where: { id_ins_cur: id }
        });
    }
    // ===== UTILITY METHODS =====
    mapToEnrollmentData(inscripcion, type) {
        if (type === 'event') {
            return {
                id: inscripcion.id_ins,
                enrollmentDate: inscripcion.fec_ins,
                value: inscripcion.val_ins ? parseFloat(inscripcion.val_ins.toString()) : undefined,
                paymentMethod: inscripcion.met_pag_ins || undefined,
                paymentOrderLink: inscripcion.enl_ord_pag_ins || undefined,
                paymentProof: inscripcion.comprobante_pago_pdf || undefined,
                proofFilename: inscripcion.comprobante_filename || undefined,
                proofSize: inscripcion.comprobante_size || undefined,
                proofUploadDate: inscripcion.fec_subida_comprobante || undefined,
                userId: inscripcion.id_usu_ins,
                eventId: inscripcion.id_eve_ins,
                paymentStatus: inscripcion.estado_pago,
                approvingAdminId: inscripcion.id_admin_aprobador || undefined,
                approvalDate: inscripcion.fec_aprobacion || undefined,
                motivationLetter: inscripcion.carta_motivacion || undefined
            };
        }
        else {
            return {
                id: inscripcion.id_ins_cur,
                enrollmentDate: inscripcion.fec_ins_cur,
                value: inscripcion.val_ins_cur ? parseFloat(inscripcion.val_ins_cur.toString()) : undefined,
                paymentMethod: inscripcion.met_pag_ins_cur || undefined,
                paymentOrderLink: inscripcion.enl_ord_pag_ins_cur || undefined,
                paymentProof: inscripcion.comprobante_pago_pdf || undefined,
                proofFilename: inscripcion.comprobante_filename || undefined,
                proofSize: inscripcion.comprobante_size || undefined,
                proofUploadDate: inscripcion.fec_subida_comprobante || undefined,
                userId: inscripcion.id_usu_ins_cur,
                courseId: inscripcion.id_cur_ins,
                paymentStatus: inscripcion.estado_pago_cur,
                approvingAdminId: inscripcion.id_admin_aprobador_cur || undefined,
                approvalDate: inscripcion.fec_aprobacion_cur || undefined,
                motivationLetter: inscripcion.carta_motivacion || undefined
            };
        }
    }
}
exports.PrismaEnrollmentRepository = PrismaEnrollmentRepository;
