import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import {
  generateJWT,
  generateAdminJWT,
  generateVerificationJWT,
} from "./helpers/jwtHelper";

// Importar interfaces de repositorios
import { IUserRepository } from "../domain/repositories/IUserRepository";
import { ICourseRepository } from "../domain/repositories/ICourseRepository";
import { IEventRepository } from "../domain/repositories/IEventRepository";
import { ICertificateRepository } from "../domain/repositories/ICertificateRepository";
import { IEnrollmentRepository } from "../domain/repositories/IEnrollmentRepository";
import { DeveloperRepository } from "../domain/repositories/IDeveloperRepository";
import { ChangeRequestRepository } from "../domain/repositories/IChangeRequestRepository";
import { IAuthenticationRepository } from "../domain/repositories/IAuthenticationRepository";
import { IEmailService } from "../domain/repositories/IEmailService";
// ✅ Nuevos repositorios implementados
import { IOrganizerRepository } from "../domain/repositories/IOrganizerRepository";
import { ICategoryRepository } from "../domain/repositories/ICategoryRepository";
import { IParticipationRepository } from "../domain/repositories/IParticipationRepository";
import { IDocumentRepository } from "../domain/repositories/IDocumentRepository";
import { IReportRepository } from "../domain/repositories/IReportRepository";
import { ICareerRepository } from "../domain/repositories/ICareerRepository";
import { IHomepageRepository } from "../domain/repositories/IHomepageRepository";

// Importar implementaciones
import { PrismaUserRepository } from "./repositories/PrismaUserRepository";
import { PrismaCourseRepository } from "./repositories/PrismaCourseRepository";
import { PrismaEventRepository } from "./repositories/PrismaEventRepository";
import { PrismaCertificateRepository } from "./repositories/PrismaCertificateRepository";
import { PrismaEnrollmentRepository } from "./repositories/PrismaEnrollmentRepository";
import { PrismaDeveloperRepository } from "./repositories/PrismaDeveloperRepository";
import { PrismaChangeRequestRepository } from "./repositories/PrismaChangeRequestRepository";
import { PrismaAuthenticationRepository } from "./repositories/PrismaAuthenticationRepository";
import { EmailServiceImpl } from "./external/EmailServiceImpl";
// ✅ Nuevas implementaciones
import { PrismaOrganizerRepository } from "./repositories/PrismaOrganizerRepository";
import { PrismaCategoryRepository } from "./repositories/PrismaCategoryRepository";
import { PrismaParticipationRepository } from "./repositories/PrismaParticipationRepository";
import { PrismaDocumentRepository } from "./repositories/PrismaDocumentRepository";
import { PrismaReportRepository } from "./repositories/PrismaReportRepository";
import { PrismaCareerRepository } from "./repositories/PrismaCareerRepository";
import { PrismaHomepageRepository } from "./repositories/PrismaHomepageRepository";

/**
 * SOLID Dependency Injection Container
 * 
 * ✅ SRP: Single Responsibility Principle - Solo se encarga de crear y gestionar dependencias
 * ✅ OCP: Open/Closed Principle - Abierto para nuevas dependencias, cerrado para modificación
 * ✅ LSP: Liskov Substitution Principle - Devuelve implementaciones que cumplen contratos
 * ✅ ISP: Interface Segregation Principle - Cada método devuelve interfaz específica
 * ✅ DIP: Dependency Inversion Principle - Núcleo del patrón, invierte dependencias
 */
export class DIContainer {
  private static instance: DIContainer;
  private prisma: PrismaClient;

