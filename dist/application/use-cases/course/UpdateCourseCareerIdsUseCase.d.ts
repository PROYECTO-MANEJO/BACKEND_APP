/**
 * UpdateCourseCareerIdsUseCase - Application Layer
 *
 * Caso de uso para actualizar las carreras asociadas a un curso.
 */
import { CourseData } from "../../../domain/entities/Course";
import { CourseManagementService } from "../../../domain/services/CourseManagementService";
export interface UpdateCourseCareerIdsRequest {
    courseId: string;
    careerIds: number[];
    organizerId: string;
}
export interface UpdateCourseCareerIdsResponse {
    success: boolean;
    course?: CourseData;
    message?: string;
    error?: string;
}
export declare class UpdateCourseCareerIdsUseCase {
    private courseManagementService;
    constructor(courseManagementService: CourseManagementService);
    execute(request: UpdateCourseCareerIdsRequest): Promise<UpdateCourseCareerIdsResponse>;
}
//# sourceMappingURL=UpdateCourseCareerIdsUseCase.d.ts.map