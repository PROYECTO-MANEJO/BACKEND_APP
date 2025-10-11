/**
 * CloseCourseUseCase - Application Layer
 *
 * Caso de uso para cerrar un curso y generar certificados.
 */
import { CourseData } from '../../../domain/entities/Course';
import { CourseManagementService } from '../../../domain/services/CourseManagementService';
export interface CloseCourseRequest {
    courseId: string;
    organizerId: string;
}
export interface CloseCourseResponse {
    success: boolean;
    course?: CourseData;
    message?: string;
    certificatesGenerated?: {
        total: number;
        successful: number;
        failed: number;
    };
    error?: string;
}
export declare class CloseCourseUseCase {
    private courseManagementService;
    constructor(courseManagementService: CourseManagementService);
    execute(request: CloseCourseRequest): Promise<CloseCourseResponse>;
}
//# sourceMappingURL=CloseCourseUseCase.d.ts.map