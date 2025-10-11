import { IVerificationTokenRepository } from "@domain/repositories/IVerificationTokenRepository";
import { VerificationToken } from "@domain/entities/VerificationToken";
import { PrismaClient } from "@prisma/client";
export declare class VerificationTokenRepository implements IVerificationTokenRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(token: VerificationToken): Promise<VerificationToken>;
    findByToken(token: string): Promise<VerificationToken | null>;
    findByUserId(userId: string, type?: "EMAIL_VERIFICATION" | "PASSWORD_RESET"): Promise<VerificationToken[]>;
    markAsUsed(tokenId: string): Promise<void>;
    deleteExpiredTokens(): Promise<number>;
    delete(tokenId: string): Promise<void>;
}
//# sourceMappingURL=VerificationTokenRepository.d.ts.map