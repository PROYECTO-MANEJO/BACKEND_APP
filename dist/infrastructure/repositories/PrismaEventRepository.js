"use strict";
/**
 * Event Repository Implementation - Infrastructure Layer
 *
 * Implementación simplificada que funciona con el esquema Prisma real
 * Maneja operaciones básicas de eventos según la estructura existente
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaEventRepository = void 0;
class PrismaEventRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(eventData) {
        const evento = await this.prisma.evento.create({
            data: {
                nom_eve: eventData.name,
                des_eve: eventData.description,
                id_cat_eve: eventData.categoryId,
                fec_ini_eve: eventData.startDate,
                fec_fin_eve: eventData.endDate || null,
                hor_ini_eve: eventData.startTime,
                hor_fin_eve: eventData.endTime || null,
                dur_eve: eventData.duration,
                are_eve: eventData.area,
                ubi_eve: eventData.location,
                ced_org_eve: eventData.organizerId,
                capacidad_max_eve: eventData.maxCapacity,
                tipo_audiencia_eve: eventData.audienceType,
                es_gratuito: eventData.isFree,
                precio: eventData.price || null,
                porcentaje_asistencia_aprobacion: eventData.attendanceApprovalPercentage,
                estado: eventData.status || "ACTIVO",
                requiere_carta_motivacion: eventData.requiresMotivationLetter || false,
            },
            include: {
                categoria: true,
                organizador: true,
            },
        });
        // Crear asociaciones con carreras si existen
        if (eventData.associatedCareers && eventData.associatedCareers.length > 0) {
            await this.prisma.eventoPorCarrera.createMany({
                data: eventData.associatedCareers.map((carreraId) => ({
                    id_eve_per: evento.id_eve,
                    id_car_per: carreraId,
                })),
            });
        }
        return this.mapToEventData(evento);
    }
    async findById(id) {
        const evento = await this.prisma.evento.findUnique({
            where: { id_eve: id },
            include: {
                categoria: true,
                organizador: true,
                eventosPorCarrera: {
                    include: {
                        carrera: true,
                    },
                },
            },
        });
        if (!evento)
            return null;
        return this.mapToEventData(evento);
    }
    async findAll() {
        const eventos = await this.prisma.evento.findMany({
            include: {
                categoria: true,
                organizador: true,
                eventosPorCarrera: {
                    include: {
                        carrera: true,
                    },
                },
            },
            orderBy: {
                fec_ini_eve: "desc",
            },
        });
        return eventos.map((evento) => this.mapToEventData(evento));
    }
    async update(id, eventData) {
        const evento = await this.prisma.evento.update({
            where: { id_eve: id },
            data: {
                nom_eve: eventData.name,
                des_eve: eventData.description,
                fec_ini_eve: eventData.startDate,
                fec_fin_eve: eventData.endDate,
                hor_ini_eve: eventData.startTime,
                hor_fin_eve: eventData.endTime,
                dur_eve: eventData.duration,
                are_eve: eventData.area,
                ubi_eve: eventData.location,
                capacidad_max_eve: eventData.maxCapacity,
                es_gratuito: eventData.isFree,
                precio: eventData.price,
                porcentaje_asistencia_aprobacion: eventData.attendanceApprovalPercentage,
                estado: eventData.status,
                requiere_carta_motivacion: eventData.requiresMotivationLetter,
            },
            include: {
                categoria: true,
                organizador: true,
                eventosPorCarrera: {
                    include: {
                        carrera: true,
                    },
                },
            },
        });
        // Actualizar asociaciones con carreras si se especifican
        if (eventData.associatedCareers !== undefined) {
            await this.prisma.eventoPorCarrera.deleteMany({
                where: { id_eve_per: id },
            });
            if (eventData.associatedCareers.length > 0) {
                await this.prisma.eventoPorCarrera.createMany({
                    data: eventData.associatedCareers.map((carreraId) => ({
                        id_eve_per: id,
                        id_car_per: carreraId,
                    })),
                });
            }
        }
        return this.mapToEventData(evento);
    }
    async delete(id) {
        // Eliminar asociaciones con carreras primero
        await this.prisma.eventoPorCarrera.deleteMany({
            where: { id_eve_per: id },
        });
        await this.prisma.evento.delete({
            where: { id_eve: id },
        });
    }
    async findByCategory(categoryId) {
        const eventos = await this.prisma.evento.findMany({
            where: { id_cat_eve: categoryId },
            include: {
                categoria: true,
                organizador: true,
                eventosPorCarrera: {
                    include: {
                        carrera: true,
                    },
                },
            },
        });
        return eventos.map((evento) => this.mapToEventData(evento));
    }
    async findByOrganizer(organizerId) {
        const eventos = await this.prisma.evento.findMany({
            where: { ced_org_eve: organizerId },
            include: {
                categoria: true,
                organizador: true,
                eventosPorCarrera: {
                    include: {
                        carrera: true,
                    },
                },
            },
        });
        return eventos.map((evento) => this.mapToEventData(evento));
    }
    async findByStatus(status) {
        const eventos = await this.prisma.evento.findMany({
            where: { estado: status },
            include: {
                categoria: true,
                organizador: true,
                eventosPorCarrera: {
                    include: {
                        carrera: true,
                    },
                },
            },
        });
        return eventos.map((evento) => this.mapToEventData(evento));
    }
    async findUpcoming(days) {
        const now = new Date();
        const futureDate = days
            ? new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
            : null;
        const whereClause = {
            fec_ini_eve: {
                gte: now,
            },
        };
        if (futureDate) {
            whereClause.fec_ini_eve.lte = futureDate;
        }
        const eventos = await this.prisma.evento.findMany({
            where: whereClause,
            include: {
                categoria: true,
                organizador: true,
                eventosPorCarrera: {
                    include: {
                        carrera: true,
                    },
                },
            },
            orderBy: {
                fec_ini_eve: "asc",
            },
        });
        return eventos.map((evento) => this.mapToEventData(evento));
    }
    async getEnrollmentCount(eventId) {
        return await this.prisma.inscripcion.count({
            where: {
                id_eve_ins: eventId,
            },
        });
    }
    async findByArea(area) {
        const eventos = await this.prisma.evento.findMany({
            where: { are_eve: area },
            include: {
                categoria: true,
                organizador: true,
                eventosPorCarrera: {
                    include: {
                        carrera: true,
                    },
                },
            },
        });
        return eventos.map((evento) => this.mapToEventData(evento));
    }
    mapToEventData(evento) {
        return {
            id: evento.id_eve,
            name: evento.nom_eve,
            description: evento.des_eve,
            categoryId: evento.id_cat_eve,
            startDate: evento.fec_ini_eve,
            endDate: evento.fec_fin_eve || undefined,
            startTime: evento.hor_ini_eve,
            endTime: evento.hor_fin_eve || undefined,
            duration: evento.dur_eve,
            area: evento.are_eve,
            location: evento.ubi_eve,
            organizerId: evento.ced_org_eve,
            maxCapacity: evento.capacidad_max_eve,
            audienceType: evento.tipo_audiencia_eve,
            isFree: evento.es_gratuito,
            price: evento.precio ? parseFloat(evento.precio.toString()) : undefined,
            attendanceApprovalPercentage: evento.porcentaje_asistencia_aprobacion,
            status: evento.estado,
            requiresMotivationLetter: evento.requiere_carta_motivacion,
            associatedCareers: evento.eventosPorCarrera?.map((epc) => epc.id_car_per) || [],
        };
    }
}
exports.PrismaEventRepository = PrismaEventRepository;
//# sourceMappingURL=PrismaEventRepository.js.map