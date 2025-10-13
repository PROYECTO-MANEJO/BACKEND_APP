"use strict";
/**
 * User Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Operaciones de negocio para usuarios
 * Separado del controlador para cumplir Single Responsibility Principle
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const UserValidator_1 = require("../../domain/validators/UserValidator");
class UserService {
    constructor(container) {
        this.container = container;
    }
    /**
     * ✅ SRP: Crear nuevo usuario
     */
    async createUser(userRequest) {
        // ✅ SRP: Delegar validación al UserValidator
        UserValidator_1.UserValidator.validate({
            ced_usu: userRequest.ced_usu,
            nom_usu1: userRequest.nom_usu1,
            nom_usu2: userRequest.nom_usu2,
            ape_usu1: userRequest.ape_usu1,
            ape_usu2: userRequest.ape_usu2,
            email: userRequest.email,
            password: userRequest.password,
            tel_usu: userRequest.tel_usu,
            dir_usu: userRequest.dir_usu,
            fec_nac_usu: userRequest.fec_nac_usu,
            rol: userRequest.rol,
        });
        // ✅ SRP: Validar edad mínima si aplica
        if (userRequest.fec_nac_usu) {
            UserValidator_1.UserValidator.validateMinimumAge(userRequest.fec_nac_usu, 16);
        }
        // ✅ SRP: Lógica de creación de usuario
        // NOTA: Este es un archivo de demostración - no conectado al sistema real
        console.log("UserService.createUser - Archivo de demostración SRP");
        return {
            message: "User creation logic would go here",
            data: userRequest,
        };
    }
    /**
     * ✅ SRP: Obtener todos los usuarios
     */
    async getAllUsers() {
        // ✅ SRP: Lógica de obtención de usuarios
        console.log("UserService.getAllUsers - Archivo de demostración SRP");
        return [{ message: "Users fetching logic would go here" }];
    }
    /**
     * ✅ SRP: Obtener usuario por cédula
     */
    async getUserByCedula(cedula) {
        // ✅ SRP: Lógica de obtención por cédula
        console.log("UserService.getUserByCedula - Archivo de demostración SRP", cedula);
        return {
            message: "User by cedula fetching logic would go here",
            cedula,
        };
    }
    /**
     * ✅ SRP: Obtener usuario por email
     */
    async getUserByEmail(email) {
        // ✅ SRP: Lógica de obtención por email
        console.log("UserService.getUserByEmail - Archivo de demostración SRP", email);
        return {
            message: "User by email fetching logic would go here",
            email,
        };
    }
    /**
     * ✅ SRP: Actualizar usuario
     */
    async updateUser(cedula, updateRequest) {
        // ✅ SRP: Delegar validación al UserValidator
        UserValidator_1.UserValidator.validateUpdate(updateRequest);
        // ✅ SRP: Validar edad mínima si se actualiza fecha de nacimiento
        if (updateRequest.fec_nac_usu) {
            UserValidator_1.UserValidator.validateMinimumAge(updateRequest.fec_nac_usu, 16);
        }
        // ✅ SRP: Lógica de actualización
        console.log("UserService.updateUser - Archivo de demostración SRP", cedula, updateRequest);
        return {
            message: "User update logic would go here",
            cedula,
            data: updateRequest,
        };
    }
    /**
     * ✅ SRP: Cambiar contraseña
     */
    async changePassword(cedula, currentPassword, newPassword) {
        // ✅ SRP: Validar nueva contraseña
        UserValidator_1.UserValidator.validate({ password: newPassword });
        // ✅ SRP: Lógica de cambio de contraseña
        console.log("UserService.changePassword - Archivo de demostración SRP", cedula);
    }
    /**
     * ✅ SRP: Activar/Desactivar usuario
     */
    async toggleUserStatus(cedula) {
        // ✅ SRP: Lógica de cambio de estado
        console.log("UserService.toggleUserStatus - Archivo de demostración SRP", cedula);
        return {
            message: "User status toggle logic would go here",
            cedula,
        };
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map