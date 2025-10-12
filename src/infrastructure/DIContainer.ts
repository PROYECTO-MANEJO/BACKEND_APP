import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateJWT, generateAdminJWT, generateVerificationJWT } from './helpers/jwtHelper';

/**
 * Real Dependency Injection Container
 * NO MOCKS - Real implementation with Prisma
 */
export class DIContainer {
  private static instance: DIContainer;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

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
