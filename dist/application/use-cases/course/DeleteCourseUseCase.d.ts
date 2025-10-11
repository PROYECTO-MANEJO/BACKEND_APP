/**
 * DeleteCourseUseCase - Application Layer
 *
 * Caso de uso para eliminar un curso del sistema.
 */
import { CourseManagementService } from '../../../domain/services/CourseManagementService';
export interface DeleteCourseRequest {
    courseId: string;
    organizerId: string;
}
export interface DeleteCourseResponse {
    success: boolean;
    message?: string;
    error?: string;
}
export declare class DeleteCourseUseCase {
    private courseManagementService;
    constructor(courseManagementService: CourseManagementService);
    execute(request: DeleteCourseRequest): Promise<DeleteCourseResponse>;
}
//# sourceMappingURL=DeleteCourseUseCase.d.ts.map