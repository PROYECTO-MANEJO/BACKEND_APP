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
            }
        };
        const courseCategoryRepository = {
            findById: (id) => this._categoryRepository.findById(id),
            existsById: (id) => this._categoryRepository.existsById(id)
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
            }
        };
        // Inicializar servicio de gestión de cursos
        this._courseManagementService = new CourseManagementService_1.CourseManagementService(this._courseRepository, courseCategoryRepository, courseUserRepository, courseCareerRepository);
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
    async dispose() {
        await this._prisma.$disconnect();
    }
}
exports.DIContainer = DIContainer;
//# sourceMappingURL=DIContainer.js.map