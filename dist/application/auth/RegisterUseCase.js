"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUseCase = void 0;
/**
 * Caso de uso para Registro de Usuario
 * Principios aplicados:
 * - SRP: Solo se encarga del proceso de registro
 * - DIP: Depende de abstracciones (repositorios e interfaces)
 */
class RegisterUseCase {
    constructor(userRepository, accountRepository, careerRepository, authService, cryptoService, emailService) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.careerRepository = careerRepository;
        this.authService = authService;
        this.cryptoService = cryptoService;
        this.emailService = emailService;
    }
    async execute(request) {
        try {
            // 1. Convertir request a domain object
            const registerData = {
                ...request,
                dateOfBirth: request.dateOfBirth
                    ? new Date(request.dateOfBirth)
                    : undefined,
            };
            // 2. Validar datos de entrada
            const validationResult = this.authService.validateRegistrationData(registerData);
            if (!validationResult.isValid) {
                return {
                    success: false,
                    message: validationResult.errors.map((e) => e.message).join(", "),
                };
            }
            // 3. Validar fortaleza de contraseña (reglas específicas del negocio)
            const passwordValidation = this.authService.validatePasswordStrength(registerData.password);
            if (!passwordValidation.isValid) {
                return {
                    success: false,
                    message: passwordValidation.errors[0]?.message || "Invalid password",
                };
            }
            // 4. Verificar si ya existe cuenta con el email
            const existingAccount = await this.accountRepository.findByEmail(registerData.email);
            if (existingAccount) {
                return {
                    success: false,
                    message: "An account with this email already exists",
                };
            }
            // 5. Verificar si ya existe usuario con la cédula
            const existingUser = await this.userRepository.findByCedula(registerData.cedula);
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
                const careerExists = await this.careerRepository.existsAndActive(registerData.careerId);
                if (!careerExists) {
                    return {
                        success: false,
                        message: "Selected career is not valid",
                    };
                }
            }
            // 8. Encriptar contraseña
            const hashedPassword = await this.cryptoService.hashPassword(registerData.password);
            // 9. Preparar datos para persistencia
            const userData = this.authService.prepareUserDataForCreation(registerData, hashedPassword);
            const accountData = this.authService.prepareAccountDataForCreation(registerData.email, userRole);
            // 10. Crear usuario y cuenta en transacción
            const result = await this.userRepository.createWithAccount(userData, accountData);
            // 11. Enviar token de verificación por email
            await this.emailService.sendVerificationToken(result.account.email, result.user.id);
            // 12. Respuesta exitosa (sin token de sesión)
            return {
                success: true,
                message: "A verification email has been sent to your email address. Please verify your account before logging in.",
                userId: result.user.id,
            };
        }
        catch (error) {
            console.error("Registration error:", error);
            return {
                success: false,
                message: "Server error, please contact administrator",
            };
        }
    }
}
exports.RegisterUseCase = RegisterUseCase;
//# sourceMappingURL=RegisterUseCase.js.map