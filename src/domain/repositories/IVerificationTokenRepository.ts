import { VerificationToken } from "../entities/VerificationToken";

export interface IVerificationTokenRepository {
  create(token: VerificationToken): Promise<VerificationToken>;
  findByToken(token: string): Promise<VerificationToken | null>;
  findByUserId(
    userId: string,
    type?: "EMAIL_VERIFICATION" | "PASSWORD_RESET"
  ): Promise<VerificationToken[]>;
  markAsUsed(tokenId: string): Promise<void>;
  deleteExpiredTokens(): Promise<number>;
  delete(tokenId: string): Promise<void>;
}
