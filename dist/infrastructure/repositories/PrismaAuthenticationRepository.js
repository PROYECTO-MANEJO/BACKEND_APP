"use strict";
/**
 * Authentication Repository Implementation - Infrastructure Layer
 *
 * Implementación para manejo de autenticación y cuentas de usuario
 * Maneja operaciones básicas según el esquema Prisma real
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAuthenticationRepository = void 0;
class PrismaAuthenticationRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // ===== CREACIÓN DE CUENTA =====
    async createAccount(accountData) {
        const cuenta = await this.prisma.cuenta.create({
            data: {
                cor_cue: accountData.email,
                rol_cue: accountData.role,
                isVerified: accountData.isVerified,
                id_usu_per: accountData.userId,
                emailVerificationToken: accountData.emailVerificationToken || null,
                emailVerificationExpiry: accountData.emailVerificationExpiry || null
            },
            include: {
                usuario: true
            }
        });
        return this.mapToAccountData(cuenta);
    }
    // ===== BÚSQUEDAS DE AUTENTICACIÓN =====
    async findByEmail(email) {
        const cuenta = await this.prisma.cuenta.findFirst({
            where: { cor_cue: email },
            include: {
                usuario: {
                    include: {
                        carrera: true
                    }
                }
            }
        });
        if (!cuenta)
            return null;
        return {
            user: {
                id: cuenta.usuario.id_usu,
                cedula: cuenta.usuario.ced_usu,
                firstName: cuenta.usuario.nom_usu1,
                lastName: cuenta.usuario.ape_usu1,
                password: cuenta.usuario.pas_usu || undefined
            },
            account: this.mapToAccountData(cuenta)
        };
    }
    async findByCedula(cedula) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { ced_usu: cedula },
            include: {
                cuentas: true,
                carrera: true
            }
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
                password: usuario.pas_usu || undefined
            },
            account: this.mapToAccountData(cuenta)
        };
    }
    async findByVerificationToken(token) {
        const cuenta = await this.prisma.cuenta.findFirst({
            where: { emailVerificationToken: token },
            include: {
                usuario: {
                    include: {
                        carrera: true
                    }
                }
            }
        });
        if (!cuenta)
            return null;
        return {
            user: {
                id: cuenta.usuario.id_usu,
                cedula: cuenta.usuario.ced_usu,
                firstName: cuenta.usuario.nom_usu1,
                lastName: cuenta.usuario.ape_usu1,
                password: cuenta.usuario.pas_usu || undefined
            },
            account: this.mapToAccountData(cuenta)
        };
    }
    async findByResetToken(token) {
        const usuario = await this.prisma.usuario.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date() // Token no expirado
                }
            },
            include: {
                cuentas: true,
                carrera: true
            }
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
                password: usuario.pas_usu || undefined
            },
            account: this.mapToAccountData(cuenta)
        };
    }
    // ===== ACTUALIZACIONES DE AUTENTICACIÓN =====
    async updatePassword(userId, hashedPassword) {
        await this.prisma.usuario.update({
            where: { id_usu: userId },
            data: {
                pas_usu: hashedPassword,
                resetToken: null, // Limpiar token si existe
                resetTokenExpiry: null
            }
        });
    }
    async verifyAccount(accountId) {
        await this.prisma.cuenta.update({
            where: { id_cue: accountId },
            data: {
                isVerified: true,
                emailVerificationToken: null,
                emailVerificationExpiry: null
            }
        });
    }
    async setResetToken(userId, token, expiry) {
        await this.prisma.usuario.update({
            where: { id_usu: userId },
            data: {
                resetToken: token,
                resetTokenExpiry: expiry
            }
        });
    }
    async setVerificationToken(accountId, token, expiry) {
        await this.prisma.cuenta.update({
            where: { id_cue: accountId },
            data: {
                emailVerificationToken: token,
                emailVerificationExpiry: expiry
            }
        });
    }
    // ===== VALIDACIONES =====
    async isEmailTaken(email) {
        const count = await this.prisma.cuenta.count({
            where: { cor_cue: email }
        });
        return count > 0;
    }
    async isCedulaTaken(cedula) {
        const count = await this.prisma.usuario.count({
            where: { ced_usu: cedula }
        });
        return count > 0;
    }
    // ===== GESTIÓN DE ROLES =====
    async updateRole(accountId, role) {
        const cuenta = await this.prisma.cuenta.update({
            where: { id_cue: accountId },
            data: { rol_cue: role },
            include: {
                usuario: true
            }
        });
        return this.mapToAccountData(cuenta);
    }
    async findByRole(role) {
        const cuentas = await this.prisma.cuenta.findMany({
            where: { rol_cue: role },
            include: {
                usuario: {
                    include: {
                        carrera: true
                    }
                }
            }
        });
        return cuentas.map(cuenta => ({
            user: {
                id: cuenta.usuario.id_usu,
                cedula: cuenta.usuario.ced_usu,
                firstName: cuenta.usuario.nom_usu1,
                lastName: cuenta.usuario.ape_usu1,
                password: cuenta.usuario.pas_usu || undefined
            },
            account: this.mapToAccountData(cuenta)
        }));
    }
    // ===== ESTADÍSTICAS =====
    async getUserStats() {
        const total = await this.prisma.cuenta.count();
        const verified = await this.prisma.cuenta.count({
            where: { isVerified: true }
        });
        // Contar por roles
        const roleStats = await this.prisma.cuenta.groupBy({
            by: ['rol_cue'],
            _count: {
                _all: true
            }
        });
        const byRole = {};
        roleStats.forEach(stat => {
            byRole[stat.rol_cue] = stat._count._all;
        });
        return { total, verified, byRole };
    }
    // ===== ELIMINACIONES =====
    async deleteAccount(accountId) {
        await this.prisma.cuenta.delete({
            where: { id_cue: accountId }
        });
    }
    // ===== UTILITY METHODS =====
    mapToAccountData(cuenta) {
        return {
            id: cuenta.id_cue,
            email: cuenta.cor_cue,
            role: cuenta.rol_cue,
            isVerified: cuenta.isVerified,
            userId: cuenta.id_usu_per,
            emailVerificationToken: cuenta.emailVerificationToken || undefined,
            emailVerificationExpiry: cuenta.emailVerificationExpiry || undefined
        };
    }
}
exports.PrismaAuthenticationRepository = PrismaAuthenticationRepository;
//# sourceMappingURL=PrismaAuthenticationRepository.js.map