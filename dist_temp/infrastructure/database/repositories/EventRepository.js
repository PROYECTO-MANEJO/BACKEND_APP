"use strict";
/**
 * EventRepository - Infrastructure Layer
 *
 * Implementación del repositorio de eventos usando Prisma ORM
 * para operaciones de persistencia de datos.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRepository = void 0;
const Event_1 = require("../../../domain/entities/Event");
class EventRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // ✅ ENCONTRAR TODOS LOS EVENTOS CON FILTROS
    async findAll(filters) {
        const whereClause = this.buildWhereClause(filters);
        const events = await this.prisma.evento.findMany({
            where: whereClause,
            orderBy: [{ fec_ini_eve: "desc" }],
        });
        return events.map((event) => this.toDomainEntity(event));
    }
    // ✅ ENCONTRAR EVENTO POR ID
    async findById(id) {
        const event = await this.prisma.evento.findUnique({
            where: { id_eve: id },
        });
        return event ? this.toDomainEntity(event) : null;
    }
    // ✅ ENCONTRAR EVENTOS POR ORGANIZADOR
    async findByOrganizer(cedOrganizador, filters) {
        const whereClause = {
            ...this.buildWhereClause(filters),
            ced_org_eve: cedOrganizador,
        };
        const events = await this.prisma.evento.findMany({
            where: whereClause,
            orderBy: [{ fec_ini_eve: "desc" }],
        });
        return events.map((event) => this.toDomainEntity(event));
    }
    // ✅ ENCONTRAR EVENTOS DISPONIBLES PARA INSCRIPCIÓN
    async findAvailableEvents(filters) {
        const whereClause = {
            ...this.buildWhereClause(filters),
            estado: "ACTIVO",
            fec_ini_eve: {
                gt: new Date(),
            },
        };
        const events = await this.prisma.evento.findMany({
            where: whereClause,
            orderBy: [{ fec_ini_eve: "asc" }],
        });
        return events.map((event) => this.toDomainEntity(event));
    }
    // ✅ ENCONTRAR EVENTOS DEL USUARIO (simplificado - requerirá implementación de participaciones)
    async findUserEvents(cedUsuario, filters) {
        // Por ahora devolver array vacío - se implementará cuando se tenga la tabla de participaciones
        return [];
    }
    // ✅ CREAR EVENTO
    async create(event) {
        const eventData = event.toPlainObject();
        const createdEvent = await this.prisma.evento.create({
            data: {
                nom_eve: eventData.nom_eve,
                des_eve: eventData.des_eve,
                id_cat_eve: eventData.id_cat_eve.toString(),
                fec_ini_eve: eventData.fec_ini_eve,
                fec_fin_eve: eventData.fec_fin_eve,
                hor_ini_eve: eventData.hor_ini_eve,
                hor_fin_eve: eventData.hor_fin_eve,
                dur_eve: eventData.dur_eve,
                are_eve: eventData.are_eve, // Cast to enum
                ubi_eve: eventData.ubi_eve,
                ced_org_eve: eventData.ced_org_eve,
                capacidad_max_eve: eventData.capacidad_max_eve,
                tipo_audiencia_eve: eventData.tipo_audiencia_eve, // Cast to enum
                es_gratuito: eventData.es_gratuito,
                precio: eventData.precio
                    ? parseFloat(eventData.precio.toString())
                    : null,
                porcentaje_asistencia_aprobacion: eventData.porcentaje_asistencia_aprobacion,
                estado: eventData.estado_eve || "ACTIVO",
            },
        });
        return this.toDomainEntity(createdEvent);
    }
    // ✅ ACTUALIZAR EVENTO
    async update(id, event) {
        const eventData = event.toPlainObject();
        const updatedEvent = await this.prisma.evento.update({
            where: { id_eve: id },
            data: {
                nom_eve: eventData.nom_eve,
                des_eve: eventData.des_eve,
                capacidad_max_eve: eventData.capacidad_max_eve,
                precio: eventData.precio
                    ? parseFloat(eventData.precio.toString())
                    : null,
                are_eve: eventData.are_eve,
                ubi_eve: eventData.ubi_eve,
                estado: eventData.estado_eve,
            },
        });
        return this.toDomainEntity(updatedEvent);
    }
    // ✅ ELIMINAR EVENTO
    async delete(id) {
        try {
            await this.prisma.evento.delete({
                where: { id_eve: id },
            });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    // ✅ VERIFICAR EXISTENCIA POR ID
    async existsById(id) {
        const count = await this.prisma.evento.count({
            where: { id_eve: id },
        });
        return count > 0;
    }
    // ✅ VERIFICAR EXISTENCIA POR NOMBRE
    async existsByName(nombre, excludeId) {
        const whereClause = {
            nom_eve: nombre,
        };
        if (excludeId) {
            whereClause.id_eve = {
                not: excludeId,
            };
        }
        const count = await this.prisma.evento.count({
            where: whereClause,
        });
        return count > 0;
    }
    // ✅ CONTAR EVENTOS
    async count(filters) {
        const whereClause = this.buildWhereClause(filters);
        return await this.prisma.evento.count({
            where: whereClause,
        });
    }
    // ✅ ENCONTRAR EVENTOS PAGINADOS
    async findPaginated(page, limit, filters) {
        const whereClause = this.buildWhereClause(filters);
        const skip = (page - 1) * limit;
        const [events, total] = await Promise.all([
            this.prisma.evento.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: [{ fec_ini_eve: "desc" }],
            }),
            this.prisma.evento.count({ where: whereClause }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            events: events.map((event) => this.toDomainEntity(event)),
            total,
            totalPages,
            currentPage: page,
        };
    }
    // ✅ CONSTRUIR WHERE CLAUSE PARA FILTROS
    buildWhereClause(filters) {
        if (!filters)
            return {};
        const whereClause = {};
        if (filters.estado) {
            whereClause.estado = filters.estado;
        }
        if (filters.categoria) {
            whereClause.id_cat_eve = filters.categoria.toString();
        }
        if (filters.fechaDesde || filters.fechaHasta) {
            whereClause.fec_ini_eve = {};
            if (filters.fechaDesde) {
                whereClause.fec_ini_eve.gte = filters.fechaDesde;
            }
            if (filters.fechaHasta) {
                whereClause.fec_ini_eve.lte = filters.fechaHasta;
            }
        }
        if (filters.esGratuito !== undefined) {
            whereClause.es_gratuito = filters.esGratuito;
        }
        if (filters.organizador) {
            whereClause.ced_org_eve = filters.organizador;
        }
        if (filters.busqueda) {
            whereClause.OR = [
                {
                    nom_eve: {
                        contains: filters.busqueda,
                        mode: "insensitive",
                    },
                },
                {
                    des_eve: {
                        contains: filters.busqueda,
                        mode: "insensitive",
                    },
                },
            ];
        }
        return whereClause;
    }
    // ✅ CONVERTIR DE PRISMA A ENTIDAD DE DOMINIO
    toDomainEntity(prismaEvent) {
        const eventData = {
            id: prismaEvent.id_eve,
            nom_eve: prismaEvent.nom_eve,
            des_eve: prismaEvent.des_eve,
            id_cat_eve: parseInt(prismaEvent.id_cat_eve), // Convertir a number para el dominio
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
            precio: prismaEvent.precio
                ? parseFloat(prismaEvent.precio.toString())
                : null,
            porcentaje_asistencia_aprobacion: prismaEvent.porcentaje_asistencia_aprobacion,
            estado_eve: prismaEvent.estado,
            fecha_creacion: prismaEvent.fecha_creacion,
            fecha_actualizacion: prismaEvent.fecha_actualizacion,
        };
        return new Event_1.Event(eventData);
    }
}
exports.EventRepository = EventRepository;
