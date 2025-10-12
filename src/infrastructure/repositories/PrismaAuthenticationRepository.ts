/**
 * Authentication Repository Implementation - Infrastructure Layer
 *
 * Implementación para manejo de autenticación y cuentas de usuario
 * Maneja operaciones básicas según el esquema Prisma real
 */

import { PrismaClient } from "@prisma/client";

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

export class PrismaAuthenticationRepository {
  constructor(private prisma: PrismaClient) {}

  // ===== CREACIÓN DE CUENTA =====

  async createAccount(accountData: AccountData): Promise<AccountData> {
    const cuenta = await this.prisma.cuenta.create({
      data: {
        cor_cue: accountData.email,
        rol_cue: accountData.role as any,
        isVerified: accountData.isVerified,
        id_usu_per: accountData.userId,
        emailVerificationToken: accountData.emailVerificationToken || null,
        emailVerificationExpiry: accountData.emailVerificationExpiry || null,
      },
      include: {
        usuario: true,
      },
    });

    return this.mapToAccountData(cuenta);
  }

  // ===== BÚSQUEDAS DE AUTENTICACIÓN =====

  async findByEmail(email: string): Promise<AuthenticationData | null> {
    const cuenta = await this.prisma.cuenta.findFirst({
      where: { cor_cue: email },
      include: {
        usuario: {
          include: {
            carrera: true,
          },
        },
      },
    });

    if (!cuenta) return null;

    return {
      user: {
        id: cuenta.usuario.id_usu,
        cedula: cuenta.usuario.ced_usu,
        firstName: cuenta.usuario.nom_usu1,
        lastName: cuenta.usuario.ape_usu1,
        password: cuenta.usuario.pas_usu || undefined,
      },
      account: this.mapToAccountData(cuenta),
    };
  }

  async findByCedula(cedula: string): Promise<AuthenticationData | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { ced_usu: cedula },
      include: {
        cuentas: true,
        carrera: true,
      },
    });

    if (!usuario || !usuario.cuentas || usuario.cuentas.length === 0)
      return null;

    const cuenta = usuario.cuentas[0]; // Tomar la primera cuenta

    return {
      user: {
        id: usuario.id_usu,
        cedula: usuario.ced_usu,
        firstName: usuario.nom_usu1,
        lastName: usuario.ape_usu1,
        password: usuario.pas_usu || undefined,
      },
      account: this.mapToAccountData(cuenta),
    };
  }

  async findByVerificationToken(
    token: string
  ): Promise<AuthenticationData | null> {
    const cuenta = await this.prisma.cuenta.findFirst({
      where: { emailVerificationToken: token },
      include: {
        usuario: {
          include: {
            carrera: true,
          },
        },
      },
    });

    if (!cuenta) return null;

    return {
      user: {
        id: cuenta.usuario.id_usu,
        cedula: cuenta.usuario.ced_usu,
        firstName: cuenta.usuario.nom_usu1,
        lastName: cuenta.usuario.ape_usu1,
        password: cuenta.usuario.pas_usu || undefined,
      },
      account: this.mapToAccountData(cuenta),
    };
  }

  async findByResetToken(token: string): Promise<AuthenticationData | null> {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token no expirado
        },
      },
      include: {
        cuentas: true,
        carrera: true,
      },
    });

    if (!usuario || !usuario.cuentas || usuario.cuentas.length === 0)
      return null;

    const cuenta = usuario.cuentas[0];

    return {
      user: {
        id: usuario.id_usu,
        cedula: usuario.ced_usu,
        firstName: usuario.nom_usu1,
        lastName: usuario.ape_usu1,
        password: usuario.pas_usu || undefined,
      },
      account: this.mapToAccountData(cuenta),
    };
  }

  // ===== ACTUALIZACIONES DE AUTENTICACIÓN =====

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.prisma.usuario.update({
      where: { id_usu: userId },
      data: {
        pas_usu: hashedPassword,
        resetToken: null, // Limpiar token si existe
        resetTokenExpiry: null,
      },
    });
  }

  async verifyAccount(accountId: string): Promise<void> {
    await this.prisma.cuenta.update({
      where: { id_cue: accountId },
      data: {
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });
  }

  async setResetToken(
    userId: string,
    token: string,
    expiry: Date
  ): Promise<void> {
    await this.prisma.usuario.update({
      where: { id_usu: userId },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });
  }

  async setVerificationToken(
    accountId: string,
    token: string,
    expiry: Date
  ): Promise<void> {
    await this.prisma.cuenta.update({
      where: { id_cue: accountId },
      data: {
        emailVerificationToken: token,
        emailVerificationExpiry: expiry,
      },
    });
  }

  // ===== VALIDACIONES =====

  async isEmailTaken(email: string): Promise<boolean> {
    const count = await this.prisma.cuenta.count({
      where: { cor_cue: email },
    });
    return count > 0;
  }

  async isCedulaTaken(cedula: string): Promise<boolean> {
    const count = await this.prisma.usuario.count({
      where: { ced_usu: cedula },
    });
    return count > 0;
  }

  // ===== GESTIÓN DE ROLES =====

  async updateRole(accountId: string, role: string): Promise<AccountData> {
    const cuenta = await this.prisma.cuenta.update({
      where: { id_cue: accountId },
      data: { rol_cue: role as any },
      include: {
        usuario: true,
      },
    });

    return this.mapToAccountData(cuenta);
  }

  async findByRole(role: string): Promise<AuthenticationData[]> {
    const cuentas = await this.prisma.cuenta.findMany({
      where: { rol_cue: role as any },
      include: {
        usuario: {
          include: {
            carrera: true,
          },
        },
      },
    });

    return cuentas.map((cuenta) => ({
      user: {
        id: cuenta.usuario.id_usu,
        cedula: cuenta.usuario.ced_usu,
        firstName: cuenta.usuario.nom_usu1,
        lastName: cuenta.usuario.ape_usu1,
        password: cuenta.usuario.pas_usu || undefined,
      },
      account: this.mapToAccountData(cuenta),
    }));
  }

  // ===== ESTADÍSTICAS =====

  async getUserStats(): Promise<{
    total: number;
    verified: number;
    byRole: Record<string, number>;
  }> {
    const total = await this.prisma.cuenta.count();
    const verified = await this.prisma.cuenta.count({
      where: { isVerified: true },
    });

    // Contar por roles
    const roleStats = await this.prisma.cuenta.groupBy({
      by: ["rol_cue"],
      _count: {
        _all: true,
      },
    });

    const byRole: Record<string, number> = {};
    roleStats.forEach((stat) => {
      byRole[stat.rol_cue] = stat._count._all;
    });

    return { total, verified, byRole };
  }

  // ===== ELIMINACIONES =====

  async deleteAccount(accountId: string): Promise<void> {
    await this.prisma.cuenta.delete({
      where: { id_cue: accountId },
    });
  }

  // ===== UTILITY METHODS =====

  private mapToAccountData(cuenta: any): AccountData {
    return {
      id: cuenta.id_cue,
      email: cuenta.cor_cue,
      role: cuenta.rol_cue,
      isVerified: cuenta.isVerified,
      userId: cuenta.id_usu_per,
      emailVerificationToken: cuenta.emailVerificationToken || undefined,
      emailVerificationExpiry: cuenta.emailVerificationExpiry || undefined,
    };
  }
}
