import { IVerificationTokenRepository } from "@domain/repositories/IVerificationTokenRepository";
import {
  VerificationToken,
  IVerificationToken,
} from "@domain/entities/VerificationToken";
import { PrismaClient } from "@prisma/client";

export class VerificationTokenRepository
  implements IVerificationTokenRepository
{
  constructor(private prisma: PrismaClient) {}

  async create(token: VerificationToken): Promise<VerificationToken> {
    if (token.type === "EMAIL_VERIFICATION") {
      // Actualizar la tabla Cuenta con el token de verificación
      await this.prisma.cuenta.updateMany({
        where: { id_usu_per: token.userId },
        data: {
          emailVerificationToken: token.token,
          emailVerificationExpiry: token.expiresAt,
        },
      });
    } else if (token.type === "PASSWORD_RESET") {
      // Actualizar la tabla Usuario con el token de reset
      await this.prisma.usuario.update({
        where: { id_usu: token.userId },
        data: {
          resetToken: token.token,
          resetTokenExpiry: token.expiresAt,
        },
      });
    }

    return token;
  }

  async findByToken(token: string): Promise<VerificationToken | null> {
    // Buscar en tabla Cuenta (tokens de verificación de email)
    const emailToken = await this.prisma.cuenta.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpiry: { gte: new Date() },
      },
    });

    if (emailToken) {
      return new VerificationToken({
        id: emailToken.id_cue,
        userId: emailToken.id_usu_per,
        token: emailToken.emailVerificationToken!,
        type: "EMAIL_VERIFICATION",
        expiresAt: emailToken.emailVerificationExpiry!,
        isUsed: false, // Se considera no usado si el token existe
        createdAt: new Date(), // No tenemos este campo en el esquema actual
      });
    }

    // Buscar en tabla Usuario (tokens de reset de password)
    const resetToken = await this.prisma.usuario.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gte: new Date() },
      },
    });

    if (resetToken) {
      return new VerificationToken({
        id: resetToken.id_usu,
        userId: resetToken.id_usu,
        token: resetToken.resetToken!,
        type: "PASSWORD_RESET",
        expiresAt: resetToken.resetTokenExpiry!,
        isUsed: false,
        createdAt: new Date(),
      });
    }

    return null;
  }

  async findByUserId(
    userId: string,
    type?: "EMAIL_VERIFICATION" | "PASSWORD_RESET"
  ): Promise<VerificationToken[]> {
    const tokens: VerificationToken[] = [];

    if (!type || type === "EMAIL_VERIFICATION") {
      const emailTokens = await this.prisma.cuenta.findMany({
        where: {
          id_usu_per: userId,
          emailVerificationToken: { not: null },
        },
      });

      tokens.push(
        ...emailTokens.map(
          (t) =>
            new VerificationToken({
              id: t.id_cue,
              userId: t.id_usu_per,
              token: t.emailVerificationToken!,
              type: "EMAIL_VERIFICATION",
              expiresAt: t.emailVerificationExpiry!,
              isUsed: false,
              createdAt: new Date(),
            })
        )
      );
    }

    if (!type || type === "PASSWORD_RESET") {
      const resetTokens = await this.prisma.usuario.findMany({
        where: {
          id_usu: userId,
          resetToken: { not: null },
        },
      });

      tokens.push(
        ...resetTokens.map(
          (t) =>
            new VerificationToken({
              id: t.id_usu,
              userId: t.id_usu,
              token: t.resetToken!,
              type: "PASSWORD_RESET",
              expiresAt: t.resetTokenExpiry!,
              isUsed: false,
              createdAt: new Date(),
            })
        )
      );
    }

    return tokens;
  }

  async markAsUsed(tokenId: string): Promise<void> {
    // Intentar marcar como usado en tabla Cuenta (limpiar el token)
    await this.prisma.cuenta.updateMany({
      where: { id_cue: tokenId },
      data: {
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    // Intentar marcar como usado en tabla Usuario (limpiar el token)
    await this.prisma.usuario.updateMany({
      where: { id_usu: tokenId },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  }

  async deleteExpiredTokens(): Promise<number> {
    const now = new Date();

    // Limpiar tokens expirados de email
    const emailResult = await this.prisma.cuenta.updateMany({
      where: {
        emailVerificationExpiry: { lt: now },
      },
      data: {
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    // Limpiar tokens expirados de reset
    const resetResult = await this.prisma.usuario.updateMany({
      where: {
        resetTokenExpiry: { lt: now },
      },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return emailResult.count + resetResult.count;
  }

  async delete(tokenId: string): Promise<void> {
    // Limpiar token específico de email
    await this.prisma.cuenta.updateMany({
      where: { id_cue: tokenId },
      data: {
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    // Limpiar token específico de reset
    await this.prisma.usuario.updateMany({
      where: { id_usu: tokenId },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  }
}
