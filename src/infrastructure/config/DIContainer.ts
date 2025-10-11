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
import { ICourseRepository } from "@domain/repositories/ICourseRepository";
import { IInscriptionRepository } from "@domain/repositories/IInscriptionRepository";

// Phase 7 - Advanced Features Repositories
import { CertificateRepository } from "@domain/repositories/CertificateRepository";
import { ReportRepository } from "@domain/repositories/ReportRepository";
import { ChangeRequestRepository as LegacyChangeRequestRepository } from "@domain/repositories/ChangeRequestRepository";

// Phase 8 - Change Request System Repositories
import { ChangeRequestRepository } from "@domain/repositories/IChangeRequestRepository";
import { DeveloperRepository } from "@domain/repositories/IDeveloperRepository";

// Repositories Implementations
import { UserRepository } from "../database/repositories/UserRepository";
import { VerificationTokenRepository } from "../database/repositories/VerificationTokenRepository";
import { CareerRepository } from "../database/repositories/CareerRepository";
import { EventRepository } from "../database/repositories/EventRepository";
import { CategoryRepository } from "../database/repositories/CategoryRepository";
import { CourseRepository } from "../repositories/CourseRepository";
import { InscriptionRepository } from "../repositories/InscriptionRepository";

// Phase 7 - Infrastructure Implementations
import { PrismaCertificateRepository } from "../repositories/PrismaCertificateRepository";

// Phase 8 - Change Request System Infrastructure
import { PrismaChangeRequestRepository } from "../repositories/PrismaChangeRequestRepository";
import { PrismaDeveloperRepository } from "../repositories/PrismaDeveloperRepository";

// External Services
import { EmailService } from "../external/email/EmailService";

// Domain Services
import { AuthenticationService } from "@domain/services/AuthenticationService";
import { VerificationService } from "@domain/services/VerificationService";
import { PasswordRecoveryService } from "@domain/services/PasswordRecoveryService";
import { UserManagementService } from "@domain/services/UserManagementService";
import { CareerManagementService } from "@domain/services/CareerManagementService";
import { EventManagementService } from "@domain/services/EventManagementService";
import { CourseManagementService } from "@domain/services/CourseManagementService";
import { InscriptionManagementService } from "@domain/services/InscriptionManagementService";

// Phase 7 - Advanced Features Domain Services
import { CertificateManagementService } from "@domain/services/CertificateManagementService";
import { ReportManagementService } from "@domain/services/ReportManagementService";

// Phase 8 - Change Request System Domain Services
import { ChangeRequestWorkflowService } from "@domain/services/ChangeRequestWorkflowService";

// Phase 8 - Change Request System Use Cases
import { CreateChangeRequestUseCase } from "@application/change-request-management/CreateChangeRequestUseCase";
import { GetChangeRequestByIdUseCase } from "@application/change-request-management/GetChangeRequestByIdUseCase";
import { GetMyChangeRequestsUseCase } from "@application/change-request-management/GetMyChangeRequestsUseCase";
import { UpdateChangeRequestStatusUseCase } from "@application/change-request-management/UpdateChangeRequestStatusUseCase";
import { AssignDeveloperUseCase } from "@application/change-request-management/AssignDeveloperUseCase";
import { ChangeRequestManagementService } from "@domain/services/ChangeRequestManagementService";

