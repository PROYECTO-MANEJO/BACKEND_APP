"use strict";
/**
 * GetAllEventsUseCase - Application Layer
 *
 * Caso de uso para obtener todos los eventos con filtros opcionales
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllEventsUseCase = void 0;
class GetAllEventsUseCase {
    constructor(eventManagementService) {
        this.eventManagementService = eventManagementService;
    }
    async execute(request = {}) {
        try {
            // Preparar filtros
            const filters = {};
            if (request.estado)
                filters.estado = request.estado;
            if (request.categoria)
                filters.categoria = request.categoria;
            if (request.fechaDesde)
                filters.fechaDesde = new Date(request.fechaDesde);
            if (request.fechaHasta)
                filters.fechaHasta = new Date(request.fechaHasta);
            if (request.esGratuito !== undefined)
                filters.esGratuito = request.esGratuito;
            if (request.tipoAudiencia)
                filters.tipoAudiencia = request.tipoAudiencia;
            if (request.organizador)
                filters.organizador = request.organizador;
            if (request.busqueda)
                filters.busqueda = request.busqueda;
            // Determinar si usar paginación
            const usePagination = request.page !== undefined || request.limit !== undefined;
            if (usePagination) {
                const page = request.page || 1;
                const limit = request.limit || 10;
                const result = await this.eventManagementService.getEventsPaginated(page, limit, filters);
                return {
                    success: true,
                    message: "Eventos obtenidos exitosamente",
                    data: {
                        events: result.events.map((event) => this.formatEventForResponse(event)),
                        pagination: {
                            total: result.total,
                            totalPages: result.totalPages,
                            currentPage: result.currentPage,
                            hasNextPage: result.currentPage < result.totalPages,
                            hasPrevPage: result.currentPage > 1,
                        },
                    },
                };
            }
            else {
                const events = await this.eventManagementService.getAllEvents(filters);
                return {
                    success: true,
                    message: "Eventos obtenidos exitosamente",
                    data: {
                        events: events.map((event) => this.formatEventForResponse(event)),
                    },
                };
            }
        }
        catch (error) {
            return {
                success: false,
                message: "Error al obtener los eventos",
                error: error.message,
            };
        }
    }
    formatEventForResponse(event) {
        return {
            id: event.id,
            nom_eve: event.nom_eve,
            des_eve: event.des_eve,
            id_cat_eve: event.id_cat_eve,
            fec_ini_eve: event.fec_ini_eve.toISOString().split("T")[0], // YYYY-MM-DD
            fec_fin_eve: event.fec_fin_eve
                ? event.fec_fin_eve.toISOString().split("T")[0]
                : null,
            hor_ini_eve: this.formatTimeFromDate(event.hor_ini_eve),
            hor_fin_eve: event.hor_fin_eve
                ? this.formatTimeFromDate(event.hor_fin_eve)
                : null,
            dur_eve: event.dur_eve,
            are_eve: event.are_eve,
            ubi_eve: event.ubi_eve,
            ced_org_eve: event.ced_org_eve,
            capacidad_max_eve: event.capacidad_max_eve,
            tipo_audiencia_eve: event.tipo_audiencia_eve,
            es_gratuito: event.es_gratuito,
            precio: event.precio,
            porcentaje_asistencia_aprobacion: event.porcentaje_asistencia_aprobacion,
            estado_eve: event.estado_eve,
            fecha_creacion: event.fecha_creacion,
            fecha_actualizacion: event.fecha_actualizacion,
            // Campos calculados
            isActive: event.isActive(),
            isUpcoming: event.isUpcoming(),
            isInProgress: event.isInProgress(),
            isFinished: event.isFinished(),
        };
    }
    formatTimeFromDate(date) {
        const hours = date.getUTCHours().toString().padStart(2, "0");
        const minutes = date.getUTCMinutes().toString().padStart(2, "0");
        const seconds = date.getUTCSeconds().toString().padStart(2, "0");
        return `${hours}:${minutes}:${seconds}`;
    }
}
exports.GetAllEventsUseCase = GetAllEventsUseCase;
//# sourceMappingURL=GetAllEventsUseCase.js.map