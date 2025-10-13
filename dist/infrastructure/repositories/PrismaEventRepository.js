"use strict";
/**
 * Event Repository Implementation - Infrastructure Layer
 *
 * ✅ SRP: Responsabilidad única - Persistencia de datos de eventos
 * Implementación básica que funciona con EventData del dominio
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
                nom_eve: eventData.nom_eve,
                des_eve: eventData.des_eve,
                id_cat_eve: eventData.id_cat_eve.toString(),
                fec_ini_eve: eventData.fec_ini_eve,
                fec_fin_eve: eventData.fec_fin_eve || undefined,
                hor_ini_eve: eventData.hor_ini_eve,
                hor_fin_eve: eventData.hor_fin_eve || undefined,
                dur_eve: eventData.dur_eve,
                are_eve: eventData.are_eve,
                ubi_eve: eventData.ubi_eve,
                ced_org_eve: eventData.ced_org_eve,
                capacidad_max_eve: eventData.capacidad_max_eve,
                tipo_audiencia_eve: eventData.tipo_audiencia_eve,
                es_gratuito: eventData.es_gratuito,
                precio: eventData.precio || 0,
                porcentaje_asistencia_aprobacion: eventData.porcentaje_asistencia_aprobacion,
                estado: eventData.estado_eve || "ACTIVO",
            },
        });
        return this.mapToEventData(evento);
    }
    async findById(id) {
        const evento = await this.prisma.evento.findUnique({
            where: { id_eve: id },
        });
        return evento ? this.mapToEventData(evento) : null;
    }
    async findAll() {
        const eventos = await this.prisma.evento.findMany({
            orderBy: { fec_ini_eve: "desc" },
        });
        return eventos.map((evento) => this.mapToEventData(evento));
    }
    async update(id, eventData) {
        const updateData = {};
        if (eventData.nom_eve !== undefined)
            updateData.nom_eve = eventData.nom_eve;
        if (eventData.des_eve !== undefined)
            updateData.des_eve = eventData.des_eve;
        if (eventData.capacidad_max_eve !== undefined)
            updateData.capacidad_max_eve = eventData.capacidad_max_eve;
        if (eventData.precio !== undefined)
            updateData.precio = eventData.precio;
        if (eventData.estado_eve !== undefined)
            updateData.estado = eventData.estado_eve;
        const evento = await this.prisma.evento.update({
            where: { id_eve: id },
            data: updateData,
        });
        return this.mapToEventData(evento);
    }
    async delete(id) {
        await this.prisma.evento.delete({
            where: { id_eve: id },
        });
    }
    async findByCategory(categoryId) {
        const eventos = await this.prisma.evento.findMany({
            where: { id_cat_eve: categoryId.toString() },
        });
        return eventos.map((evento) => this.mapToEventData(evento));
    }
    async findByOrganizer(organizerId) {
        const eventos = await this.prisma.evento.findMany({
            where: { ced_org_eve: organizerId },
        });
        return eventos.map((evento) => this.mapToEventData(evento));
    }
    mapToEventData(prismaEvent) {
        return {
            id: prismaEvent.id_eve,
            nom_eve: prismaEvent.nom_eve,
            des_eve: prismaEvent.des_eve,
            id_cat_eve: parseInt(prismaEvent.id_cat_eve),
            fec_ini_eve: prismaEvent.fec_ini_eve,
            fec_fin_eve: prismaEvent.fec_fin_eve,
            hor_ini_eve: prismaEvent.hor_ini_eve,
            hor_fin_eve: prismaEvent.hor_fin_eve,
            dur_eve: prismaEvent.dur_eve,
            are_eve: prismaEvent.are_eve,
            ubi_eve: prismaEvent.ubi_eve,
            ced_org_eve: prismaEvent.ced_org_eve,
            capacidad_max_eve: prismaEvent.capacidad_max_eve,
            tipo_audiencia_eve: prismaEvent.tipo_audiencia_eve,
            es_gratuito: prismaEvent.es_gratuito,
            precio: prismaEvent.precio,
            porcentaje_asistencia_aprobacion: prismaEvent.porcentaje_asistencia_aprobacion,
            estado_eve: prismaEvent.estado,
            fecha_creacion: prismaEvent.fecha_creacion,
            fecha_actualizacion: prismaEvent.fecha_actualizacion,
        };
    }
}
exports.PrismaEventRepository = PrismaEventRepository;
//# sourceMappingURL=PrismaEventRepository.js.map