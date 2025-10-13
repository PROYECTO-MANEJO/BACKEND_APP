"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIContainer = void 0;
const tslib_1 = require("tslib");
const client_1 = require("@prisma/client");
const bcrypt_1 = tslib_1.__importDefault(require("bcrypt"));
const jwtHelper_1 = require("./helpers/jwtHelper");
// Importar implementaciones
const PrismaUserRepository_1 = require("./repositories/PrismaUserRepository");
const PrismaCourseRepository_1 = require("./repositories/PrismaCourseRepository");
const PrismaEventRepository_1 = require("./repositories/PrismaEventRepository");
const PrismaCertificateRepository_1 = require("./repositories/PrismaCertificateRepository");
const PrismaEnrollmentRepository_1 = require("./repositories/PrismaEnrollmentRepository");
const PrismaDeveloperRepository_1 = require("./repositories/PrismaDeveloperRepository");
const PrismaChangeRequestRepository_1 = require("./repositories/PrismaChangeRequestRepository");
const PrismaAuthenticationRepository_1 = require("./repositories/PrismaAuthenticationRepository");
const EmailServiceImpl_1 = require("./external/EmailServiceImpl");
// ✅ Nuevas implementaciones
const PrismaOrganizerRepository_1 = require("./repositories/PrismaOrganizerRepository");
const PrismaCategoryRepository_1 = require("./repositories/PrismaCategoryRepository");
const PrismaParticipationRepository_1 = require("./repositories/PrismaParticipationRepository");
const PrismaDocumentRepository_1 = require("./repositories/PrismaDocumentRepository");
const PrismaReportRepository_1 = require("./repositories/PrismaReportRepository");
const PrismaCareerRepository_1 = require("./repositories/PrismaCareerRepository");
const PrismaHomepageRepository_1 = require("./repositories/PrismaHomepageRepository");
/**
 * SOLID Dependency Injection Container
 *
 * ✅ SRP: Single Responsibility Principle - Solo se encarga de crear y gestionar dependencias
 * ✅ OCP: Open/Closed Principle - Abierto para nuevas dependencias, cerrado para modificación
 * ✅ LSP: Liskov Substitution Principle - Devuelve implementaciones que cumplen contratos
 * ✅ ISP: Interface Segregation Principle - Cada método devuelve interfaz específica
 * ✅ DIP: Dependency Inversion Principle - Núcleo del patrón, invierte dependencias
 */
class DIContainer {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    static getInstance() {
        if (!DIContainer.instance) {
            DIContainer.instance = new DIContainer();
        }
        return DIContainer.instance;
    }
    // ✅ DIP: Retorna interfaces, no implementaciones concretas
    // ✅ ISP: Interfaz específica IUserRepository, no interfaz gorda
    // ✅ SRP: Solo se encarga de crear/devolver repositorio de usuarios
    getUserRepository() {
        if (!this.userRepository) {
            // ✅ OCP: Puede cambiar implementación sin afectar clientes
            this.userRepository = new PrismaUserRepository_1.PrismaUserRepository(this.prisma);
        }
        // ✅ LSP: Implementación cumple contrato de IUserRepository
        return this.userRepository;
    }
    getCourseRepository() {
        if (!this.courseRepository) {
            this.courseRepository = new PrismaCourseRepository_1.PrismaCourseRepository(this.prisma);
        }
        return this.courseRepository;
    }
    getEventRepository() {
        if (!this.eventRepository) {
            this.eventRepository = new PrismaEventRepository_1.PrismaEventRepository(this.prisma);
        }
        return this.eventRepository;
    }
    getCertificateRepository() {
        if (!this.certificateRepository) {
            this.certificateRepository = new PrismaCertificateRepository_1.PrismaCertificateRepository(this.prisma);
        }
        return this.certificateRepository;
    }
    getEnrollmentRepository() {
        if (!this.enrollmentRepository) {
            this.enrollmentRepository = new PrismaEnrollmentRepository_1.PrismaEnrollmentRepository(this.prisma);
        }
        return this.enrollmentRepository;
    }
    getDeveloperRepository() {
        if (!this.developerRepository) {
            this.developerRepository = new PrismaDeveloperRepository_1.PrismaDeveloperRepository(this.prisma);
        }
        return this.developerRepository;
    }
    getChangeRequestRepository() {
        if (!this.changeRequestRepository) {
            this.changeRequestRepository = new PrismaChangeRequestRepository_1.PrismaChangeRequestRepository(this.prisma);
        }
        return this.changeRequestRepository;
    }
    getAuthenticationRepository() {
        if (!this.authenticationRepository) {
            this.authenticationRepository = new PrismaAuthenticationRepository_1.PrismaAuthenticationRepository(this.prisma);
        }
        return this.authenticationRepository;
    }
    getEmailService() {
        if (!this.emailService) {
            this.emailService = new EmailServiceImpl_1.EmailServiceImpl();
        }
        return this.emailService;
    }
    // ✅ NUEVOS REPOSITORIOS IMPLEMENTADOS
    getOrganizerRepository() {
        if (!this.organizerRepository) {
            this.organizerRepository = new PrismaOrganizerRepository_1.PrismaOrganizerRepository(this.prisma);
        }
        return this.organizerRepository;
    }
    getCategoryRepository() {
        if (!this.categoryRepository) {
            this.categoryRepository = new PrismaCategoryRepository_1.PrismaCategoryRepository(this.prisma);
        }
        return this.categoryRepository;
    }
    getParticipationRepository() {
        if (!this.participationRepository) {
            this.participationRepository = new PrismaParticipationRepository_1.PrismaParticipationRepository(this.prisma);
        }
        return this.participationRepository;
    }
    getDocumentRepository() {
        if (!this.documentRepository) {
            this.documentRepository = new PrismaDocumentRepository_1.PrismaDocumentRepository(this.prisma);
        }
        return this.documentRepository;
    }
    getReportRepository() {
        if (!this.reportRepository) {
            this.reportRepository = new PrismaReportRepository_1.PrismaReportRepository(this.prisma);
        }
        return this.reportRepository;
    }
    getCareerRepository() {
        if (!this.careerRepository) {
            this.careerRepository = new PrismaCareerRepository_1.PrismaCareerRepository(this.prisma);
        }
        return this.careerRepository;
    }
    getHomepageRepository() {
        if (!this.homepageRepository) {
            this.homepageRepository = new PrismaHomepageRepository_1.PrismaHomepageRepository(this.prisma);
        }
        return this.homepageRepository;
    }
    // ⚠️ LEGACY: Solo para compatibilidad temporal
    getPrismaClient() {
        return this.prisma;
    }
    getBcrypt() {
        return bcrypt_1.default;
    }
    getJwtHelpers() {
        return {
            generateJWT: jwtHelper_1.generateJWT,
            generateAdminJWT: jwtHelper_1.generateAdminJWT,
            generateVerificationJWT: jwtHelper_1.generateVerificationJWT,
        };
    }
    // Cleanup method for graceful shutdown
    async cleanup() {
        await this.prisma.$disconnect();
    }
}
exports.DIContainer = DIContainer;
//# sourceMappingURL=DIContainer.js.map