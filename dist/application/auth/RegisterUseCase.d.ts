import { UseCase } from "@shared/interfaces/BaseInterfaces";
import { IUserRepository, IAccountRepository, ICareerRepository } from "@domain/repositories/IUserRepository";
import { AuthenticationService } from "@domain/services/AuthenticationService";
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
    dateOfBirth?: string;
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
export declare class RegisterUseCase implements UseCase<RegisterRequest, RegisterResponse> {
    private userRepository;
    private accountRepository;
    private careerRepository;
    private authService;
    private cryptoService;
    private emailService;
    constructor(userRepository: IUserRepository, accountRepository: IAccountRepository, careerRepository: ICareerRepository, authService: AuthenticationService, cryptoService: ICryptoService, emailService: IEmailService);
    execute(request: RegisterRequest): Promise<RegisterResponse>;
}
/**
 * Interface para servicio de email (a implementar en infrastructure)
 */
export interface IEmailService {
    sendVerificationToken(email: string, userId: number): Promise<void>;
    sendPasswordRecovery(email: string, token: string): Promise<void>;
}
//# sourceMappingURL=RegisterUseCase.d.ts.map