  // Repositorios como singletons
  private userRepository?: IUserRepository;
  private courseRepository?: ICourseRepository;
  private eventRepository?: IEventRepository;
  private certificateRepository?: ICertificateRepository;
  private enrollmentRepository?: IEnrollmentRepository;
  private developerRepository?: DeveloperRepository;
  private changeRequestRepository?: ChangeRequestRepository;
  private authenticationRepository?: IAuthenticationRepository;
  private emailService?: IEmailService;
  // ✅ Nuevos repositorios
  private organizerRepository?: IOrganizerRepository;
  private categoryRepository?: ICategoryRepository;
  private participationRepository?: IParticipationRepository;
  private documentRepository?: IDocumentRepository;
  private reportRepository?: IReportRepository;
  private careerRepository?: ICareerRepository;
  private homepageRepository?: IHomepageRepository;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // ✅ DIP: Retorna interfaces, no implementaciones concretas
  // ✅ ISP: Interfaz específica IUserRepository, no interfaz gorda
  // ✅ SRP: Solo se encarga de crear/devolver repositorio de usuarios
  public getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      // ✅ OCP: Puede cambiar implementación sin afectar clientes
      this.userRepository = new PrismaUserRepository(this.prisma);
    }
    // ✅ LSP: Implementación cumple contrato de IUserRepository
    return this.userRepository!;
  }

  public getCourseRepository(): ICourseRepository {
    if (!this.courseRepository) {
      this.courseRepository = new PrismaCourseRepository(this.prisma);
    }
    return this.courseRepository!;
  }

  public getEventRepository(): IEventRepository {
    if (!this.eventRepository) {
      this.eventRepository = new PrismaEventRepository(this.prisma);
    }
    return this.eventRepository!;
  }

  public getCertificateRepository(): ICertificateRepository {
    if (!this.certificateRepository) {
      this.certificateRepository = new PrismaCertificateRepository(this.prisma);
    }
    return this.certificateRepository!;
  }

  public getEnrollmentRepository(): IEnrollmentRepository {
    if (!this.enrollmentRepository) {
      this.enrollmentRepository = new PrismaEnrollmentRepository(this.prisma);
    }
    return this.enrollmentRepository!;
  }

  public getDeveloperRepository(): DeveloperRepository {
    if (!this.developerRepository) {
      this.developerRepository = new PrismaDeveloperRepository(this.prisma);
    }
    return this.developerRepository;
  }

  public getChangeRequestRepository(): ChangeRequestRepository {
    if (!this.changeRequestRepository) {
      this.changeRequestRepository = new PrismaChangeRequestRepository(
        this.prisma
      );
    }
    return this.changeRequestRepository;
  }

  public getAuthenticationRepository(): IAuthenticationRepository {
    if (!this.authenticationRepository) {
      this.authenticationRepository = new PrismaAuthenticationRepository(
        this.prisma
      );
    }
    return this.authenticationRepository;
  }

  public getEmailService(): IEmailService {
    if (!this.emailService) {
      this.emailService = new EmailServiceImpl();
    }
    return this.emailService;
  }

  // ✅ NUEVOS REPOSITORIOS IMPLEMENTADOS

  public getOrganizerRepository(): IOrganizerRepository {
    if (!this.organizerRepository) {
      this.organizerRepository = new PrismaOrganizerRepository(this.prisma);
    }
    return this.organizerRepository;
  }

  public getCategoryRepository(): ICategoryRepository {
    if (!this.categoryRepository) {
      this.categoryRepository = new PrismaCategoryRepository(this.prisma);
    }
    return this.categoryRepository;
  }

  public getParticipationRepository(): IParticipationRepository {
    if (!this.participationRepository) {
      this.participationRepository = new PrismaParticipationRepository(
        this.prisma
      );
    }
    return this.participationRepository;
  }

  public getDocumentRepository(): IDocumentRepository {
    if (!this.documentRepository) {
      this.documentRepository = new PrismaDocumentRepository(this.prisma);
    }
    return this.documentRepository;
  }

  public getReportRepository(): IReportRepository {
    if (!this.reportRepository) {
      this.reportRepository = new PrismaReportRepository(this.prisma);
    }
    return this.reportRepository;
  }

  public getCareerRepository(): ICareerRepository {
    if (!this.careerRepository) {
      this.careerRepository = new PrismaCareerRepository(this.prisma);
    }
    return this.careerRepository;
  }

  public getHomepageRepository(): IHomepageRepository {
    if (!this.homepageRepository) {
      this.homepageRepository = new PrismaHomepageRepository(this.prisma);
    }
    return this.homepageRepository;
  }

  // ⚠️ LEGACY: Solo para compatibilidad temporal
  public getPrismaClient(): PrismaClient {
    return this.prisma;
  }

  public getBcrypt() {
    return bcrypt;
  }

  public getJwtHelpers() {
    return {
      generateJWT,
      generateAdminJWT,
      generateVerificationJWT,
    };
  }

  // Cleanup method for graceful shutdown
  public async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
