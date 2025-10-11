import { PrismaClient } from "@prisma/client";
import { IUserRepository, ICareerRepository } from "@domain/repositories/IUserRepository";
import { IVerificationTokenRepository } from "@domain/repositories/IVerificationTokenRepository";
import { IEmailService } from "@domain/repositories/IEmailService";
import { IEventRepository, ICategoryRepository } from "@domain/services/EventManagementService";
import { ICourseRepository } from "@domain/repositories/ICourseRepository";
import { IInscriptionRepository } from "@domain/repositories/IInscriptionRepository";
import { CertificateRepository } from "@domain/repositories/CertificateRepository";
import { AuthenticationService } from "@domain/services/AuthenticationService";
import { VerificationService } from "@domain/services/VerificationService";
import { PasswordRecoveryService } from "@domain/services/PasswordRecoveryService";
import { UserManagementService } from "@domain/services/UserManagementService";
import { CareerManagementService } from "@domain/services/CareerManagementService";
import { EventManagementService } from "@domain/services/EventManagementService";
import { CourseManagementService } from "@domain/services/CourseManagementService";
import { InscriptionManagementService } from "@domain/services/InscriptionManagementService";
import { CertificateManagementService } from "@domain/services/CertificateManagementService";
/**
 * Container de Inyección de Dependencias
 * Implementa DIP (Dependency Inversion Principle)
 * Centraliza la creación y configuración de dependencias
 */
export declare class DIContainer {
    private static instance;
    private _prisma;
    private _userRepository;
    private _careerRepository;
    private _eventRepository;
    private _categoryRepository;
    private _courseRepository;
    private _inscriptionRepository;
    private _verificationTokenRepository;
    private _emailService;
    private _certificateRepository;
    private _reportRepository?;
    private _changeRequestRepository?;
    private _pdfGenerationService?;
    private _githubIntegrationService?;
    private _notificationService?;
    private _authenticationService;
    private _verificationService;
    private _passwordRecoveryService;
    private _userManagementService;
    private _careerManagementService;
    private _eventManagementService;
    private _courseManagementService;
    private _inscriptionManagementService;
    private _certificateManagementService;
    private _reportManagementService?;
    private _changeRequestManagementService?;
    private constructor();
    static getInstance(): DIContainer;
    get prisma(): PrismaClient;
    get userRepository(): IUserRepository;
    get careerRepository(): ICareerRepository;
    get eventRepository(): IEventRepository;
    get categoryRepository(): ICategoryRepository;
    get verificationTokenRepository(): IVerificationTokenRepository;
    get emailService(): IEmailService;
    get authenticationService(): AuthenticationService;
    get verificationService(): VerificationService;
    get passwordRecoveryService(): PasswordRecoveryService;
    get userManagementService(): UserManagementService;
    get careerManagementService(): CareerManagementService;
    get eventManagementService(): EventManagementService;
    get courseRepository(): ICourseRepository;
    get courseManagementService(): CourseManagementService;
    get inscriptionRepository(): IInscriptionRepository;
    get inscriptionManagementService(): InscriptionManagementService;
    get certificateRepository(): CertificateRepository;
    get certificateManagementService(): CertificateManagementService;
    dispose(): Promise<void>;
}
//# sourceMappingURL=DIContainer.d.ts.map