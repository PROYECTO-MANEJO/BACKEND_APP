import {
  IUserRepository,
  ICareerRepository,
} from "../repositories/IUserRepository";
import { User, Account, Career } from "../entities/User";
import {
  UpdateUserProfileDto,
  UserProfileResponse,
} from "@shared/types/UserManagementTypes";

/**
 * Servicio de dominio para gestión de usuarios
 * Principios aplicados:
 * - SRP: Solo lógica de negocio de usuarios
 * - DIP: Depende de abstracciones
 */
export class UserManagementService {
  constructor(
    private userRepository: IUserRepository,
    private careerRepository: ICareerRepository
  ) {}

  async getUserProfile(userId: number): Promise<UserProfileResponse | null> {
    try {
      const userProfile = await this.userRepository.getCompleteProfile(userId);

      if (!userProfile) {
        return null;
      }

      return {
        id: userProfile.id,
        cedula: userProfile.cedula,
        firstName: userProfile.firstName,
        secondName: userProfile.secondName,
        lastName: userProfile.lastName,
        secondLastName: userProfile.secondLastName,
        dateOfBirth: userProfile.dateOfBirth,
        phoneNumber: userProfile.phoneNumber,
        careerId: userProfile.careerId,
        career: userProfile.career
          ? {
              id: userProfile.career.id,
              name: userProfile.career.name,
              code: userProfile.career.code,
            }
          : undefined,
        account: {
          id: userProfile.account.id,
          email: userProfile.account.email,
          role: userProfile.account.role,
          isVerified: userProfile.account.isVerified,
        },
        githubToken: userProfile.githubToken,
        githubUsername: userProfile.githubUsername,
      };
    } catch (error) {
      console.error("[UserManagementService] Error obteniendo perfil:", error);
      throw new Error("Error obteniendo perfil de usuario");
    }
  }

  async updateUserProfile(
    userId: number,
    updateData: UpdateUserProfileDto
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Obtener usuario actual para validaciones
      const currentUser = await this.userRepository.findById(userId);
      if (!currentUser) {
        return { success: false, message: "Usuario no encontrado" };
      }

      // Validar carrera si se está cambiando
      if (updateData.careerId) {
        const careerExists = await this.careerRepository.existsAndActive(
          updateData.careerId
        );
        if (!careerExists) {
          return {
            success: false,
            message: "La carrera seleccionada no existe o no está activa",
          };
        }
      }

      // Validar token de GitHub según el rol
      if (updateData.githubToken) {
        const userProfile = await this.userRepository.getCompleteProfile(
          userId
        );
        const allowedRoles = ["DESARROLLADOR", "MASTER", "ADMINISTRADOR"];

        if (!userProfile || !allowedRoles.includes(userProfile.account.role)) {
          return {
            success: false,
            message:
              "Solo desarrolladores, masters y administradores pueden configurar token de GitHub",
          };
        }
      }

      // Preparar datos para actualización
      const profileData: Partial<User> = {};

      if (updateData.firstName) profileData.firstName = updateData.firstName;
      if (updateData.secondName !== undefined)
        profileData.secondName = updateData.secondName;
      if (updateData.lastName) profileData.lastName = updateData.lastName;
      if (updateData.secondLastName !== undefined)
        profileData.secondLastName = updateData.secondLastName;
      if (updateData.dateOfBirth)
        profileData.dateOfBirth = updateData.dateOfBirth;
      if (updateData.phoneNumber !== undefined)
        profileData.phoneNumber = updateData.phoneNumber;
      if (updateData.careerId !== undefined)
        profileData.careerId = updateData.careerId;
      if (updateData.githubToken !== undefined)
        profileData.githubToken = updateData.githubToken;

      // Actualizar perfil
      const updated = await this.userRepository.updateProfile(
        userId,
        profileData
      );

      if (!updated) {
        return { success: false, message: "Error actualizando perfil" };
      }

      return { success: true, message: "Perfil actualizado exitosamente" };
    } catch (error) {
      console.error(
        "[UserManagementService] Error actualizando perfil:",
        error
      );
      return { success: false, message: "Error interno del servidor" };
    }
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    filters?: Partial<User>
  ): Promise<{
    users: UserProfileResponse[];
    total: number;
    totalPages: number;
  }> {
    try {
      const { users, total } = await this.userRepository.findPaginated(
        page,
        limit,
        filters
      );

      const userProfiles: UserProfileResponse[] = [];

      for (const user of users) {
        const completeProfile = await this.userRepository.getCompleteProfile(
          user.id
        );
        if (completeProfile) {
          userProfiles.push({
            id: completeProfile.id,
            cedula: completeProfile.cedula,
            firstName: completeProfile.firstName,
            secondName: completeProfile.secondName,
            lastName: completeProfile.lastName,
            secondLastName: completeProfile.secondLastName,
            dateOfBirth: completeProfile.dateOfBirth,
            phoneNumber: completeProfile.phoneNumber,
            careerId: completeProfile.careerId,
            career: completeProfile.career
              ? {
                  id: completeProfile.career.id,
                  name: completeProfile.career.name,
                  code: completeProfile.career.code,
                }
              : undefined,
            account: {
              id: completeProfile.account.id,
              email: completeProfile.account.email,
              role: completeProfile.account.role,
              isVerified: completeProfile.account.isVerified,
            },
          });
        }
      }

      return {
        users: userProfiles,
        total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error(
        "[UserManagementService] Error obteniendo usuarios:",
        error
      );
      throw new Error("Error obteniendo lista de usuarios");
    }
  }

  async deleteUser(
    userId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return { success: false, message: "Usuario no encontrado" };
      }

      const deleted = await this.userRepository.softDelete(userId);

      if (!deleted) {
        return { success: false, message: "Error eliminando usuario" };
      }

      return { success: true, message: "Usuario eliminado exitosamente" };
    } catch (error) {
      console.error("[UserManagementService] Error eliminando usuario:", error);
      return { success: false, message: "Error interno del servidor" };
    }
  }
}
