import { ICryptoService } from "@application/auth/LoginUseCase";
/**
 * Implementación del servicio de criptografía usando bcrypt
 * Principios aplicados:
 * - SRP: Solo se encarga de operaciones criptográficas
 * - DIP: Implementa la interfaz ICryptoService
 */
export declare class CryptoService implements ICryptoService {
    private readonly saltRounds;
    /**
     * SRP: Solo hashea contraseñas
     */
    hashPassword(password: string): Promise<string>;
    /**
     * SRP: Solo compara contraseñas
     */
    comparePassword(password: string, hashedPassword: string): Promise<boolean>;
    /**
     * SRP: Solo genera salts
     */
    generateSalt(): Promise<string>;
}
//# sourceMappingURL=CryptoService.d.ts.map