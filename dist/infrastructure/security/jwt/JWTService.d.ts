import { IJWTService } from "@application/auth/LoginUseCase";
/**
 * Implementación del servicio JWT
 * Principios aplicados:
 * - SRP: Solo se encarga de operaciones JWT
 * - DIP: Implementa la interfaz IJWTService
 */
export declare class JWTService implements IJWTService {
    private configService;
    constructor();
    /**
     * SRP: Solo genera tokens estándar
     */
    generateToken(userId: number): Promise<string>;
    /**
     * SRP: Solo genera tokens de administrador
     */
    generateAdminToken(userId: number): Promise<string>;
    /**
     * SRP: Solo verifica tokens
     */
    verifyToken(token: string): Promise<{
        userId: number;
        role?: string;
    } | null>;
}
//# sourceMappingURL=JWTService.d.ts.map