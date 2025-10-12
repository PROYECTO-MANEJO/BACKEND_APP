/**
 * Get Administrable Activities Use Case
 *
 * Caso de uso para obtener eventos y cursos administrables
 */
import { EventAdministration } from "../../../domain/entities/administration/EventAdministration";
import { CourseAdministration } from "../../../domain/entities/administration/CourseAdministration";
export interface GetAdministrableActivitiesRequest {
    includeEvents?: boolean;
    includeCourses?: boolean;
    onlyActive?: boolean;
    organizerId?: string;
    categoryId?: string;
    searchTerm?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    pageSize?: number;
}
export interface GetAdministrableActivitiesResponse {
    events: EventAdministration[];
    courses: CourseAdministration[];
    summary: {
        totalEvents: number;
        totalCourses: number;
        totalInscriptions: number;
        totalRevenue: number;
        pendingInscriptions: number;
    };
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
    success: boolean;
    message: string;
}
export interface IEventAdministrationRepository {
    findAdministrable(filters: GetAdministrableActivitiesRequest): Promise<EventAdministration[]>;
    countAdministrable(filters: GetAdministrableActivitiesRequest): Promise<number>;
    findById(id: string): Promise<EventAdministration | null>;
    update(eventAdmin: EventAdministration): Promise<EventAdministration>;
}
export interface ICourseAdministrationRepository {
    findAdministrable(filters: GetAdministrableActivitiesRequest): Promise<CourseAdministration[]>;
    countAdministrable(filters: GetAdministrableActivitiesRequest): Promise<number>;
    findById(id: string): Promise<CourseAdministration | null>;
    update(courseAdmin: CourseAdministration): Promise<CourseAdministration>;
}
export declare class GetAdministrableActivitiesUseCase {
    private eventRepo;
    private courseRepo;
    constructor(eventRepo: IEventAdministrationRepository, courseRepo: ICourseAdministrationRepository);
    execute(request: GetAdministrableActivitiesRequest): Promise<GetAdministrableActivitiesResponse>;
    private validateRequest;
    private calculateSummary;
}
//# sourceMappingURL=GetAdministrableActivitiesUseCase.d.ts.map