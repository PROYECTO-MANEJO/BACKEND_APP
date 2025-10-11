import { PrismaClient, RolCuenta } from "@prisma/client";
import {
  IUserRepository,
  IAccountRepository,
  ICareerRepository,
} from "@domain/repositories/IUserRepository";
import { User, Account, Career, UserRole } from "@domain/entities/User";

/**
 * Implementación del repositorio de usuarios usando Prisma
 * Principios aplicados:
 * - SRP: Solo se encarga del acceso a datos de usuarios
 * - DIP: Implementa la interfaz IUserRepository
 */
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: number): Promise<User | null> {
    try {
      const user = await this.prisma.usuario.findUnique({
        where: { id_usu: id.toString() },
        include: {
          carrera: true,
          cuentas: true,
        },
      });

      return user ? this.mapToEntity(user) : null;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw new Error("Failed to find user");
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.prisma.usuario.findMany({
        include: {
          carrera: true,
          cuentas: true,
        },
      });

      return users.map((user) => this.mapToEntity(user));
    } catch (error) {
      console.error("Error finding all users:", error);
      throw new Error("Failed to find users");
    }
  }

  async create(
    entity: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
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
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  async update(id: number, entity: Partial<User>): Promise<User | null> {
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
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Failed to update user");
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.usuario.delete({
        where: { id_usu: id.toString() },
      });
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  async findByCedula(cedula: string): Promise<User | null> {
    try {
      const user = await this.prisma.usuario.findUnique({
        where: { ced_usu: cedula },
        include: {
          carrera: true,
          cuentas: true,
        },
      });

      return user ? this.mapToEntity(user) : null;
    } catch (error) {
      console.error("Error finding user by cedula:", error);
      throw new Error("Failed to find user by cedula");
    }
  }

  async findByEmail(email: string): Promise<User | null> {
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
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw new Error("Failed to find user by email");
    }
  }

  async createWithAccount(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">,
    accountData: Omit<Account, "id" | "createdAt" | "updatedAt" | "userId">
  ): Promise<{ user: User; account: Account }> {
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
    } catch (error) {
      console.error("Error creating user with account:", error);
      throw new Error("Failed to create user with account");
    }
  }

  async updatePassword(
    userId: number,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      await this.prisma.usuario.update({
        where: { id_usu: userId.toString() },
        data: { pas_usu: hashedPassword },
      });
      return true;
    } catch (error) {
      console.error("Error updating password:", error);
      return false;
    }
  }

  /**
   * SRP: Mapea roles de dominio a tipos de Prisma
   */
  private mapUserRoleToRolCuenta(role: UserRole): RolCuenta {
    switch (role) {
      case UserRole.ESTUDIANTE:
        return RolCuenta.ESTUDIANTE;
      case UserRole.USUARIO:
        return RolCuenta.USUARIO;
      case UserRole.ADMINISTRADOR:
        return RolCuenta.ADMINISTRADOR;
      case UserRole.MASTER:
        return RolCuenta.MASTER;
      case UserRole.ORGANIZADOR:
        return RolCuenta.DESARROLLADOR; // Mapeo temporal ya que ORGANIZADOR no existe en RolCuenta
      default:
        return RolCuenta.ESTUDIANTE;
    }
  }

  /**
   * SRP: Mapea roles de Prisma a dominio
   */
  private mapRolCuentaToUserRole(role: RolCuenta): UserRole {
    switch (role) {
      case RolCuenta.ESTUDIANTE:
        return UserRole.ESTUDIANTE;
      case RolCuenta.USUARIO:
        return UserRole.USUARIO;
      case RolCuenta.ADMINISTRADOR:
        return UserRole.ADMINISTRADOR;
      case RolCuenta.MASTER:
        return UserRole.MASTER;
      case RolCuenta.DESARROLLADOR:
        return UserRole.ORGANIZADOR; // Mapeo temporal
      default:
        return UserRole.ESTUDIANTE;
    }
  }

  /**
   * SRP: Solo mapea datos de Prisma a entidad de dominio
   */
  private mapToEntity(prismaUser: any): User {
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
  async markAsVerified(userId: number): Promise<boolean> {
    try {
      await this.prisma.cuenta.updateMany({
        where: { id_usu_per: userId.toString() },
        data: { isVerified: true },
      });
      return true;
    } catch (error) {
      console.error("Error marking user as verified:", error);
      return false;
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(
    userId: number,
    profileData: Partial<User>
  ): Promise<boolean> {
    try {
      const updateData: any = {};

      if (profileData.firstName) updateData.nom_usu1 = profileData.firstName;
      if (profileData.secondName !== undefined)
        updateData.nom_usu2 = profileData.secondName || "";
      if (profileData.lastName) updateData.ape_usu1 = profileData.lastName;
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
    } catch (error) {
      console.error("Error updating user profile:", error);
      return false;
    }
  }

  /**
   * Obtener perfil completo con cuenta y carrera
   */
  async getCompleteProfile(
    userId: number
  ): Promise<(User & { account: Account; career?: Career }) | null> {
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
    } catch (error) {
      console.error("Error getting complete profile:", error);
      return null;
    }
  }

  /**
   * Buscar usuarios con paginación
   */
  async findPaginated(
    page: number,
    limit: number,
    filters?: Partial<User>
  ): Promise<{ users: User[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};

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
    } catch (error) {
      console.error("Error finding paginated users:", error);
      throw new Error("Failed to find paginated users");
    }
  }

  /**
   * Eliminar usuario (soft delete)
   */
  async softDelete(userId: number): Promise<boolean> {
    try {
      // En lugar de eliminar, marcar como inactivo en la cuenta
      await this.prisma.cuenta.updateMany({
        where: { id_usu_per: userId.toString() },
        data: { isVerified: false }, // Usar isVerified como flag de soft delete temporalmente
      });
      return true;
    } catch (error) {
      console.error("Error soft deleting user:", error);
      return false;
    }
  }

  /**
   * Mapear usuario completo incluyendo campos de GitHub
   */
  private mapToEntityComplete(prismaUser: any): User {
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
  private mapCareerToEntity(prismaCareer: any): Career {
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
  private mapAccountToEntity(prismaAccount: any): Account {
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
