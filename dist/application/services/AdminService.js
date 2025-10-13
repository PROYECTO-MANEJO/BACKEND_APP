"use strict";
/**
 * Admin Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Operaciones de negocio para administración
 * Separado del controlador para cumplir Single Responsibility Principle
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const AdminValidator_1 = require("../../domain/validators/AdminValidator");
class AdminService {
    constructor(container) {
        this.container = container;
    }
    /**
     * ✅ SRP: Crear nuevo administrador
     */
    async createAdmin(adminRequest) {
        // ✅ SRP: Delegar validación al AdminValidator
        AdminValidator_1.AdminValidator.validate({
            ced_usu: adminRequest.ced_usu,
            nom_usu1: adminRequest.nom_usu1,
            nom_usu2: adminRequest.nom_usu2,
            ape_usu1: adminRequest.ape_usu1,
            ape_usu2: adminRequest.ape_usu2,
            email: adminRequest.email,
            password: adminRequest.password,
            rol: adminRequest.rol,
        });
        // ✅ SRP: Lógica de creación de administrador
        // NOTA: Este es un archivo de demostración - no conectado al sistema real
        console.log("AdminService.createAdmin - Archivo de demostración SRP");
        return {
            message: "Admin creation logic would go here",
            data: adminRequest,
        };
    }
    /**
     * ✅ SRP: Obtener todos los administradores
     */
    async getAllAdmins() {
        // ✅ SRP: Lógica de obtención de administradores
        console.log("AdminService.getAllAdmins - Archivo de demostración SRP");
        return [{ message: "Admin fetching logic would go here" }];
    }
    /**
     * ✅ SRP: Obtener administrador por ID
     */
    async getAdminById(id) {
        // ✅ SRP: Lógica de obtención por ID
        console.log("AdminService.getAdminById - Archivo de demostración SRP", id);
        return {
            message: "Admin by ID fetching logic would go here",
            id,
        };
    }
    /**
     * ✅ SRP: Actualizar administrador
     */
    async updateAdmin(id, updateRequest) {
        // ✅ SRP: Delegar validación al AdminValidator
        AdminValidator_1.AdminValidator.validateUpdate(updateRequest);
        // ✅ SRP: Lógica de actualización
        console.log("AdminService.updateAdmin - Archivo de demostración SRP", id, updateRequest);
        return {
            message: "Admin update logic would go here",
            id,
            data: updateRequest,
        };
    }
    /**
     * ✅ SRP: Eliminar administrador
     */
    async deleteAdmin(id) {
        // ✅ SRP: Lógica de eliminación
        console.log("AdminService.deleteAdmin - Archivo de demostración SRP", id);
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=AdminService.js.map