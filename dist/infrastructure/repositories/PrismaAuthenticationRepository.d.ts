/**
 * Authentication Repository Implementation - Infrastructure Layer
 *
 * Implementación para manejo de autenticación y cuentas de usuario
 * Maneja operaciones básicas según el esquema Prisma real
 */
import { PrismaClient } from '@prisma/client';
export interface AccountData {
    id?: string;
    email: string;
    role: string;
    isVerified: boolean;
    userId: string;
    emailVerificationToken?: string;
    emailVerificationExpiry?: Date;
}
export interface AuthenticationData {
    user: {
        id: string;
        cedula: string;
        firstName: string;
        lastName: string;
        password?: string;
    };
    account: AccountData;
}
export declare class PrismaAuthenticationRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    createAccount(accountData: AccountData): Promise<AccountData>;
    findByEmail(email: string): Promise<AuthenticationData | null>;
    findByCedula(cedula: string): Promise<AuthenticationData | null>;
    findByVerificationToken(token: string): Promise<AuthenticationData | null>;
    findByResetToken(token: string): Promise<AuthenticationData | null>;
    updatePassword(userId: string, hashedPassword: string): Promise<void>;
    verifyAccount(accountId: string): Promise<void>;
    setResetToken(userId: string, token: string, expiry: Date): Promise<void>;
    setVerificationToken(accountId: string, token: string, expiry: Date): Promise<void>;
    isEmailTaken(email: string): Promise<boolean>;
    isCedulaTaken(cedula: string): Promise<boolean>;
    updateRole(accountId: string, role: string): Promise<AccountData>;
    findByRole(role: string): Promise<AuthenticationData[]>;
    getUserStats(): Promise<{
        total: number;
        verified: number;
        byRole: Record<string, number>;
    }>;
    deleteAccount(accountId: string): Promise<void>;
    private mapToAccountData;
}
//# sourceMappingURL=PrismaAuthenticationRepository.d.ts.map