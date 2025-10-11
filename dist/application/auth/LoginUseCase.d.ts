import { UseCase } from "@shared/interfaces/BaseInterfaces";
import { IUserRepository, IAccountRepository } from "@domain/repositories/IUserRepository";
import { AuthenticationService } from "@domain/services/AuthenticationService";
/**
 * Request/Response types para Login
 */
export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        isVerified: boolean;
        career?: {
            id: number;
            name: string;
        };
    };
}
/**
 * Caso de uso para Login
 * Principios aplicados:
 * - SRP: Solo se encarga del proceso de login
 * - DIP: Depende de abstracciones (repositorios e interfaces)
 * - OCP: Extensible para diferentes tipos de autenticación
 */
export declare class LoginUseCase implements UseCase<LoginRequest, LoginResponse> {
    private userRepository;
    private accountRepository;
    private authService;
    private jwtService;
    private cryptoService;
    constructor(userRepository: IUserRepository, accountRepository: IAccountRepository, authService: AuthenticationService, jwtService: IJWTService, cryptoService: ICryptoService);
    execute(request: LoginRequest): Promise<LoginResponse>;
}
/**
 * Interfaces para servicios externos (a implementar en infrastructure)
 */
export interface IJWTService {
    generateToken(userId: number): Promise<string>;
    generateAdminToken(userId: number): Promise<string>;
    verifyToken(token: string): Promise<{
        userId: number;
        role?: string;
    } | null>;
}
export interface ICryptoService {
    hashPassword(password: string): Promise<string>;
    comparePassword(password: string, hashedPassword: string): Promise<boolean>;
    generateSalt(): Promise<string>;
}
//# sourceMappingURL=LoginUseCase.d.ts.map