import { sign, verify, SignOptions } from "jsonwebtoken";
import { IJWTService } from "@application/auth/LoginUseCase";
import { ConfigService } from "@shared/config/ConfigService";
import { JWT_CONFIG } from "@shared/constants/AppConstants";

/**
 * Implementación del servicio JWT
 * Principios aplicados:
 * - SRP: Solo se encarga de operaciones JWT
 * - DIP: Implementa la interfaz IJWTService
 */
export class JWTService implements IJWTService {
  private configService: ConfigService;

  constructor() {
    this.configService = ConfigService.getInstance();
  }

  /**
   * SRP: Solo genera tokens estándar
   */
  async generateToken(userId: number): Promise<string> {
    try {
      const config = this.configService.getConfig();

      const payload = {
        userId,
        role: "USER",
        iat: Math.floor(Date.now() / 1000),
        iss: JWT_CONFIG.ISSUER,
      };

      return sign(payload, config.jwtSecret, {
        expiresIn: "24h",
        algorithm: "HS256",
      });
    } catch (error) {
      console.error("Error generating token:", error);
      throw new Error("Failed to generate token");
    }
  }

  /**
   * SRP: Solo genera tokens de administrador
   */
  async generateAdminToken(userId: number): Promise<string> {
    try {
      const config = this.configService.getConfig();

      const payload = {
        userId,
        role: "ADMIN",
        iat: Math.floor(Date.now() / 1000),
        iss: JWT_CONFIG.ISSUER,
      };

      return sign(payload, config.jwtSecret, {
        expiresIn: "24h",
        algorithm: "HS256",
      });
    } catch (error) {
      console.error("Error generating admin token:", error);
      throw new Error("Failed to generate admin token");
    }
  }

  /**
   * SRP: Solo verifica tokens
   */
  async verifyToken(
    token: string
  ): Promise<{ userId: number; role?: string } | null> {
    try {
      const config = this.configService.getConfig();

      const decoded = verify(token, config.jwtSecret, {
        algorithms: ["HS256"],
        issuer: JWT_CONFIG.ISSUER,
      }) as any;

      return {
        userId: decoded.userId,
        role: decoded.role,
      };
    } catch (error) {
      console.error("Error verifying token:", error);
      return null;
    }
  }
}
