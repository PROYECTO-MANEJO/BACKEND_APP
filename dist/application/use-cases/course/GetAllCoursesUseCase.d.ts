/**
 * GetAllCoursesUseCase - Application Layer
 *
 * Caso de uso para obtener todos los cursos del sistema.
 */
import { CourseData } from '../../../domain/entities/Course';
import { ICourseRepository } from '../../../domain/repositories/ICourseRepository';
export interface GetAllCoursesRequest {
    page?: number;
    limit?: number;
    organizerId?: string;
    categoryId?: number;
    status?: string;
}
export interface GetAllCoursesResponse {
    success: boolean;
    courses?: CourseData[];
    pagination?: {
        total: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
    error?: string;
}
export declare class GetAllCoursesUseCase {
    private courseRepository;
    constructor(courseRepository: ICourseRepository);
    execute(request?: GetAllCoursesRequest): Promise<GetAllCoursesResponse>;
}
//# sourceMappingURL=GetAllCoursesUseCase.d.ts.map