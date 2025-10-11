import { BaseRepository } from "@shared/interfaces/BaseInterfaces";
import { User, Account, Career } from "@domain/entities/User";

/**
 * Interface para repositorio de usuarios
 * Principios aplicados:
 * - ISP: Interface específica para operaciones de usuario
 * - DIP: Abstracción para inversión de dependencias
 */
export interface IUserRepository extends BaseRepository<User> {
  /**
   * Buscar usuario por cédula
   */
  findByCedula(cedula: string): Promise<User | null>;

  /**
   * Buscar usuario por email (a través de cuenta)
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Crear usuario con cuenta en transacción
   */
  createWithAccount(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">,
    accountData: Omit<Account, "id" | "createdAt" | "updatedAt" | "userId">
  ): Promise<{ user: User; account: Account }>;

  /**
   * Actualizar contraseña
   */
  updatePassword(userId: number, hashedPassword: string): Promise<boolean>;

  /**
   * Marcar usuario como verificado
   */
  markAsVerified(userId: number): Promise<boolean>;

  /**
   * Actualizar perfil de usuario
   */
  updateProfile(userId: number, profileData: Partial<User>): Promise<boolean>;

  /**
   * Obtener perfil completo con cuenta y carrera
   */
  getCompleteProfile(userId: number): Promise<(User & { account: Account; career?: Career }) | null>;

  /**
   * Buscar usuarios con paginación
   */
  findPaginated(page: number, limit: number, filters?: Partial<User>): Promise<{ users: User[]; total: number }>;

  /**
   * Eliminar usuario (soft delete)
   */
  softDelete(userId: number): Promise<boolean>;
}

/**
 * Interface para repositorio de cuentas
 * Principios aplicados:
 * - ISP: Interface específica para operaciones de cuenta
 * - SRP: Solo operaciones relacionadas con cuentas/autenticación
 */
export interface IAccountRepository extends BaseRepository<Account> {
  /**
   * Buscar cuenta por email
   */
  findByEmail(email: string): Promise<Account | null>;

  /**
   * Buscar cuenta por email incluyendo datos del usuario
   */
  findByEmailWithUser(
    email: string
  ): Promise<(Account & { user: User }) | null>;

  /**
   * Verificar cuenta
   */
  verifyAccount(accountId: number): Promise<boolean>;

  /**
   * Verificar si email existe
   */
  emailExists(email: string): Promise<boolean>;
}

/**
 * Interface para repositorio de carreras
 * Principios aplicados:
 * - ISP: Interface específica para operaciones de carreras
 */
export interface ICareerRepository extends BaseRepository<Career> {
  /**
   * Buscar carreras activas
   */
  findActivecareers(): Promise<Career[]>;

  /**
   * Verificar si carrera existe y está activa
   */
  existsAndActive(careerId: number): Promise<boolean>;

  /**
   * Buscar carrera por código
   */
  findByCode(code: string): Promise<Career | null>;

  /**
   * Verificar si código ya existe
   */
  codeExists(code: string, excludeId?: number): Promise<boolean>;

  /**
   * Activar/Desactivar carrera
   */
  setActiveStatus(careerId: number, isActive: boolean): Promise<boolean>;
}