// Phase 7 - External Services Interfaces
import { PDFGenerationService } from "@domain/services/external/PDFGenerationService";
import { GitHubIntegrationService } from "@domain/services/external/GitHubIntegrationService";
import { NotificationService } from "@domain/services/external/NotificationService";
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
  private _courseRepository: ICourseRepository;
  private _inscriptionRepository: IInscriptionRepository;
  private _verificationTokenRepository: IVerificationTokenRepository;
  private _emailService: IEmailService;

  // Phase 7 - Advanced Features
  private _certificateRepository: CertificateRepository;
  private _reportRepository?: ReportRepository;
  private _changeRequestRepository?: LegacyChangeRequestRepository;
  private _pdfGenerationService?: PDFGenerationService;
  private _githubIntegrationService?: GitHubIntegrationService;
  private _notificationService?: NotificationService;

  // Phase 8 - Change Request System
  private _newChangeRequestRepository?: ChangeRequestRepository;
  private _developerRepository?: DeveloperRepository;
  private _changeRequestWorkflowService?: ChangeRequestWorkflowService;
  private _createChangeRequestUseCase?: CreateChangeRequestUseCase;
  private _getChangeRequestByIdUseCase?: GetChangeRequestByIdUseCase;
  private _getMyChangeRequestsUseCase?: GetMyChangeRequestsUseCase;
  private _updateChangeRequestStatusUseCase?: UpdateChangeRequestStatusUseCase;
  private _assignDeveloperUseCase?: AssignDeveloperUseCase;

  // Domain Services
  private _authenticationService: AuthenticationService;
  private _verificationService: VerificationService;
  private _passwordRecoveryService: PasswordRecoveryService;
  private _userManagementService: UserManagementService;
  private _careerManagementService: CareerManagementService;
  private _eventManagementService: EventManagementService;
  private _courseManagementService: CourseManagementService;
  private _inscriptionManagementService: InscriptionManagementService;

  // Phase 7 - Advanced Features Domain Services
  private _certificateManagementService: CertificateManagementService;
  private _reportManagementService?: ReportManagementService;
  private _changeRequestManagementService?: ChangeRequestManagementService;
  private constructor() {
    // Initialize infrastructure
    this._prisma = new PrismaClient();
    this._userRepository = new UserRepository(this._prisma);
    this._careerRepository = new CareerRepository(this._prisma);
    this._eventRepository = new EventRepository(this._prisma);
    this._categoryRepository = new CategoryRepository(this._prisma);
    this._courseRepository = new CourseRepository(this._prisma);
    this._inscriptionRepository = new InscriptionRepository(this._prisma);
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

    // Adaptadores para CourseManagementService
    const courseUserRepository = {
      findById: (cedula: string) => this._userRepository.findByCedula(cedula),
      exists: async (cedula: string) => {
        const user = await this._userRepository.findByCedula(cedula);
        return user !== null;
      },
      findByCareer: async (careerId: number) => {
        // Implementación simplificada - en el futuro se puede extender
        return [];
      },
    };

    const courseCategoryRepository = {
      findById: (id: number) => this._categoryRepository.findById(id),
      existsById: (id: number) => this._categoryRepository.existsById(id),
    };

    const courseCareerRepository = {
      exists: async (id: number) => {
        return await this._careerRepository.existsAndActive(id);
      },
      findByIds: async (ids: number[]) => {
        // Implementación simplificada - retornar array de carreras por IDs
        const careers = [];
        for (const id of ids) {
          const career = await this._careerRepository.findById(id);
          if (career) careers.push(career);
        }
        return careers;
      },
    };

    // Inicializar servicio de gestión de cursos
    this._courseManagementService = new CourseManagementService(
      this._courseRepository,
      courseCategoryRepository,
      courseUserRepository,
      courseCareerRepository
    );

    // Adaptadores para InscriptionManagementService
    const inscriptionEventRepository = {
      findById: (id: string) => this._eventRepository.findById(id),
      hasAvailableCapacity: async (eventId: string) => {
        // Implementación simplificada - se puede refinar según reglas de negocio
        const event = await this._eventRepository.findById(eventId);
        if (!event) return false;

        // Verificar si el evento tiene cupo disponible
        // Por ahora asumimos que todos los eventos activos tienen cupo
        return event.isActive();
      },
    };

    const inscriptionCourseRepository = {
      findById: (id: string) => this._courseRepository.findById(id),
      hasAvailableCapacity: async (courseId: string) => {
        // Implementación simplificada - se puede refinar según reglas de negocio
        const course = await this._courseRepository.findById(courseId);
        if (!course) return false;

        // Verificar si el curso tiene cupo disponible
        // Por ahora asumimos que todos los cursos activos tienen cupo
        return course.isActive();
      },
    };

    const inscriptionUserRepository = {
      findById: async (id: string) => {
        // Convertir string ID a número si es necesario
        const numericId = parseInt(id);
        if (isNaN(numericId)) return null;
        return await this._userRepository.findById(numericId);
      },
      exists: async (id: string) => {
        const numericId = parseInt(id);
        if (isNaN(numericId)) return false;
        const user = await this._userRepository.findById(numericId);
        return user !== null;
      },
    };

    // Inicializar servicio de gestión de inscripciones
    this._inscriptionManagementService = new InscriptionManagementService(
      this._inscriptionRepository,
      inscriptionEventRepository,
      inscriptionCourseRepository,
      inscriptionUserRepository
    );

    // Phase 7 - Initialize Advanced Features
    // Initialize repositories
    this._certificateRepository = new PrismaCertificateRepository();

    // TODO: Implement these repositories and services for complete Phase 7
    // this._reportRepository = new PrismaReportRepository();
    // this._changeRequestRepository = new PrismaChangeRequestRepository();
    // this._pdfGenerationService = new PDFGenerationServiceImpl();
    // this._githubIntegrationService = new GitHubIntegrationServiceImpl();
    // this._notificationService = new NotificationServiceImpl();

    // Initialize domain services with mock/adapter dependencies
    const mockParticipationRepository = {
      findEventParticipationById: async (id: string) => null,
      findCourseCompletionById: async (id: string) => null,
      findEventParticipationByUserAndEvent: async (
        userId: string,
        eventId: string
      ) => null,
      findCourseCompletionByUserAndCourse: async (
        userId: string,
        courseId: string
      ) => null,
    };

    const mockPDFGenerator = {
      generateCertificatePDF: async (data: any, template?: string) => ({
        buffer: Buffer.from("mock pdf content"),
        filePath: `/certificates/cert_${Date.now()}.pdf`,
        fileSize: 1024,
      }),
      verifyCertificatePDF: async (path: string) => ({ isValid: true }),
      getAvailableTemplates: async () => ["default", "modern", "classic"],
    };

    this._certificateManagementService = new CertificateManagementService(
      this._certificateRepository as any,
      mockParticipationRepository,
      mockPDFGenerator
    );

    // TODO: Initialize other Phase 7 services when implementations are ready
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

  public get courseRepository(): ICourseRepository {
    return this._courseRepository;
  }

  public get courseManagementService(): CourseManagementService {
    return this._courseManagementService;
  }

  public get inscriptionRepository(): IInscriptionRepository {
    return this._inscriptionRepository;
  }

  public get inscriptionManagementService(): InscriptionManagementService {
    return this._inscriptionManagementService;
  }

  // Phase 7 - Advanced Features Getters
  public get certificateRepository(): CertificateRepository {
    return this._certificateRepository;
  }

  public get certificateManagementService(): CertificateManagementService {
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

  // Phase 8 - Change Request System Getters
  public get newChangeRequestRepository(): ChangeRequestRepository {
    if (!this._newChangeRequestRepository) {
      this._newChangeRequestRepository = new PrismaChangeRequestRepository(
        this._prisma
      );
    }
    return this._newChangeRequestRepository;
  }

  public get developerRepository(): DeveloperRepository {
    if (!this._developerRepository) {
      this._developerRepository = new PrismaDeveloperRepository(this._prisma);
    }
    return this._developerRepository;
  }

  public get changeRequestWorkflowService(): ChangeRequestWorkflowService {
    if (!this._changeRequestWorkflowService) {
      this._changeRequestWorkflowService = new ChangeRequestWorkflowService();
    }
    return this._changeRequestWorkflowService;
  }

  public get createChangeRequestUseCase(): CreateChangeRequestUseCase {
    if (!this._createChangeRequestUseCase) {
      this._createChangeRequestUseCase = new CreateChangeRequestUseCase(
        this.newChangeRequestRepository
      );
    }
    return this._createChangeRequestUseCase;
  }

  public get getChangeRequestByIdUseCase(): GetChangeRequestByIdUseCase {
    if (!this._getChangeRequestByIdUseCase) {
      this._getChangeRequestByIdUseCase = new GetChangeRequestByIdUseCase(
        this.newChangeRequestRepository
      );
    }
    return this._getChangeRequestByIdUseCase;
  }

  public get getMyChangeRequestsUseCase(): GetMyChangeRequestsUseCase {
    if (!this._getMyChangeRequestsUseCase) {
      this._getMyChangeRequestsUseCase = new GetMyChangeRequestsUseCase(
        this.newChangeRequestRepository
      );
    }
    return this._getMyChangeRequestsUseCase;
  }

  public get updateChangeRequestStatusUseCase(): UpdateChangeRequestStatusUseCase {
    if (!this._updateChangeRequestStatusUseCase) {
      this._updateChangeRequestStatusUseCase =
        new UpdateChangeRequestStatusUseCase(
          this.newChangeRequestRepository,
          this.changeRequestWorkflowService
        );
    }
    return this._updateChangeRequestStatusUseCase;
  }

  public get assignDeveloperUseCase(): AssignDeveloperUseCase {
    if (!this._assignDeveloperUseCase) {
      this._assignDeveloperUseCase = new AssignDeveloperUseCase(
        this.newChangeRequestRepository,
        this.developerRepository,
        this.changeRequestWorkflowService
      );
    }
    return this._assignDeveloperUseCase;
  }

  public async dispose(): Promise<void> {
    await this._prisma.$disconnect();
  }
}
