import {
  DomainService,
  ValidationResult,
} from "@shared/interfaces/BaseInterfaces";
import {
  User,
  Account,
  LoginCredentials,
  RegisterUserData,
  UserRole,
} from "@domain/entities/User";
import { ValidationUtils } from "@shared/utils/CommonUtils";
import { VALIDATION_RULES } from "@shared/constants/AppConstants";

/**
 * Servicio de dominio para autenticación
 * Principios aplicados:
 * - SRP: Solo lógica de negocio de autenticación
 * - DIP: Depende de abstracciones (interfaces)
 */
export class AuthenticationService implements DomainService {
  /**
   * SRP: Solo validación de credenciales de login
   */
  validateLoginCredentials(credentials: LoginCredentials): ValidationResult {
    const emailError = ValidationUtils.validateEmail(credentials.email);

    const passwordError = credentials.password
      ? null
      : { field: "password", message: "Password is required" };

    return ValidationUtils.combineValidationResults(emailError, passwordError);
  }

  /**
   * SRP: Solo validación de datos de registro
   */
  validateRegistrationData(data: RegisterUserData): ValidationResult {
    const errors = [];

    // Validar email
    const emailError = ValidationUtils.validateEmail(data.email);
    if (emailError) errors.push(emailError);

    // Validar contraseña
    const passwordError = ValidationUtils.validatePassword(data.password);
    if (passwordError) errors.push(passwordError);

    // Validar cédula
    const cedulaError = ValidationUtils.validateCedula(data.cedula);
    if (cedulaError) errors.push(cedulaError);

    // Validar nombres
    if (
      !data.firstName ||
      data.firstName.trim().length < VALIDATION_RULES.NAME.MIN_LENGTH
    ) {
      errors.push({
        field: "firstName",
        message: `First name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`,
      });
    }

    if (
      !data.lastName ||
      data.lastName.trim().length < VALIDATION_RULES.NAME.MIN_LENGTH
    ) {
      errors.push({
        field: "lastName",
        message: `Last name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`,
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
  determineUserRole(email: string): UserRole {
    if (email.endsWith("@uta.edu.ec")) {
      return UserRole.ESTUDIANTE;
    }
    return UserRole.USUARIO;
  }

  /**
   * SRP: Solo verificar si carrera es requerida
   */
  isCareerRequired(email: string): boolean {
    return email.endsWith("@uta.edu.ec");
  }

  /**
   * SRP: Solo validar fortaleza de contraseña con regex personalizado
   */
  validatePasswordStrength(password: string): ValidationResult {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!passwordRegex.test(password)) {
      return {
        isValid: false,
        errors: [
          {
            field: "password",
            message:
              "Password must contain at least 6 characters, one uppercase letter, one number and one special character (@$!%*?&)",
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
  prepareUserDataForCreation(
    data: RegisterUserData,
    hashedPassword: string
  ): Omit<User, "id" | "createdAt" | "updatedAt"> {
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
  prepareAccountDataForCreation(
    email: string,
    role: UserRole
  ): Omit<Account, "id" | "createdAt" | "updatedAt" | "userId"> {
    return {
      email: email.toLowerCase().trim(),
      role,
      isVerified: false,
    };
  }

  /**
   * SRP: Solo verificar si el usuario es administrador
   */
  isAdminUser(account: Account): boolean {
    return (
      account.role === UserRole.ADMINISTRADOR ||
      account.role === UserRole.MASTER
    );
  }
}
