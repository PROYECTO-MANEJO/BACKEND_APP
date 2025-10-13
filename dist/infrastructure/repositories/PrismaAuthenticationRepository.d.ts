/**
 * Authentication Repository Implementation - Infrastructure Layer
 *
 * Implementación para manejo de autenticación y cuentas de usuario
 * Maneja operaciones básicas según el esquema Prisma real
 */
import { PrismaClient } from "@prisma/client";
import { IAuthenticationRepository, AccountData, AuthenticationData, CompleteAuthData } from "../../domain/repositories/IAuthenticationRepository";
export declare class PrismaAuthenticationRepository implements IAuthenticationRepository {
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
    findCompleteByEmail(email: string): Promise<CompleteAuthData | null>;
    findCompleteById(userId: string): Promise<CompleteAuthData | null>;
    private mapToCompleteAuthData;
    private mapToAccountData;
}
//# sourceMappingURL=PrismaAuthenticationRepository.d.ts.map