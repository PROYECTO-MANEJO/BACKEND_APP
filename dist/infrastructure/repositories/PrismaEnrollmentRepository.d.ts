/**
 * Enrollment Repository Implementation - Infrastructure Layer
 *
 * Implementación para inscripciones tanto de eventos como de cursos
 * Maneja operaciones básicas según el esquema Prisma real
 */
import { PrismaClient } from "@prisma/client";
export interface EnrollmentData {
    id?: string;
    enrollmentDate: Date;
    value?: number;
    paymentMethod?: string;
    paymentOrderLink?: string;
    paymentProof?: Buffer;
    proofFilename?: string;
    proofSize?: number;
    proofUploadDate?: Date;
    userId: string;
    eventId?: string;
    courseId?: string;
    paymentStatus?: string;
    approvingAdminId?: string;
    approvalDate?: Date;
    motivationLetter?: string;
}
export declare class PrismaEnrollmentRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    createEventEnrollment(enrollmentData: EnrollmentData): Promise<EnrollmentData>;
    createCourseEnrollment(enrollmentData: EnrollmentData): Promise<EnrollmentData>;
    findEventEnrollmentById(id: string): Promise<EnrollmentData | null>;
    findCourseEnrollmentById(id: string): Promise<EnrollmentData | null>;
    findEventEnrollmentsByUser(userId: string): Promise<EnrollmentData[]>;
    findCourseEnrollmentsByUser(userId: string): Promise<EnrollmentData[]>;
    findEventEnrollmentsByEvent(eventId: string): Promise<EnrollmentData[]>;
    findCourseEnrollmentsByCourse(courseId: string): Promise<EnrollmentData[]>;
    findEnrollmentsByPaymentStatus(status: string, type: "event" | "course"): Promise<EnrollmentData[]>;
    updateEventEnrollment(id: string, enrollmentData: Partial<EnrollmentData>): Promise<EnrollmentData>;
    updateCourseEnrollment(id: string, enrollmentData: Partial<EnrollmentData>): Promise<EnrollmentData>;
    deleteEventEnrollment(id: string): Promise<void>;
    deleteCourseEnrollment(id: string): Promise<void>;
    private mapToEnrollmentData;
}
//# sourceMappingURL=PrismaEnrollmentRepository.d.ts.map