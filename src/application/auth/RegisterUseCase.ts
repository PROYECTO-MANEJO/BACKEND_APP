import { UseCase } from "@shared/interfaces/BaseInterfaces";
import {
  IUserRepository,
  IAccountRepository,
  ICareerRepository,
} from "@domain/repositories/IUserRepository";
import { AuthenticationService } from "@domain/services/AuthenticationService";
import { RegisterUserData, UserRole } from "@domain/entities/User";
import { ICryptoService } from "./LoginUseCase";

/**
 * Request/Response types para Register
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  secondName?: string;
  lastName: string;
  secondLastName?: string;
  cedula: string;
  dateOfBirth?: string; // Como string desde el frontend
  careerId?: number;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: number;
}

/**
 * Caso de uso para Registro de Usuario
 * Principios aplicados:
 * - SRP: Solo se encarga del proceso de registro
 * - DIP: Depende de abstracciones (repositorios e interfaces)
 */
export class RegisterUseCase
  implements UseCase<RegisterRequest, RegisterResponse>
{
  constructor(
    private userRepository: IUserRepository,
    private accountRepository: IAccountRepository,
    private careerRepository: ICareerRepository,
    private authService: AuthenticationService,
    private cryptoService: ICryptoService,
    private emailService: IEmailService
  ) {}

  async execute(request: RegisterRequest): Promise<RegisterResponse> {
    try {
      // 1. Convertir request a domain object
      const registerData: RegisterUserData = {
        ...request,
        dateOfBirth: request.dateOfBirth
          ? new Date(request.dateOfBirth)
          : undefined,
      };

      // 2. Validar datos de entrada
      const validationResult =
        this.authService.validateRegistrationData(registerData);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.errors.map((e) => e.message).join(", "),
        };
      }

      // 3. Validar fortaleza de contraseña (reglas específicas del negocio)
      const passwordValidation = this.authService.validatePasswordStrength(
        registerData.password
      );
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: passwordValidation.errors[0]?.message || "Invalid password",
        };
      }

      // 4. Verificar si ya existe cuenta con el email
      const existingAccount = await this.accountRepository.findByEmail(
        registerData.email
      );
      if (existingAccount) {
        return {
          success: false,
          message: "An account with this email already exists",
        };
      }

      // 5. Verificar si ya existe usuario con la cédula
      const existingUser = await this.userRepository.findByCedula(
        registerData.cedula
      );
      if (existingUser) {
        return {
          success: false,
          message: "A user with this cedula already exists",
        };
      }

      // 6. Determinar rol automáticamente
      const userRole = this.authService.determineUserRole(registerData.email);

      // 7. Validar carrera para usuarios UTA
      if (this.authService.isCareerRequired(registerData.email)) {
        if (!registerData.careerId) {
          return {
            success: false,
            message: "Career is required for UTA students",
          };
        }

        const careerExists = await this.careerRepository.existsAndActive(
          registerData.careerId
        );
        if (!careerExists) {
          return {
            success: false,
            message: "Selected career is not valid",
          };
        }
      }

      // 8. Encriptar contraseña
      const hashedPassword = await this.cryptoService.hashPassword(
        registerData.password
      );

      // 9. Preparar datos para persistencia
      const userData = this.authService.prepareUserDataForCreation(
        registerData,
        hashedPassword
      );
      const accountData = this.authService.prepareAccountDataForCreation(
        registerData.email,
        userRole
      );

      // 10. Crear usuario y cuenta en transacción
      const result = await this.userRepository.createWithAccount(
        userData,
        accountData
      );

      // 11. Enviar token de verificación por email
      await this.emailService.sendVerificationToken(
        result.account.email,
        result.user.id
      );

      // 12. Respuesta exitosa (sin token de sesión)
      return {
        success: true,
        message:
          "A verification email has been sent to your email address. Please verify your account before logging in.",
        userId: result.user.id,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: "Server error, please contact administrator",
      };
    }
  }
}

/**
 * Interface para servicio de email (a implementar en infrastructure)
 */
export interface IEmailService {
  sendVerificationToken(email: string, userId: number): Promise<void>;
  sendPasswordRecovery(email: string, token: string): Promise<void>;
}
