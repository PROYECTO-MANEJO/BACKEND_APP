import bcrypt from "bcrypt";
import { ICryptoService } from "@application/auth/LoginUseCase";

/**
 * Implementación del servicio de criptografía usando bcrypt
 * Principios aplicados:
 * - SRP: Solo se encarga de operaciones criptográficas
 * - DIP: Implementa la interfaz ICryptoService
 */
export class CryptoService implements ICryptoService {
  private readonly saltRounds = 10;

  /**
   * SRP: Solo hashea contraseñas
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      console.error("Error hashing password:", error);
      throw new Error("Failed to hash password");
    }
  }

  /**
   * SRP: Solo compara contraseñas
   */
  async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error("Error comparing password:", error);
      throw new Error("Failed to compare password");
    }
  }

  /**
   * SRP: Solo genera salts
   */
  async generateSalt(): Promise<string> {
    try {
      return await bcrypt.genSalt(this.saltRounds);
    } catch (error) {
      console.error("Error generating salt:", error);
      throw new Error("Failed to generate salt");
    }
  }
}
