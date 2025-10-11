"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIContainer = void 0;
const client_1 = require("@prisma/client");
// Repositories Implementations
const UserRepository_1 = require("../database/repositories/UserRepository");
const VerificationTokenRepository_1 = require("../database/repositories/VerificationTokenRepository");
const CareerRepository_1 = require("../database/repositories/CareerRepository");
const EventRepository_1 = require("../database/repositories/EventRepository");
const CategoryRepository_1 = require("../database/repositories/CategoryRepository");
const CourseRepository_1 = require("../repositories/CourseRepository");
const InscriptionRepository_1 = require("../repositories/InscriptionRepository");
// Phase 7 - Infrastructure Implementations
const PrismaCertificateRepository_1 = require("../repositories/PrismaCertificateRepository");
// External Services
const EmailService_1 = require("../external/email/EmailService");
// Domain Services
const AuthenticationService_1 = require("@domain/services/AuthenticationService");
const VerificationService_1 = require("@domain/services/VerificationService");
const PasswordRecoveryService_1 = require("@domain/services/PasswordRecoveryService");
const UserManagementService_1 = require("@domain/services/UserManagementService");
const CareerManagementService_1 = require("@domain/services/CareerManagementService");
const EventManagementService_1 = require("@domain/services/EventManagementService");
const CourseManagementService_1 = require("@domain/services/CourseManagementService");
const InscriptionManagementService_1 = require("@domain/services/InscriptionManagementService");
// Phase 7 - Advanced Features Domain Services
const CertificateManagementService_1 = require("@domain/services/CertificateManagementService");
/**
 * Container de Inyección de Dependencias
 * Implementa DIP (Dependency Inversion Principle)
 * Centraliza la creación y configuración de dependencias
 */
