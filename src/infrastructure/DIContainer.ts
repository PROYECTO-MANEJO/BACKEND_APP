import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateJWT, generateAdminJWT, generateVerificationJWT } from './helpers/jwtHelper';

// Importar interfaces de repositorios
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { ICourseRepository } from '../domain/repositories/ICourseRepository';
import { IEventRepository } from '../domain/repositories/IEventRepository';
import { ICertificateRepository } from '../domain/repositories/ICertificateRepository';
import { IEnrollmentRepository } from '../domain/repositories/IEnrollmentRepository';
import { DeveloperRepository } from '../domain/repositories/IDeveloperRepository';
import { ChangeRequestRepository } from '../domain/repositories/IChangeRequestRepository';

// Importar implementaciones
import { PrismaUserRepository } from './repositories/PrismaUserRepository';
import { PrismaCourseRepository } from './repositories/PrismaCourseRepository';
import { PrismaEventRepository } from './repositories/PrismaEventRepository';
import { PrismaCertificateRepository } from './repositories/PrismaCertificateRepository';
import { PrismaEnrollmentRepository } from './repositories/PrismaEnrollmentRepository';
import { PrismaDeveloperRepository } from './repositories/PrismaDeveloperRepository';
import { PrismaChangeRequestRepository } from './repositories/PrismaChangeRequestRepository';

/**
 * SOLID Dependency Injection Container
 * Implementa DIP (Dependency Inversion Principle)
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

  private constructor() {
    this.prisma = new PrismaClient();
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // ✅ SOLID: Retorna interfaces, no implementaciones concretas
  public getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      this.userRepository = new PrismaUserRepository(this.prisma);
    }
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
      this.changeRequestRepository = new PrismaChangeRequestRepository(this.prisma);
    }
    return this.changeRequestRepository;
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
      generateVerificationJWT
    };
  }

  // Cleanup method for graceful shutdown
  public async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
