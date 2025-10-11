/**
 * GetCourseByIdUseCase - Application Layer
 *
 * Caso de uso para obtener un curso específico por su ID.
 */
import { CourseData } from "../../../domain/entities/Course";
import { ICourseRepository } from "../../../domain/repositories/ICourseRepository";
export interface GetCourseByIdRequest {
    courseId: string;
    includeStatistics?: boolean;
}
export interface GetCourseByIdResponse {
    success: boolean;
    course?: CourseData;
    statistics?: {
        enrolledCount: number;
        availableSpots: number;
        capacityPercentage: number;
        canEnroll: boolean;
    };
    error?: string;
}
export declare class GetCourseByIdUseCase {
    private courseRepository;
    constructor(courseRepository: ICourseRepository);
    execute(request: GetCourseByIdRequest): Promise<GetCourseByIdResponse>;
}
//# sourceMappingURL=GetCourseByIdUseCase.d.ts.map