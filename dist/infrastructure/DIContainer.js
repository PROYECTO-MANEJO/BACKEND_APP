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
/**
 * SOLID Dependency Injection Container
 * Implementa DIP (Dependency Inversion Principle)
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
    // ✅ SOLID: Retorna interfaces, no implementaciones concretas
    getUserRepository() {
        if (!this.userRepository) {
            this.userRepository = new PrismaUserRepository_1.PrismaUserRepository(this.prisma);
        }
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
            generateVerificationJWT: jwtHelper_1.generateVerificationJWT
        };
    }
    // Cleanup method for graceful shutdown
    async cleanup() {
        await this.prisma.$disconnect();
    }
}
exports.DIContainer = DIContainer;
//# sourceMappingURL=DIContainer.js.map