/**
 * CourseRepository - Infrastructure Layer
 *
 * Implementación concreta del repositorio de cursos usando Prisma.
 */
import { PrismaClient } from '@prisma/client';
import { Course } from '../../domain/entities/Course';
import { ICourseRepository } from '../../domain/repositories/ICourseRepository';
export declare class CourseRepository implements ICourseRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(course: Course): Promise<Course>;
    findById(id: string): Promise<Course | null>;
    findAll(): Promise<Course[]>;
    update(id: string, course: Course): Promise<Course>;
    delete(id: string): Promise<void>;
    findByOrganizer(organizerId: string): Promise<Course[]>;
    findByCategory(categoryId: number): Promise<Course[]>;
    findByStatus(status: string): Promise<Course[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<Course[]>;
    findAvailableCourses(userId?: string): Promise<Course[]>;
    findUserCourses(userId: string): Promise<Course[]>;
    findActiveByDateRange(startDate: Date, endDate: Date): Promise<Course[]>;
    findUpcomingCourses(): Promise<Course[]>;
    findInProgressCourses(): Promise<Course[]>;
    findFinishedCourses(): Promise<Course[]>;
    getEnrolledCount(courseId: string): Promise<number>;
    isUserEnrolled(courseId: string, userId: string): Promise<boolean>;
    hasAvailableCapacity(courseId: string): Promise<boolean>;
    getEnrolledUsers(courseId: string): Promise<any[]>;
    getCourseCareerIds(courseId: string): Promise<number[]>;
    updateCourseCareerIds(courseId: string, careerIds: number[]): Promise<void>;
    findByCareerIds(careerIds: number[]): Promise<Course[]>;
    findConflictingCourses(organizerId: string, startDate: Date, endDate: Date, excludeCourseId?: string): Promise<Course[]>;
    existsById(id: string): Promise<boolean>;
    countByOrganizer(organizerId: string): Promise<number>;
    countByCategory(categoryId: number): Promise<number>;
    findAllPaginated(page: number, limit: number): Promise<{
        courses: Course[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findByOrganizerPaginated(organizerId: string, page: number, limit: number): Promise<{
        courses: Course[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findWithFilters(filters: {
        organizerId?: string;
        categoryId?: number;
        status?: string;
        audienceType?: string;
        isFree?: boolean;
        startDate?: Date;
        endDate?: Date;
        searchTerm?: string;
    }): Promise<Course[]>;
    getStatistics(): Promise<{
        totalCourses: number;
        activeCourses: number;
        finishedCourses: number;
        totalEnrollments: number;
        averageCapacityUsage: number;
    }>;
    getCourseStatistics(courseId: string): Promise<{
        enrolledCount: number;
        completedCount?: number;
        averageAttendance?: number;
        averageGrade?: number;
    }>;
    private toDomainEntity;
}
//# sourceMappingURL=CourseRepository.d.ts.map