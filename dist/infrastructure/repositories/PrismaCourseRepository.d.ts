/**
 * Course Repository Implementation - Infrastructure Layer
 *
 * Implementación simplificada que funciona con el esquema Prisma real
 * Maneja operaciones básicas de cursos según la estructura existente
 */
import { PrismaClient } from "@prisma/client";
export interface CourseData {
    id?: string;
    name: string;
    description: string;
    duration: number;
    startDate: Date;
    endDate: Date;
    categoryId: string;
    organizerId: string;
    maxCapacity: number;
    audienceType: string;
    requiresDocumentVerification?: boolean;
    isFree: boolean;
    price?: number;
    attendanceApprovalPercentage: number;
    minimumGradeApproval: number;
    status?: string;
    requiresMotivationLetter?: boolean;
    associatedCareers?: string[];
}
export declare class PrismaCourseRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(courseData: CourseData): Promise<CourseData>;
    findById(id: string): Promise<CourseData | null>;
    findAll(): Promise<CourseData[]>;
    update(id: string, courseData: Partial<CourseData>): Promise<CourseData>;
    delete(id: string): Promise<void>;
    findByCategory(categoryId: string): Promise<CourseData[]>;
    findByOrganizer(organizerId: string): Promise<CourseData[]>;
    findByStatus(status: string): Promise<CourseData[]>;
    getEnrollmentCount(courseId: string): Promise<number>;
    private mapToCourseData;
}
//# sourceMappingURL=PrismaCourseRepository.d.ts.map