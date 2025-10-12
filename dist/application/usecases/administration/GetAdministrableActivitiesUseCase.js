"use strict";
/**
 * Get Administrable Activities Use Case
 *
 * Caso de uso para obtener eventos y cursos administrables
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAdministrableActivitiesUseCase = void 0;
class GetAdministrableActivitiesUseCase {
    constructor(eventRepo, courseRepo) {
        this.eventRepo = eventRepo;
        this.courseRepo = courseRepo;
    }
    async execute(request) {
        try {
            // Validar entrada
            this.validateRequest(request);
            // Configurar valores por defecto
            const filters = {
                includeEvents: request.includeEvents !== false,
                includeCourses: request.includeCourses !== false,
                onlyActive: request.onlyActive !== false,
                organizerId: request.organizerId,
                categoryId: request.categoryId,
                searchTerm: request.searchTerm?.trim(),
                dateFrom: request.dateFrom,
                dateTo: request.dateTo,
                page: request.page || 1,
                pageSize: Math.min(request.pageSize || 20, 100), // Límite máximo de 100
            };
            // Obtener datos en paralelo
            const [events, courses, eventCount, courseCount] = await Promise.all([
                filters.includeEvents
                    ? this.eventRepo.findAdministrable(filters)
                    : Promise.resolve([]),
                filters.includeCourses
                    ? this.courseRepo.findAdministrable(filters)
                    : Promise.resolve([]),
                filters.includeEvents
                    ? this.eventRepo.countAdministrable(filters)
                    : Promise.resolve(0),
                filters.includeCourses
                    ? this.courseRepo.countAdministrable(filters)
                    : Promise.resolve(0),
            ]);
            // Calcular estadísticas
            const summary = this.calculateSummary(events, courses);
            // Calcular paginación
            const totalItems = eventCount + courseCount;
            const totalPages = Math.ceil(totalItems / filters.pageSize);
            const pagination = {
                currentPage: filters.page,
                totalPages,
                totalItems,
                hasNext: filters.page < totalPages,
                hasPrevious: filters.page > 1,
            };
            return {
                events,
                courses,
                summary,
                pagination,
                success: true,
                message: `Found ${events.length} events and ${courses.length} courses`,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            return {
                events: [],
                courses: [],
                summary: {
                    totalEvents: 0,
                    totalCourses: 0,
                    totalInscriptions: 0,
                    totalRevenue: 0,
                    pendingInscriptions: 0,
                },
                pagination: {
                    currentPage: 1,
                    totalPages: 0,
                    totalItems: 0,
                    hasNext: false,
                    hasPrevious: false,
                },
                success: false,
                message: `Error retrieving administrable activities: ${errorMessage}`,
            };
        }
    }
    validateRequest(request) {
        if (request.page && request.page < 1) {
            throw new Error("Page number must be greater than 0");
        }
        if (request.pageSize && (request.pageSize < 1 || request.pageSize > 100)) {
            throw new Error("Page size must be between 1 and 100");
        }
        if (request.dateFrom &&
            request.dateTo &&
            request.dateFrom > request.dateTo) {
            throw new Error("Date from cannot be after date to");
        }
        if (request.searchTerm && request.searchTerm.length > 100) {
            throw new Error("Search term cannot exceed 100 characters");
        }
    }
    calculateSummary(events, courses) {
        const totalEvents = events.length;
        const totalCourses = courses.length;
        const eventStats = events.reduce((acc, event) => {
            const stats = event.getStatistics();
            return {
                inscriptions: acc.inscriptions + stats.totalInscriptions,
                revenue: acc.revenue + event.getTotalRevenue(),
                pending: acc.pending + stats.pendingInscriptions,
            };
        }, { inscriptions: 0, revenue: 0, pending: 0 });
        const courseStats = courses.reduce((acc, course) => {
            const stats = course.getStatistics();
            return {
                inscriptions: acc.inscriptions + stats.totalInscriptions,
                revenue: acc.revenue + course.getTotalRevenue(),
                pending: acc.pending + stats.pendingInscriptions,
            };
        }, { inscriptions: 0, revenue: 0, pending: 0 });
        return {
            totalEvents,
            totalCourses,
            totalInscriptions: eventStats.inscriptions + courseStats.inscriptions,
            totalRevenue: eventStats.revenue + courseStats.revenue,
            pendingInscriptions: eventStats.pending + courseStats.pending,
        };
    }
}
exports.GetAdministrableActivitiesUseCase = GetAdministrableActivitiesUseCase;
//# sourceMappingURL=GetAdministrableActivitiesUseCase.js.map