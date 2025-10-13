"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaParticipationRepository = void 0;
/**
 * Implementación concreta del repositorio de participaciones usando Prisma
 * Principio DIP: Implementa la interfaz del dominio
 * Principio SRP: Solo se encarga de la persistencia de participaciones
 */
class PrismaParticipationRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Crear una nueva participación
     */
    async create(participationData) {
        try {
            const newParticipation = await this.prisma.participacion.create({
                data: {
                    asi_par: participationData.grading?.attendancePercentage || 0,
                    aprobado: participationData.grading?.isApproved || false,
                    id_ins_per: participationData.activityId, // ID de inscripción
                },
                include: {
                    inscripcion: {
                        include: {
                            usuario: true,
                            evento: true,
                        },
                    },
                },
            });
            return this.mapPrismaToEntity(newParticipation);
        }
        catch (error) {
            throw new Error(`Error creating participation: ${error}`);
        }
    }
    /**
     * Buscar participación por ID
     */
    async findById(id) {
        try {
            const participation = await this.prisma.participacion.findUnique({
                where: { id_par: id },
                include: {
                    inscripcion: {
                        include: {
                            usuario: true,
                            evento: true,
                        },
                    },
                },
            });
            return participation ? this.mapPrismaToEntity(participation) : null;
        }
        catch (error) {
            throw new Error(`Error finding participation by id: ${error}`);
        }
    }
    /**
     * Buscar participación por inscripción ID
     */
    async findByInscriptionId(inscriptionId) {
        try {
            const participation = await this.prisma.participacion.findUnique({
                where: { id_ins_per: inscriptionId },
                include: {
                    inscripcion: {
                        include: {
                            usuario: true,
                            evento: true,
                        },
                    },
                },
            });
            return participation ? this.mapPrismaToEntity(participation) : null;
        }
        catch (error) {
            throw new Error(`Error finding participation by inscription id: ${error}`);
        }
    }
    /**
     * Obtener todas las participaciones
     */
    async findAll() {
        try {
            const participations = await this.prisma.participacion.findMany({
                include: {
                    inscripcion: {
                        include: {
                            usuario: true,
                            evento: true,
                        },
                    },
                },
                orderBy: {
                    fec_evaluacion: "desc",
                },
            });
            return participations.map(this.mapPrismaToEntity);
        }
        catch (error) {
            throw new Error(`Error finding all participations: ${error}`);
        }
    }
    /**
     * Actualizar participación por ID
     */
    async update(id, participationData) {
        try {
            const updateData = {};
            if (participationData.grading?.attendancePercentage !== undefined) {
                updateData.asi_par = participationData.grading.attendancePercentage;
            }
            if (participationData.grading?.isApproved !== undefined) {
                updateData.aprobado = participationData.grading.isApproved;
            }
            if (participationData.grading?.evaluationDate) {
                updateData.fec_evaluacion = participationData.grading.evaluationDate;
            }
            const updatedParticipation = await this.prisma.participacion.update({
                where: { id_par: id },
                data: updateData,
                include: {
                    inscripcion: {
                        include: {
                            usuario: true,
                            evento: true,
                        },
                    },
                },
            });
            return this.mapPrismaToEntity(updatedParticipation);
        }
        catch (error) {
            if (error.code === "P2025") {
                return null; // Participación no encontrada
            }
            throw new Error(`Error updating participation: ${error}`);
        }
    }
    /**
     * Eliminar participación por ID
     */
    async delete(id) {
        try {
            await this.prisma.participacion.delete({
                where: { id_par: id },
            });
        }
        catch (error) {
            if (error.code === "P2025") {
                throw new Error("Participation not found");
            }
            throw new Error(`Error deleting participation: ${error}`);
        }
    }
    /**
     * Buscar participaciones con filtros
     */
    async findWithFilters(filters) {
        try {
            const whereClause = {};
            // Filtro por usuario
            if (filters.userId) {
                whereClause.inscripcion = {
                    id_usu_ins: filters.userId,
                };
            }
            // Filtro por evento
            if (filters.eventId) {
                whereClause.inscripcion = {
                    ...whereClause.inscripcion,
                    id_eve_ins: filters.eventId,
                };
            }
            // Filtro por aprobado
            if (filters.approved !== undefined) {
                whereClause.aprobado = filters.approved;
            }
            // Filtro por rango de asistencia
            if (filters.attendanceMin !== undefined ||
                filters.attendanceMax !== undefined) {
                whereClause.asi_par = {};
                if (filters.attendanceMin !== undefined) {
                    whereClause.asi_par.gte = filters.attendanceMin;
                }
                if (filters.attendanceMax !== undefined) {
                    whereClause.asi_par.lte = filters.attendanceMax;
                }
            }
            // Filtro por certificado
            if (filters.hasCertificate !== undefined) {
                if (filters.hasCertificate) {
                    whereClause.certificado_pdf = { not: null };
                }
                else {
                    whereClause.certificado_pdf = null;
                }
            }
            // Filtro por fecha
            if (filters.dateFrom || filters.dateTo) {
                whereClause.fec_evaluacion = {};
                if (filters.dateFrom) {
                    whereClause.fec_evaluacion.gte = filters.dateFrom;
                }
                if (filters.dateTo) {
                    whereClause.fec_evaluacion.lte = filters.dateTo;
                }
            }
            const participations = await this.prisma.participacion.findMany({
                where: whereClause,
                include: {
                    inscripcion: {
                        include: {
                            usuario: true,
                            evento: true,
                        },
                    },
                },
                orderBy: {
                    fec_evaluacion: "desc",
                },
            });
            return participations.map(this.mapPrismaToEntity);
        }
        catch (error) {
            throw new Error(`Error finding participations with filters: ${error}`);
        }
    }
    /**
     * Verificar si existe una participación
     */
    async existsById(id) {
        try {
            const count = await this.prisma.participacion.count({
                where: { id_par: id },
            });
            return count > 0;
        }
        catch (error) {
            throw new Error(`Error checking participation existence: ${error}`);
        }
    }
    /**
     * Obtener participaciones por usuario ID
     */
    async findByUserId(userId) {
        try {
            const participations = await this.prisma.participacion.findMany({
                where: {
                    inscripcion: {
                        id_usu_ins: userId,
                    },
                },
                include: {
                    inscripcion: {
                        include: {
                            usuario: true,
                            evento: true,
                        },
                    },
                },
            });
            return participations.map(this.mapPrismaToEntity);
        }
        catch (error) {
            throw new Error(`Error finding participations by user id: ${error}`);
        }
    }
    /**
     * Obtener participaciones por evento ID
     */
    async findByEventId(eventId) {
        try {
            const participations = await this.prisma.participacion.findMany({
                where: {
                    inscripcion: {
                        id_eve_ins: eventId,
                    },
                },
                include: {
                    inscripcion: {
                        include: {
                            usuario: true,
                            evento: true,
                        },
                    },
                },
            });
            return participations.map(this.mapPrismaToEntity);
        }
        catch (error) {
            throw new Error(`Error finding participations by event id: ${error}`);
        }
    }
    /**
     * Obtener participaciones aprobadas
     */
    async findApproved() {
        try {
            return this.findWithFilters({ approved: true });
        }
        catch (error) {
            throw new Error(`Error finding approved participations: ${error}`);
        }
    }
    /**
     * Obtener participaciones pendientes de evaluación
     */
    async findPending() {
        try {
            const participations = await this.prisma.participacion.findMany({
                where: {
                    fec_evaluacion: null,
                },
                include: {
                    inscripcion: {
                        include: {
                            usuario: true,
                            evento: true,
                        },
                    },
                },
            });
            return participations.map(this.mapPrismaToEntity);
        }
        catch (error) {
            throw new Error(`Error finding pending participations: ${error}`);
        }
    }
    /**
     * Actualizar asistencia de una participación
     */
    async updateAttendance(id, attendancePercentage) {
        try {
            const updatedParticipation = await this.prisma.participacion.update({
                where: { id_par: id },
                data: {
                    asi_par: attendancePercentage,
                    aprobado: attendancePercentage >= 80, // Auto-evaluar aprobación
                    fec_evaluacion: new Date(),
                },
                include: {
                    inscripcion: {
                        include: {
                            usuario: true,
                            evento: true,
                        },
                    },
                },
            });
            return this.mapPrismaToEntity(updatedParticipation);
        }
        catch (error) {
            if (error.code === "P2025") {
                return null;
            }
            throw new Error(`Error updating attendance: ${error}`);
        }
    }
    /**
     * Generar certificado para una participación
     */
    async generateCertificate(id, certificateData) {
        try {
            const updatedParticipation = await this.prisma.participacion.update({
                where: { id_par: id },
                data: {
                    certificado_pdf: certificateData.certificatePdf,
                    certificado_filename: certificateData.filename,
                    certificado_size: certificateData.size,
                    fec_cer_par: new Date(),
                },
                include: {
                    inscripcion: {
                        include: {
                            usuario: true,
                            evento: true,
                        },
                    },
                },
            });
            return this.mapPrismaToEntity(updatedParticipation);
        }
        catch (error) {
            if (error.code === "P2025") {
                return null;
            }
            throw new Error(`Error generating certificate: ${error}`);
        }
    }
    /**
     * Obtener estadísticas de participaciones
     */
    async getParticipationStats() {
        try {
            const [total, approved, withCertificate] = await Promise.all([
                this.prisma.participacion.count(),
                this.prisma.participacion.count({
                    where: { aprobado: true },
                }),
                this.prisma.participacion.count({
                    where: { certificado_pdf: { not: null } },
                }),
            ]);
            const averageAttendance = await this.prisma.participacion.aggregate({
                _avg: {
                    asi_par: true,
                },
            });
            return {
                totalParticipations: total,
                approvedParticipations: approved,
                pendingParticipations: total - approved,
                averageAttendance: averageAttendance._avg.asi_par || 0,
                certificatesGenerated: withCertificate,
            };
        }
        catch (error) {
            throw new Error(`Error getting participation stats: ${error}`);
        }
    }
    /**
     * Evaluar automáticamente aprobación basada en asistencia
     */
    async evaluateApproval(id) {
        try {
            const participation = await this.findById(id);
            if (!participation || !participation.grading) {
                return null;
            }
            const isApproved = participation.grading.attendancePercentage >= 80;
            return this.update(id, {
                grading: {
                    ...participation.grading,
                    isApproved,
                    evaluationDate: new Date(),
                },
            });
        }
        catch (error) {
            throw new Error(`Error evaluating approval: ${error}`);
        }
    }
    /**
     * Mapear datos de Prisma a entidad del dominio
     */
    mapPrismaToEntity(prismaParticipation) {
        return {
            id: prismaParticipation.id_par,
            activityId: prismaParticipation.inscripcion.id_eve_ins,
            activityName: prismaParticipation.inscripcion.evento?.nom_eve || "",
            activityType: "EVENT",
            participantId: prismaParticipation.inscripcion.id_usu_ins,
            participantName: `${prismaParticipation.inscripcion.usuario?.nom_usu1} ${prismaParticipation.inscripcion.usuario?.ape_usu1}`,
            participantEmail: prismaParticipation.inscripcion.usuario?.cuentas?.[0]?.cor_cue || "",
            participantCedula: prismaParticipation.inscripcion.usuario?.ced_usu || "",
            enrollmentId: prismaParticipation.id_ins_per,
            enrollmentDate: prismaParticipation.inscripcion.fec_ins,
            paymentStatus: prismaParticipation.inscripcion.estado_pago === "APROBADO"
                ? "APPROVED"
                : prismaParticipation.inscripcion.estado_pago === "RECHAZADO"
                    ? "REJECTED"
                    : "PENDING",
            status: prismaParticipation.aprobado
                ? "COMPLETED"
                : "ATTENDING",
            startDate: prismaParticipation.inscripcion.evento?.fec_ini_eve,
            completionDate: prismaParticipation.fec_evaluacion || undefined,
            grading: {
                attendancePercentage: prismaParticipation.asi_par,
                isApproved: prismaParticipation.aprobado,
                evaluationDate: prismaParticipation.fec_evaluacion || undefined,
                certificateGenerated: !!prismaParticipation.certificado_pdf,
                finalGrade: prismaParticipation.asi_par, // Usando asistencia como nota
            },
            attendanceRecords: [], // Se puede implementar si es necesario
            minimumAttendancePercentage: prismaParticipation.inscripcion.evento
                ?.porcentaje_asistencia_aprobacion || 80,
            minimumGradeRequired: undefined, // Solo para cursos
            totalSessions: Math.ceil((prismaParticipation.inscripcion.evento?.dur_eve || 8) / 2), // Estimado
            sessionsAttended: Math.ceil((prismaParticipation.asi_par / 100) *
                Math.ceil((prismaParticipation.inscripcion.evento?.dur_eve || 8) / 2)),
            createdAt: prismaParticipation.inscripcion.fec_ins || new Date(),
            updatedAt: prismaParticipation.fec_evaluacion || new Date(),
            notificationsEnabled: true,
            remindersSent: 0,
        };
    }
}
exports.PrismaParticipationRepository = PrismaParticipationRepository;
//# sourceMappingURL=PrismaParticipationRepository.js.map