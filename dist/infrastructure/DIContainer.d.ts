import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { IUserRepository } from "../domain/repositories/IUserRepository";
import { ICourseRepository } from "../domain/repositories/ICourseRepository";
import { IEventRepository } from "../domain/repositories/IEventRepository";
import { ICertificateRepository } from "../domain/repositories/ICertificateRepository";
import { IEnrollmentRepository } from "../domain/repositories/IEnrollmentRepository";
import { DeveloperRepository } from "../domain/repositories/IDeveloperRepository";
import { ChangeRequestRepository } from "../domain/repositories/IChangeRequestRepository";
import { IAuthenticationRepository } from "../domain/repositories/IAuthenticationRepository";
import { IEmailService } from "../domain/repositories/IEmailService";
import { IOrganizerRepository } from "../domain/repositories/IOrganizerRepository";
import { ICategoryRepository } from "../domain/repositories/ICategoryRepository";
import { IParticipationRepository } from "../domain/repositories/IParticipationRepository";
import { IDocumentRepository } from "../domain/repositories/IDocumentRepository";
import { IReportRepository } from "../domain/repositories/IReportRepository";
import { ICareerRepository } from "../domain/repositories/ICareerRepository";
import { IHomepageRepository } from "../domain/repositories/IHomepageRepository";
/**
 * SOLID Dependency Injection Container
 *
 * ✅ SRP: Single Responsibility Principle - Solo se encarga de crear y gestionar dependencias
 * ✅ OCP: Open/Closed Principle - Abierto para nuevas dependencias, cerrado para modificación
 * ✅ LSP: Liskov Substitution Principle - Devuelve implementaciones que cumplen contratos
 * ✅ ISP: Interface Segregation Principle - Cada método devuelve interfaz específica
 * ✅ DIP: Dependency Inversion Principle - Núcleo del patrón, invierte dependencias
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
    private authenticationRepository?;
    private emailService?;
    private organizerRepository?;
    private categoryRepository?;
    private participationRepository?;
    private documentRepository?;
    private reportRepository?;
    private careerRepository?;
    private homepageRepository?;
    private constructor();
    static getInstance(): DIContainer;
    getUserRepository(): IUserRepository;
    getCourseRepository(): ICourseRepository;
    getEventRepository(): IEventRepository;
    getCertificateRepository(): ICertificateRepository;
    getEnrollmentRepository(): IEnrollmentRepository;
    getDeveloperRepository(): DeveloperRepository;
    getChangeRequestRepository(): ChangeRequestRepository;
    getAuthenticationRepository(): IAuthenticationRepository;
    getEmailService(): IEmailService;
    getOrganizerRepository(): IOrganizerRepository;
    getCategoryRepository(): ICategoryRepository;
    getParticipationRepository(): IParticipationRepository;
    getDocumentRepository(): IDocumentRepository;
    getReportRepository(): IReportRepository;
    getCareerRepository(): ICareerRepository;
    getHomepageRepository(): IHomepageRepository;
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