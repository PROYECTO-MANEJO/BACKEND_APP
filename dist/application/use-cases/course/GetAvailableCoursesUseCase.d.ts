/**
 * GetAvailableCoursesUseCase - Application Layer
 *
 * Caso de uso para obtener cursos disponibles para inscripción.
 */
import { CourseData } from '../../../domain/entities/Course';
import { CourseManagementService } from '../../../domain/services/CourseManagementService';
export interface GetAvailableCoursesRequest {
    userId?: string;
    categoryId?: number;
    searchTerm?: string;
    isFree?: boolean;
}
export interface GetAvailableCoursesResponse {
    success: boolean;
    courses?: CourseData[];
    error?: string;
}
export declare class GetAvailableCoursesUseCase {
    private courseManagementService;
    constructor(courseManagementService: CourseManagementService);
    execute(request?: GetAvailableCoursesRequest): Promise<GetAvailableCoursesResponse>;
}
//# sourceMappingURL=GetAvailableCoursesUseCase.d.ts.map