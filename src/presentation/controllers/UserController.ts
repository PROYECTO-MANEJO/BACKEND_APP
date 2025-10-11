import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/config/DIContainer";
import { User } from "../../domain/entities/User";
import {
  CreateUserRequestDTO,
  UpdateUserRequestDTO,
  UserResponseDTO,
  UserListResponseDTO,
} from "../dto/UserDTO";

export class UserController extends BaseController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    super();
    this.container = container;
  }

  /**
   * GET /api/users
   * Obtener lista de usuarios con paginación
   */
  public async getUsers(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const { page, pageSize } = this.getPaginationParams(req);
      const getUsersUseCase = this.container.getUsersUseCase();

      const result = await getUsersUseCase.execute({ page, pageSize });

      const response: UserListResponseDTO = {
        users: result.users.map((user: User) => this.mapToUserResponse(user)),
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      };

      return response;
    });
  }

  /**
   * GET /api/users/:id
   * Obtener usuario por ID
   */
  public async getUserById(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const userId = parseInt(req.params.id!);
      if (isNaN(userId)) {
        throw new Error("ID de usuario inválido");
      }

      const getUserByIdUseCase = this.container.getUserByIdUseCase();
      const user = await getUserByIdUseCase.execute(userId);

      return this.mapToUserResponse(user);
    });
  }

  /**
   * GET /api/users/cedula/:cedula
   * Obtener usuario por cédula
   */
  public async getUserByCedula(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const cedula = req.params.cedula;

      const getUserByCedulaUseCase = this.container.getUserByCedulaUseCase();
      const user = await getUserByCedulaUseCase.execute(cedula);

      return this.mapToUserResponse(user);
    });
  }

  /**
   * POST /api/users
   * Crear nuevo usuario
   */
  public async createUser(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const userData: CreateUserRequestDTO = req.body;

      // Validación básica
      if (
        !userData.cedula ||
        !userData.nombres ||
        !userData.apellidos ||
        !userData.email ||
        !userData.password
      ) {
        throw new Error(
          "Faltan campos obligatorios: cedula, nombres, apellidos, email, password"
        );
      }

      const createUserUseCase = this.container.getCreateUserUseCase();
      const user = await createUserUseCase.execute({
        cedula: userData.cedula,
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        email: userData.email,
        password: userData.password,
        telefono: userData.telefono,
        rol: userData.rol || "estudiante",
      });

      return this.mapToUserResponse(user);
    });
  }

  /**
   * PUT /api/users/:id
   * Actualizar usuario
   */
  public async updateUser(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const userId = parseInt(req.params.id!);
      if (isNaN(userId)) {
        throw new Error("ID de usuario inválido");
      }

      const userData: UpdateUserRequestDTO = req.body;

      const updateUserUseCase = this.container.getUpdateUserUseCase();
      const user = await updateUserUseCase.execute(userId, {
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        email: userData.email,
        telefono: userData.telefono,
        rol: userData.rol,
      });

      return this.mapToUserResponse(user);
    });
  }

  /**
   * DELETE /api/users/:id
   * Eliminar usuario (soft delete)
   */
  public async deleteUser(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const userId = parseInt(req.params.id!);
      if (isNaN(userId)) {
        throw new Error("ID de usuario inválido");
      }

      const deleteUserUseCase = this.container.getDeleteUserUseCase();
      await deleteUserUseCase.execute(userId);

      return { message: "Usuario eliminado correctamente" };
    });
  }

  /**
   * GET /api/users/search
   * Buscar usuarios por criterios
   */
  public async searchUsers(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const { search, rol } = req.query;
      const { page, pageSize } = this.getPaginationParams(req);

      const searchUsersUseCase = this.container.getSearchUsersUseCase();
      const result = await searchUsersUseCase.execute({
        searchTerm: search as string,
        rol: rol as string,
        page,
        pageSize,
      });

      const response: UserListResponseDTO = {
        users: result.users.map((user: User) => this.mapToUserResponse(user)),
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      };

      return response;
    });
  }

  /**
   * PUT /api/users/:id/status
   * Activar/desactivar usuario
   */
  public async toggleUserStatus(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const userId = parseInt(req.params.id!);
      if (isNaN(userId)) {
        throw new Error("ID de usuario inválido");
      }

      const { estado } = req.body;
      if (typeof estado !== "boolean") {
        throw new Error("El estado debe ser un booleano");
      }

      const updateUserStatusUseCase =
        this.container.getUpdateUserStatusUseCase();
      const user = await updateUserStatusUseCase.execute(userId, estado);

      return this.mapToUserResponse(user);
    });
  }

  /**
   * Mapea un usuario del dominio a DTO de respuesta
   */
  private mapToUserResponse(user: User & { account?: any }): UserResponseDTO {
    return {
      id: user.id,
      cedula: user.cedula,
      nombres: user.firstName + (user.secondName ? ` ${user.secondName}` : ""),
      apellidos:
        user.lastName + (user.secondLastName ? ` ${user.secondLastName}` : ""),
      email: user.account?.email || "",
      telefono: user.phoneNumber || "",
      rol: user.account?.role || "estudiante",
      fechaCreacion: user.createdAt,
      estado: user.isActive ?? true,
    };
  }
}
