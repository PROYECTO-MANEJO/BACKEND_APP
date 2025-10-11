"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUseCase = void 0;
/**
 * Caso de uso para Login
 * Principios aplicados:
 * - SRP: Solo se encarga del proceso de login
 * - DIP: Depende de abstracciones (repositorios e interfaces)
 * - OCP: Extensible para diferentes tipos de autenticación
 */
class LoginUseCase {
    constructor(userRepository, accountRepository, authService, jwtService, cryptoService) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.authService = authService;
        this.jwtService = jwtService;
        this.cryptoService = cryptoService;
    }
    async execute(request) {
        try {
            // 1. Validar entrada
            const validationResult = this.authService.validateLoginCredentials(request);
            if (!validationResult.isValid) {
                return {
                    success: false,
                    message: validationResult.errors.map((e) => e.message).join(", "),
                };
            }
            // 2. Buscar cuenta por email con datos del usuario
            const account = await this.accountRepository.findByEmailWithUser(request.email);
            if (!account) {
                return {
                    success: false,
                    message: "Email not found",
                };
            }
            // 3. Verificar que el usuario existe
            if (!account.user) {
                return {
                    success: false,
                    message: "User not found",
                };
            }
            // 4. Verificar que la cuenta está verificada
            if (!account.isVerified) {
                return {
                    success: false,
                    message: "Your account has not been verified yet. Please check your email.",
                };
            }
            // 5. Verificar contraseña
            const isPasswordValid = await this.cryptoService.comparePassword(request.password, account.user.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: "Incorrect password",
                };
            }
            // 6. Generar token JWT según el rol
            const token = this.authService.isAdminUser(account)
                ? await this.jwtService.generateAdminToken(account.user.id)
                : await this.jwtService.generateToken(account.user.id);
            // 7. Preparar respuesta exitosa
            return {
                success: true,
                message: "Login successful",
                token,
                user: {
                    id: account.user.id,
                    email: account.email,
                    firstName: account.user.firstName,
                    lastName: account.user.lastName,
                    role: account.role,
                    isVerified: account.isVerified,
                    career: account.user.career
                        ? {
                            id: account.user.career.id,
                            name: account.user.career.name,
                        }
                        : undefined,
                },
            };
        }
        catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                message: "Server error, please contact administrator",
            };
        }
    }
}
exports.LoginUseCase = LoginUseCase;
//# sourceMappingURL=LoginUseCase.js.map