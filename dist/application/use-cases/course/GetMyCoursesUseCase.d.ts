/**
 * GetMyCoursesUseCase - Application Layer
 *
 * Caso de uso para obtener los cursos de un usuario específico.
 */
import { CourseData } from '../../../domain/entities/Course';
import { CourseManagementService } from '../../../domain/services/CourseManagementService';
export interface GetMyCoursesRequest {
    userId: string;
    status?: 'upcoming' | 'in-progress' | 'finished' | 'all';
}
export interface GetMyCoursesResponse {
    success: boolean;
    courses?: CourseData[];
    statistics?: {
        upcoming: number;
        inProgress: number;
        finished: number;
        total: number;
    };
    error?: string;
}
export declare class GetMyCoursesUseCase {
    private courseManagementService;
    constructor(courseManagementService: CourseManagementService);
    execute(request: GetMyCoursesRequest): Promise<GetMyCoursesResponse>;
}
//# sourceMappingURL=GetMyCoursesUseCase.d.ts.map