"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const BaseController_1 = require("./BaseController");
class UserController extends BaseController_1.BaseController {
    constructor() {
        super();
    }
    /**
     * GET /api/users
     * Obtener lista de usuarios con paginación
     */
    async getUsers(req, res) {
        await this.execute(req, res, async () => {
            const { page, pageSize } = this.getPaginationParams(req);
            // TODO: Implementar cuando estén disponibles los casos de uso
            const mockUsers = [
                {
                    id: 1,
                    cedula: "1234567890",
                    nombres: "Usuario Ejemplo",
                    apellidos: "Apellido Ejemplo",
                    email: "usuario@ejemplo.com",
                    telefono: "0987654321",
                    rol: "estudiante",
                    fechaCreacion: new Date(),
                    estado: true,
                },
            ];
            const response = {
                users: mockUsers,
                total: mockUsers.length,
                page,
                pageSize,
            };
            return response;
        });
    }
    /**
     * GET /api/users/:id
     * Obtener usuario por ID
     */
    async getUserById(req, res) {
        await this.execute(req, res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                throw new Error("ID de usuario inválido");
            }
            // TODO: Implementar cuando estén disponibles los casos de uso
            const mockUser = {
                id: userId,
                cedula: "1234567890",
                nombres: "Usuario Ejemplo",
                apellidos: "Apellido Ejemplo",
                email: "usuario@ejemplo.com",
                telefono: "0987654321",
                rol: "estudiante",
                fechaCreacion: new Date(),
                estado: true,
            };
            return mockUser;
        });
    }
    /**
     * POST /api/users
     * Crear nuevo usuario
     */
    async createUser(req, res) {
        await this.execute(req, res, async () => {
            const userData = req.body;
            // Validación básica
            if (!userData.cedula ||
                !userData.nombres ||
                !userData.apellidos ||
                !userData.email ||
                !userData.password) {
                throw new Error("Faltan campos obligatorios: cedula, nombres, apellidos, email, password");
            }
            // TODO: Implementar cuando estén disponibles los casos de uso
            const mockUser = {
                id: Math.floor(Math.random() * 1000),
                cedula: userData.cedula,
                nombres: userData.nombres,
                apellidos: userData.apellidos,
                email: userData.email,
                telefono: userData.telefono || "",
                rol: userData.rol || "estudiante",
                fechaCreacion: new Date(),
                estado: true,
            };
            return mockUser;
        });
    }
    /**
     * PUT /api/users/:id
     * Actualizar usuario
     */
    async updateUser(req, res) {
        await this.execute(req, res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                throw new Error("ID de usuario inválido");
            }
            const userData = req.body;
            // TODO: Implementar cuando estén disponibles los casos de uso
            const mockUser = {
                id: userId,
                cedula: "1234567890",
                nombres: userData.nombres || "Usuario Ejemplo",
                apellidos: userData.apellidos || "Apellido Ejemplo",
                email: userData.email || "usuario@ejemplo.com",
                telefono: userData.telefono || "",
                rol: userData.rol || "estudiante",
                fechaCreacion: new Date(),
                estado: true,
            };
            return mockUser;
        });
    }
    /**
     * DELETE /api/users/:id
     * Eliminar usuario (soft delete)
     */
    async deleteUser(req, res) {
        await this.execute(req, res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                throw new Error("ID de usuario inválido");
            }
            // TODO: Implementar cuando estén disponibles los casos de uso
            return { message: "Usuario eliminado correctamente" };
        });
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map