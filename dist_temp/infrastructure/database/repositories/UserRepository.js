"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const client_1 = require("@prisma/client");
const User_1 = require("@domain/entities/User");
/**
 * Implementación del repositorio de usuarios usando Prisma
 * Principios aplicados:
 * - SRP: Solo se encarga del acceso a datos de usuarios
 * - DIP: Implementa la interfaz IUserRepository
 */
class UserRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        try {
            const user = await this.prisma.usuario.findUnique({
                where: { id_usu: id.toString() },
                include: {
                    carrera: true,
                    cuentas: true,
                },
            });
            return user ? this.mapToEntity(user) : null;
        }
        catch (error) {
            console.error("Error finding user by ID:", error);
            throw new Error("Failed to find user");
        }
    }
    async findAll() {
        try {
            const users = await this.prisma.usuario.findMany({
                include: {
                    carrera: true,
                    cuentas: true,
                },
            });
            return users.map((user) => this.mapToEntity(user));
        }
        catch (error) {
            console.error("Error finding all users:", error);
            throw new Error("Failed to find users");
        }
    }
    async create(entity) {
        try {
            const user = await this.prisma.usuario.create({
                data: {
                    ced_usu: entity.cedula,
                    nom_usu1: entity.firstName,
                    nom_usu2: entity.secondName || "",
                    ape_usu1: entity.lastName,
                    ape_usu2: entity.secondLastName || "",
                    fec_nac_usu: entity.dateOfBirth,
                    num_tel_usu: entity.phoneNumber,
                    pas_usu: entity.password,
                    id_car_per: entity.careerId?.toString(),
                },
                include: {
                    carrera: true,
                    cuentas: true,
                },
            });
            return this.mapToEntity(user);
        }
        catch (error) {
            console.error("Error creating user:", error);
            throw new Error("Failed to create user");
        }
    }
    async update(id, entity) {
        try {
            const user = await this.prisma.usuario.update({
                where: { id_usu: id.toString() },
                data: {
                    ...(entity.cedula && { ced_usu: entity.cedula }),
                    ...(entity.firstName && { nom_usu1: entity.firstName }),
                    ...(entity.secondName && { nom_usu2: entity.secondName }),
                    ...(entity.lastName && { ape_usu1: entity.lastName }),
                    ...(entity.secondLastName && { ape_usu2: entity.secondLastName }),
                    ...(entity.dateOfBirth && { fec_nac_usu: entity.dateOfBirth }),
                    ...(entity.phoneNumber && { num_tel_usu: entity.phoneNumber }),
                    ...(entity.password && { pas_usu: entity.password }),
                    ...(entity.careerId && { id_car_per: entity.careerId.toString() }),
                },
                include: {
                    carrera: true,
                    cuentas: true,
                },
            });
            return this.mapToEntity(user);
        }
        catch (error) {
            console.error("Error updating user:", error);
            throw new Error("Failed to update user");
        }
    }
    async delete(id) {
        try {
            await this.prisma.usuario.delete({
                where: { id_usu: id.toString() },
            });
            return true;
        }
        catch (error) {
            console.error("Error deleting user:", error);
            return false;
        }
    }
    async findByCedula(cedula) {
        try {
            const user = await this.prisma.usuario.findUnique({
                where: { ced_usu: cedula },
                include: {
                    carrera: true,
                    cuentas: true,
                },
            });
            return user ? this.mapToEntity(user) : null;
        }
        catch (error) {
            console.error("Error finding user by cedula:", error);
            throw new Error("Failed to find user by cedula");
        }
    }
    async findByEmail(email) {
        try {
            const account = await this.prisma.cuenta.findFirst({
                where: { cor_cue: email },
                include: {
                    usuario: {
                        include: {
                            carrera: true,
                            cuentas: true,
                        },
                    },
                },
            });
            return account?.usuario ? this.mapToEntity(account.usuario) : null;
        }
        catch (error) {
            console.error("Error finding user by email:", error);
            throw new Error("Failed to find user by email");
        }
    }
    async createWithAccount(userData, accountData) {
        try {
            const result = await this.prisma.$transaction(async (prisma) => {
                // Crear usuario
                const newUser = await prisma.usuario.create({
                    data: {
                        ced_usu: userData.cedula,
                        nom_usu1: userData.firstName,
                        nom_usu2: userData.secondName || "",
                        ape_usu1: userData.lastName,
                        ape_usu2: userData.secondLastName || "",
                        fec_nac_usu: userData.dateOfBirth,
                        num_tel_usu: userData.phoneNumber,
                        pas_usu: userData.password,
                        id_car_per: userData.careerId?.toString(),
                    },
                    include: {
                        carrera: true,
                        cuentas: true,
                    },
                });
                // Crear cuenta
                const newAccount = await prisma.cuenta.create({
                    data: {
                        cor_cue: accountData.email,
                        rol_cue: this.mapUserRoleToRolCuenta(accountData.role),
                        isVerified: accountData.isVerified,
                        id_usu_per: newUser.id_usu,
                    },
                    include: {
                        usuario: {
                            include: {
                                carrera: true,
                                cuentas: true,
                            },
                        },
                    },
                });
                return { user: newUser, account: newAccount };
            });
            return {
                user: this.mapToEntity(result.user),
                account: this.mapAccountToEntity(result.account),
            };
        }
        catch (error) {
            console.error("Error creating user with account:", error);
            throw new Error("Failed to create user with account");
        }
    }
    async updatePassword(userId, hashedPassword) {
        try {
            await this.prisma.usuario.update({
                where: { id_usu: userId.toString() },
                data: { pas_usu: hashedPassword },
            });
            return true;
        }
        catch (error) {
            console.error("Error updating password:", error);
            return false;
        }
    }
    /**
     * SRP: Mapea roles de dominio a tipos de Prisma
     */
    mapUserRoleToRolCuenta(role) {
        switch (role) {
            case User_1.UserRole.ESTUDIANTE:
                return client_1.RolCuenta.ESTUDIANTE;
            case User_1.UserRole.USUARIO:
                return client_1.RolCuenta.USUARIO;
            case User_1.UserRole.ADMINISTRADOR:
                return client_1.RolCuenta.ADMINISTRADOR;
            case User_1.UserRole.MASTER:
                return client_1.RolCuenta.MASTER;
            case User_1.UserRole.ORGANIZADOR:
                return client_1.RolCuenta.DESARROLLADOR; // Mapeo temporal ya que ORGANIZADOR no existe en RolCuenta
            default:
                return client_1.RolCuenta.ESTUDIANTE;
        }
    }
    /**
     * SRP: Mapea roles de Prisma a dominio
     */
    mapRolCuentaToUserRole(role) {
        switch (role) {
            case client_1.RolCuenta.ESTUDIANTE:
                return User_1.UserRole.ESTUDIANTE;
            case client_1.RolCuenta.USUARIO:
                return User_1.UserRole.USUARIO;
            case client_1.RolCuenta.ADMINISTRADOR:
                return User_1.UserRole.ADMINISTRADOR;
            case client_1.RolCuenta.MASTER:
                return User_1.UserRole.MASTER;
            case client_1.RolCuenta.DESARROLLADOR:
                return User_1.UserRole.ORGANIZADOR; // Mapeo temporal
            default:
                return User_1.UserRole.ESTUDIANTE;
        }
    }
    /**
     * SRP: Solo mapea datos de Prisma a entidad de dominio
     */
    mapToEntity(prismaUser) {
        return {
            id: parseInt(prismaUser.id_usu),
            cedula: prismaUser.ced_usu,
            firstName: prismaUser.nom_usu1,
            secondName: prismaUser.nom_usu2,
            lastName: prismaUser.ape_usu1,
            secondLastName: prismaUser.ape_usu2,
            dateOfBirth: prismaUser.fec_nac_usu,
            phoneNumber: prismaUser.num_tel_usu,
            password: prismaUser.pas_usu,
            careerId: prismaUser.id_car_per
                ? parseInt(prismaUser.id_car_per)
                : undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
            career: prismaUser.carrera
                ? {
                    id: parseInt(prismaUser.carrera.id_car),
                    name: prismaUser.carrera.nom_car,
                    code: prismaUser.carrera.des_car,
                    faculty: prismaUser.carrera.nom_fac_per,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
                : undefined,
        };
    }
    /**
     * Marca un usuario como verificado actualizando su cuenta
     */
    async markAsVerified(userId) {
        try {
            await this.prisma.cuenta.updateMany({
                where: { id_usu_per: userId.toString() },
                data: { isVerified: true },
            });
            return true;
        }
        catch (error) {
            console.error("Error marking user as verified:", error);
            return false;
        }
    }
    /**
     * Actualizar perfil de usuario
     */
    async updateProfile(userId, profileData) {
        try {
            const updateData = {};
            if (profileData.firstName)
                updateData.nom_usu1 = profileData.firstName;
            if (profileData.secondName !== undefined)
                updateData.nom_usu2 = profileData.secondName || "";
            if (profileData.lastName)
                updateData.ape_usu1 = profileData.lastName;
            if (profileData.secondLastName !== undefined)
                updateData.ape_usu2 = profileData.secondLastName || "";
            if (profileData.dateOfBirth)
                updateData.fec_nac_usu = profileData.dateOfBirth;
            if (profileData.phoneNumber !== undefined)
                updateData.num_tel_usu = profileData.phoneNumber;
            if (profileData.careerId !== undefined)
                updateData.id_car_per = profileData.careerId?.toString();
            if (profileData.githubToken !== undefined)
                updateData.github_token = profileData.githubToken;
            if (profileData.githubUsername !== undefined)
                updateData.github_username = profileData.githubUsername;
            await this.prisma.usuario.update({
                where: { id_usu: userId.toString() },
                data: updateData,
            });
            return true;
        }
        catch (error) {
            console.error("Error updating user profile:", error);
            return false;
        }
    }
    /**
     * Obtener perfil completo con cuenta y carrera
     */
    async getCompleteProfile(userId) {
        try {
            const user = await this.prisma.usuario.findUnique({
                where: { id_usu: userId.toString() },
                include: {
                    carrera: true,
                    cuentas: true,
                },
            });
            if (!user || !user.cuentas.length) {
                return null;
            }
            const mappedUser = this.mapToEntityComplete(user);
            const account = this.mapAccountToEntity(user.cuentas[0]);
            const career = user.carrera
                ? this.mapCareerToEntity(user.carrera)
                : undefined;
            return {
                ...mappedUser,
                account,
                career,
            };
        }
        catch (error) {
            console.error("Error getting complete profile:", error);
            return null;
        }
    }
    /**
     * Buscar usuarios con paginación
     */
    async findPaginated(page, limit, filters) {
        try {
            const skip = (page - 1) * limit;
            const where = {};
            if (filters?.careerId) {
                where.id_car_per = filters.careerId.toString();
            }
            const [users, total] = await Promise.all([
                this.prisma.usuario.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        carrera: true,
                        cuentas: true,
                    },
                    orderBy: {
                        nom_usu1: "asc",
                    },
                }),
                this.prisma.usuario.count({ where }),
            ]);
            return {
                users: users.map((user) => this.mapToEntity(user)),
                total,
            };
        }
        catch (error) {
            console.error("Error finding paginated users:", error);
            throw new Error("Failed to find paginated users");
        }
    }
    /**
     * Eliminar usuario (soft delete)
     */
    async softDelete(userId) {
        try {
            // En lugar de eliminar, marcar como inactivo en la cuenta
            await this.prisma.cuenta.updateMany({
                where: { id_usu_per: userId.toString() },
                data: { isVerified: false }, // Usar isVerified como flag de soft delete temporalmente
            });
            return true;
        }
        catch (error) {
            console.error("Error soft deleting user:", error);
            return false;
        }
    }
    /**
     * Mapear usuario completo incluyendo campos de GitHub
     */
    mapToEntityComplete(prismaUser) {
        return {
            id: parseInt(prismaUser.id_usu),
            cedula: prismaUser.ced_usu,
            firstName: prismaUser.nom_usu1,
            secondName: prismaUser.nom_usu2,
            lastName: prismaUser.ape_usu1,
            secondLastName: prismaUser.ape_usu2,
            dateOfBirth: prismaUser.fec_nac_usu,
            phoneNumber: prismaUser.num_tel_usu,
            password: prismaUser.pas_usu,
            careerId: prismaUser.id_car_per
                ? parseInt(prismaUser.id_car_per)
                : undefined,
            githubToken: prismaUser.github_token,
            githubUsername: prismaUser.github_username,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
    /**
     * Mapear carrera de Prisma a entidad
     */
    mapCareerToEntity(prismaCareer) {
        return {
            id: parseInt(prismaCareer.id_car),
            name: prismaCareer.nom_car,
            code: prismaCareer.des_car,
            faculty: prismaCareer.nom_fac_per,
            isActive: true, // Asumir activa por defecto
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
    /**
     * SRP: Solo mapea datos de cuenta de Prisma a entidad de dominio
     */
    mapAccountToEntity(prismaAccount) {
        return {
            id: parseInt(prismaAccount.id_cue),
            email: prismaAccount.cor_cue,
            role: this.mapRolCuentaToUserRole(prismaAccount.rol_cue),
            isVerified: prismaAccount.isVerified,
            userId: parseInt(prismaAccount.id_usu_per),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
}
exports.UserRepository = UserRepository;
