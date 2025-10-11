import { PrismaClient } from "@prisma/client";

// Repositories Interfaces
import {
  IUserRepository,
  ICareerRepository,
} from "@domain/repositories/IUserRepository";
import { IVerificationTokenRepository } from "@domain/repositories/IVerificationTokenRepository";
import { IEmailService } from "@domain/repositories/IEmailService";
import {
  IEventRepository,
  ICategoryRepository,
  IEventUserRepository,
} from "@domain/services/EventManagementService";

// Repositories Implementations
import { UserRepository } from "../database/repositories/UserRepository";
import { VerificationTokenRepository } from "../database/repositories/VerificationTokenRepository";
import { CareerRepository } from "../database/repositories/CareerRepository";
import { EventRepository } from "../database/repositories/EventRepository";
import { CategoryRepository } from "../database/repositories/CategoryRepository";

// External Services
import { EmailService } from "../external/email/EmailService";

// Domain Services
import { AuthenticationService } from "@domain/services/AuthenticationService";
import { VerificationService } from "@domain/services/VerificationService";
import { PasswordRecoveryService } from "@domain/services/PasswordRecoveryService";
import { UserManagementService } from "@domain/services/UserManagementService";
import { CareerManagementService } from "@domain/services/CareerManagementService";
import { EventManagementService } from "@domain/services/EventManagementService";
/**
 * Container de Inyección de Dependencias
 * Implementa DIP (Dependency Inversion Principle)
 * Centraliza la creación y configuración de dependencias
 */
export class DIContainer {
  private static instance: DIContainer;

  // Infrastructure
  private _prisma: PrismaClient;
  private _userRepository: IUserRepository;
  private _careerRepository: ICareerRepository;
  private _eventRepository: IEventRepository;
  private _categoryRepository: ICategoryRepository;
  private _verificationTokenRepository: IVerificationTokenRepository;
  private _emailService: IEmailService;

  // Domain Services
  private _authenticationService: AuthenticationService;
  private _verificationService: VerificationService;
  private _passwordRecoveryService: PasswordRecoveryService;
  private _userManagementService: UserManagementService;
  private _careerManagementService: CareerManagementService;
  private _eventManagementService: EventManagementService;
  private constructor() {
    // Initialize infrastructure
    this._prisma = new PrismaClient();
    this._userRepository = new UserRepository(this._prisma);
    this._careerRepository = new CareerRepository(this._prisma);
    this._eventRepository = new EventRepository(this._prisma);
    this._categoryRepository = new CategoryRepository(this._prisma);
    this._verificationTokenRepository = new VerificationTokenRepository(
      this._prisma
    );
    this._emailService = new EmailService();

    // Initialize domain services
    this._authenticationService = new AuthenticationService();

    this._verificationService = new VerificationService(
      this._userRepository,
      this._verificationTokenRepository,
      this._emailService
    );

    this._passwordRecoveryService = new PasswordRecoveryService(
      this._userRepository,
      this._verificationTokenRepository,
      this._emailService
    );

    this._userManagementService = new UserManagementService(
      this._userRepository,
      this._careerRepository
    );

    this._careerManagementService = new CareerManagementService(
      this._careerRepository
    );

    // Adaptador para IEventUserRepository
    const eventUserRepository: IEventUserRepository = {
      existsByCedula: async (cedula: string) => {
        const user = await this._userRepository.findByCedula(cedula);
        return user !== null;
      },
      findByCedula: (cedula: string) =>
        this._userRepository.findByCedula(cedula),
      isOrganizer: async (cedula: string) => {
        // Por ahora todos los usuarios existentes pueden organizar eventos
        // Esto se puede refinar según las reglas de negocio
        const user = await this._userRepository.findByCedula(cedula);
        return user !== null;
      },
    };

    this._eventManagementService = new EventManagementService(
      this._eventRepository,
      this._categoryRepository, // Para validar categorías
      eventUserRepository // Adaptador para validar organizadores
    );
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // Getters for dependencies
  public get prisma(): PrismaClient {
    return this._prisma;
  }

  public get userRepository(): IUserRepository {
    return this._userRepository;
  }

  public get careerRepository(): ICareerRepository {
    return this._careerRepository;
  }

  public get eventRepository(): IEventRepository {
    return this._eventRepository;
  }

  public get categoryRepository(): ICategoryRepository {
    return this._categoryRepository;
  }

  public get verificationTokenRepository(): IVerificationTokenRepository {
    return this._verificationTokenRepository;
  }

  public get emailService(): IEmailService {
    return this._emailService;
  }

  public get authenticationService(): AuthenticationService {
    return this._authenticationService;
  }

  public get verificationService(): VerificationService {
    return this._verificationService;
  }

  public get passwordRecoveryService(): PasswordRecoveryService {
    return this._passwordRecoveryService;
  }

  public get userManagementService(): UserManagementService {
    return this._userManagementService;
  }

  public get careerManagementService(): CareerManagementService {
    return this._careerManagementService;
  }

  public get eventManagementService(): EventManagementService {
    return this._eventManagementService;
  }

  public async dispose(): Promise<void> {
    await this._prisma.$disconnect();
  }
}
