import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { ICourseRepository } from '../domain/repositories/ICourseRepository';
import { IEventRepository } from '../domain/repositories/IEventRepository';
import { ICertificateRepository } from '../domain/repositories/ICertificateRepository';
import { IEnrollmentRepository } from '../domain/repositories/IEnrollmentRepository';
import { DeveloperRepository } from '../domain/repositories/IDeveloperRepository';
import { ChangeRequestRepository } from '../domain/repositories/IChangeRequestRepository';
/**
 * SOLID Dependency Injection Container
 * Implementa DIP (Dependency Inversion Principle)
 */
export declare class DIContainer {
    private static instance;
    private prisma;
    private userRepository?;
    private courseRepository?;
    private eventRepository?;
    private certificateRepository?;
    private enrollmentRepository?;
    private developerRepository?;
    private changeRequestRepository?;
    private constructor();
    static getInstance(): DIContainer;
    getUserRepository(): IUserRepository;
    getCourseRepository(): ICourseRepository;
    getEventRepository(): IEventRepository;
    getCertificateRepository(): ICertificateRepository;
    getEnrollmentRepository(): IEnrollmentRepository;
    getDeveloperRepository(): DeveloperRepository;
    getChangeRequestRepository(): ChangeRequestRepository;
    getPrismaClient(): PrismaClient;
    getBcrypt(): typeof bcrypt;
    getJwtHelpers(): {
        generateJWT: (id: string) => Promise<string>;
        generateAdminJWT: (id: string) => Promise<string>;
        generateVerificationJWT: (id: string) => Promise<string>;
    };
    cleanup(): Promise<void>;
}
//# sourceMappingURL=DIContainer.d.ts.map