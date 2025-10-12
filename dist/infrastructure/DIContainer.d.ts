import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
/**
 * Real Dependency Injection Container
 * NO MOCKS - Real implementation with Prisma
 */
export declare class DIContainer {
    private static instance;
    private prisma;
    private constructor();
    static getInstance(): DIContainer;
    getPrismaClient(): PrismaClient;
    getBcrypt(): typeof bcrypt;
    getJwtHelpers(): {
        generateJWT: (id: string) => Promise<string>;
        generateAdminJWT: (id: string) => Promise<string>;
        generateVerificationJWT: (id: string) => Promise<string>;
    };
    cleanup(): Promise<void>;
}
//# sourceMappingURL=DIContainer.d.ts.map