class DIContainer {
    constructor() {
        // Initialize infrastructure
        this._prisma = new client_1.PrismaClient();
        this._userRepository = new UserRepository_1.UserRepository(this._prisma);
        this._careerRepository = new CareerRepository_1.CareerRepository(this._prisma);
        this._eventRepository = new EventRepository_1.EventRepository(this._prisma);
        this._categoryRepository = new CategoryRepository_1.CategoryRepository(this._prisma);
        this._courseRepository = new CourseRepository_1.CourseRepository(this._prisma);
        this._inscriptionRepository = new InscriptionRepository_1.InscriptionRepository(this._prisma);
        this._verificationTokenRepository = new VerificationTokenRepository_1.VerificationTokenRepository(this._prisma);
        this._emailService = new EmailService_1.EmailService();
        // Initialize domain services
        this._authenticationService = new AuthenticationService_1.AuthenticationService();
        this._verificationService = new VerificationService_1.VerificationService(this._userRepository, this._verificationTokenRepository, this._emailService);
        this._passwordRecoveryService = new PasswordRecoveryService_1.PasswordRecoveryService(this._userRepository, this._verificationTokenRepository, this._emailService);
        this._userManagementService = new UserManagementService_1.UserManagementService(this._userRepository, this._careerRepository);
        this._careerManagementService = new CareerManagementService_1.CareerManagementService(this._careerRepository);
        // Adaptador para IEventUserRepository
        const eventUserRepository = {
            existsByCedula: async (cedula) => {
                const user = await this._userRepository.findByCedula(cedula);
                return user !== null;
            },
            findByCedula: (cedula) => this._userRepository.findByCedula(cedula),
            isOrganizer: async (cedula) => {
                // Por ahora todos los usuarios existentes pueden organizar eventos
                // Esto se puede refinar según las reglas de negocio
                const user = await this._userRepository.findByCedula(cedula);
                return user !== null;
            },
        };
        this._eventManagementService = new EventManagementService_1.EventManagementService(this._eventRepository, this._categoryRepository, // Para validar categorías
        eventUserRepository // Adaptador para validar organizadores
        );
        // Adaptadores para CourseManagementService
        const courseUserRepository = {
            findById: (cedula) => this._userRepository.findByCedula(cedula),
            exists: async (cedula) => {
                const user = await this._userRepository.findByCedula(cedula);
                return user !== null;
            },
            findByCareer: async (careerId) => {
                // Implementación simplificada - en el futuro se puede extender
                return [];
            },
        };
        const courseCategoryRepository = {
            findById: (id) => this._categoryRepository.findById(id),
            existsById: (id) => this._categoryRepository.existsById(id),
        };
        const courseCareerRepository = {
            exists: async (id) => {
                return await this._careerRepository.existsAndActive(id);
            },
            findByIds: async (ids) => {
                // Implementación simplificada - retornar array de carreras por IDs
                const careers = [];
                for (const id of ids) {
                    const career = await this._careerRepository.findById(id);
                    if (career)
                        careers.push(career);
                }
                return careers;
            },
        };
        // Inicializar servicio de gestión de cursos
        this._courseManagementService = new CourseManagementService_1.CourseManagementService(this._courseRepository, courseCategoryRepository, courseUserRepository, courseCareerRepository);
        // Adaptadores para InscriptionManagementService
        const inscriptionEventRepository = {
            findById: (id) => this._eventRepository.findById(id),
            hasAvailableCapacity: async (eventId) => {
                // Implementación simplificada - se puede refinar según reglas de negocio
                const event = await this._eventRepository.findById(eventId);
                if (!event)
                    return false;
                // Verificar si el evento tiene cupo disponible
                // Por ahora asumimos que todos los eventos activos tienen cupo
                return event.isActive();
            },
        };
        const inscriptionCourseRepository = {
            findById: (id) => this._courseRepository.findById(id),
            hasAvailableCapacity: async (courseId) => {
                // Implementación simplificada - se puede refinar según reglas de negocio
                const course = await this._courseRepository.findById(courseId);
                if (!course)
                    return false;
                // Verificar si el curso tiene cupo disponible
                // Por ahora asumimos que todos los cursos activos tienen cupo
                return course.isActive();
            },
        };
        const inscriptionUserRepository = {
            findById: async (id) => {
                // Convertir string ID a número si es necesario
                const numericId = parseInt(id);
                if (isNaN(numericId))
                    return null;
                return await this._userRepository.findById(numericId);
            },
            exists: async (id) => {
                const numericId = parseInt(id);
                if (isNaN(numericId))
                    return false;
                const user = await this._userRepository.findById(numericId);
                return user !== null;
            },
        };
        // Inicializar servicio de gestión de inscripciones
        this._inscriptionManagementService = new InscriptionManagementService_1.InscriptionManagementService(this._inscriptionRepository, inscriptionEventRepository, inscriptionCourseRepository, inscriptionUserRepository);
        // Phase 7 - Initialize Advanced Features
        // Initialize repositories
        this._certificateRepository = new PrismaCertificateRepository_1.PrismaCertificateRepository();
        // TODO: Implement these repositories and services for complete Phase 7
        // this._reportRepository = new PrismaReportRepository();
        // this._changeRequestRepository = new PrismaChangeRequestRepository();
        // this._pdfGenerationService = new PDFGenerationServiceImpl();
        // this._githubIntegrationService = new GitHubIntegrationServiceImpl();
        // this._notificationService = new NotificationServiceImpl();
        // Initialize domain services with mock/adapter dependencies
        const mockParticipationRepository = {
            findEventParticipationById: async (id) => null,
            findCourseCompletionById: async (id) => null,
            findEventParticipationByUserAndEvent: async (userId, eventId) => null,
            findCourseCompletionByUserAndCourse: async (userId, courseId) => null,
        };
        const mockPDFGenerator = {
            generateCertificatePDF: async (data, template) => ({
                buffer: Buffer.from("mock pdf content"),
                filePath: `/certificates/cert_${Date.now()}.pdf`,
                fileSize: 1024,
            }),
            verifyCertificatePDF: async (path) => ({ isValid: true }),
            getAvailableTemplates: async () => ["default", "modern", "classic"],
        };
        this._certificateManagementService = new CertificateManagementService_1.CertificateManagementService(this._certificateRepository, mockParticipationRepository, mockPDFGenerator);
        // TODO: Initialize other Phase 7 services when implementations are ready
    }
    static getInstance() {
        if (!DIContainer.instance) {
            DIContainer.instance = new DIContainer();
        }
        return DIContainer.instance;
    }
    // Getters for dependencies
    get prisma() {
        return this._prisma;
    }
    get userRepository() {
        return this._userRepository;
    }
    get careerRepository() {
        return this._careerRepository;
    }
    get eventRepository() {
        return this._eventRepository;
    }
    get categoryRepository() {
        return this._categoryRepository;
    }
    get verificationTokenRepository() {
        return this._verificationTokenRepository;
    }
    get emailService() {
        return this._emailService;
    }
    get authenticationService() {
        return this._authenticationService;
    }
    get verificationService() {
        return this._verificationService;
    }
    get passwordRecoveryService() {
        return this._passwordRecoveryService;
    }
    get userManagementService() {
        return this._userManagementService;
    }
    get careerManagementService() {
        return this._careerManagementService;
    }
    get eventManagementService() {
        return this._eventManagementService;
    }
    get courseRepository() {
        return this._courseRepository;
    }
    get courseManagementService() {
        return this._courseManagementService;
    }
    get inscriptionRepository() {
        return this._inscriptionRepository;
    }
    get inscriptionManagementService() {
        return this._inscriptionManagementService;
    }
    // Phase 7 - Advanced Features Getters
    get certificateRepository() {
        return this._certificateRepository;
    }
    get certificateManagementService() {
        return this._certificateManagementService;
    }
    // TODO: Add getters for other Phase 7 services when implemented
    // public get reportRepository(): ReportRepository {
    //   return this._reportRepository;
    // }
    // public get reportManagementService(): ReportManagementService {
    //   return this._reportManagementService;
    // }
    // public get changeRequestRepository(): ChangeRequestRepository {
    //   return this._changeRequestRepository;
    // }
    // public get changeRequestManagementService(): ChangeRequestManagementService {
    //   return this._changeRequestManagementService;
    // }
    async dispose() {
        await this._prisma.$disconnect();
    }
}
exports.DIContainer = DIContainer;
//# sourceMappingURL=DIContainer.js.map