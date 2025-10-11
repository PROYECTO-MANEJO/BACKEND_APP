"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationService = void 0;
const User_1 = require("@domain/entities/User");
const CommonUtils_1 = require("@shared/utils/CommonUtils");
const AppConstants_1 = require("@shared/constants/AppConstants");
/**
 * Servicio de dominio para autenticación
 * Principios aplicados:
 * - SRP: Solo lógica de negocio de autenticación
 * - DIP: Depende de abstracciones (interfaces)
 */
class AuthenticationService {
    /**
     * SRP: Solo validación de credenciales de login
     */
    validateLoginCredentials(credentials) {
        const emailError = CommonUtils_1.ValidationUtils.validateEmail(credentials.email);
        const passwordError = credentials.password
            ? null
            : { field: "password", message: "Password is required" };
        return CommonUtils_1.ValidationUtils.combineValidationResults(emailError, passwordError);
    }
    /**
     * SRP: Solo validación de datos de registro
     */
    validateRegistrationData(data) {
        const errors = [];
        // Validar email
        const emailError = CommonUtils_1.ValidationUtils.validateEmail(data.email);
        if (emailError)
            errors.push(emailError);
        // Validar contraseña
        const passwordError = CommonUtils_1.ValidationUtils.validatePassword(data.password);
        if (passwordError)
            errors.push(passwordError);
        // Validar cédula
        const cedulaError = CommonUtils_1.ValidationUtils.validateCedula(data.cedula);
        if (cedulaError)
            errors.push(cedulaError);
        // Validar nombres
        if (!data.firstName ||
            data.firstName.trim().length < AppConstants_1.VALIDATION_RULES.NAME.MIN_LENGTH) {
            errors.push({
                field: "firstName",
                message: `First name must be at least ${AppConstants_1.VALIDATION_RULES.NAME.MIN_LENGTH} characters`,
            });
        }
        if (!data.lastName ||
            data.lastName.trim().length < AppConstants_1.VALIDATION_RULES.NAME.MIN_LENGTH) {
            errors.push({
                field: "lastName",
                message: `Last name must be at least ${AppConstants_1.VALIDATION_RULES.NAME.MIN_LENGTH} characters`,
            });
        }
        // Validar fecha de nacimiento
        if (data.dateOfBirth && data.dateOfBirth > new Date()) {
            errors.push({
                field: "dateOfBirth",
                message: "Date of birth cannot be in the future",
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    /**
     * SRP: Solo determinación de rol basado en email
     */
    determineUserRole(email) {
        if (email.endsWith("@uta.edu.ec")) {
            return User_1.UserRole.ESTUDIANTE;
        }
        return User_1.UserRole.USUARIO;
    }
    /**
     * SRP: Solo verificar si carrera es requerida
     */
    isCareerRequired(email) {
        return email.endsWith("@uta.edu.ec");
    }
    /**
     * SRP: Solo validar fortaleza de contraseña con regex personalizado
     */
    validatePasswordStrength(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(password)) {
            return {
                isValid: false,
                errors: [
                    {
                        field: "password",
                        message: "Password must contain at least 6 characters, one uppercase letter, one number and one special character (@$!%*?&)",
                    },
                ],
            };
        }
        return {
            isValid: true,
            errors: [],
        };
    }
    /**
     * SRP: Solo preparar datos del usuario para persistencia
     */
    prepareUserDataForCreation(data, hashedPassword) {
        return {
            cedula: data.cedula,
            firstName: data.firstName.trim(),
            secondName: data.secondName?.trim() || "",
            lastName: data.lastName.trim(),
            secondLastName: data.secondLastName?.trim() || "",
            password: hashedPassword,
            dateOfBirth: data.dateOfBirth || new Date("2000-01-01"),
            careerId: data.careerId,
        };
    }
    /**
     * SRP: Solo preparar datos de cuenta para persistencia
     */
    prepareAccountDataForCreation(email, role) {
        return {
            email: email.toLowerCase().trim(),
            role,
            isVerified: false,
        };
    }
    /**
     * SRP: Solo verificar si el usuario es administrador
     */
    isAdminUser(account) {
        return (account.role === User_1.UserRole.ADMINISTRADOR ||
            account.role === User_1.UserRole.MASTER);
    }
}
exports.AuthenticationService = AuthenticationService;
//# sourceMappingURL=AuthenticationService.js.map