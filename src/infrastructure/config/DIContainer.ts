import { PrismaClient } from "@prisma/client";

// Repositories Interfaces
import { IUserRepository, ICareerRepository } from "@domain/repositories/IUserRepository";
import { IVerificationTokenRepository } from "@domain/repositories/IVerificationTokenRepository";
import { IEmailService } from "@domain/repositories/IEmailService";

// Repositories Implementations  
import { UserRepository } from "../database/repositories/UserRepository";
import { VerificationTokenRepository } from "../database/repositories/VerificationTokenRepository";
import { CareerRepository } from "../database/repositories/CareerRepository";

// External Services
import { EmailService } from "../external/email/EmailService";

// Domain Services
import { AuthenticationService } from "@domain/services/AuthenticationService";
import { VerificationService } from "@domain/services/VerificationService";
import { PasswordRecoveryService } from "@domain/services/PasswordRecoveryService";
import { UserManagementService } from "@domain/services/UserManagementService";
import { CareerManagementService } from "@domain/services/CareerManagementService";/**
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
  private _verificationTokenRepository: IVerificationTokenRepository;
  private _emailService: IEmailService;
  
  // Domain Services
  private _authenticationService: AuthenticationService;
  private _verificationService: VerificationService;
  private _passwordRecoveryService: PasswordRecoveryService;
  private _userManagementService: UserManagementService;
  private _careerManagementService: CareerManagementService;  private constructor() {
        // Initialize infrastructure
    this._prisma = new PrismaClient();
    this._userRepository = new UserRepository(this._prisma);
    this._careerRepository = new CareerRepository(this._prisma);
    this._verificationTokenRepository = new VerificationTokenRepository(this._prisma);
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

  public async dispose(): Promise<void> {
    await this._prisma.$disconnect();
  }
}
