import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { AuthService } from "../../application/services/AuthService";
import {
  AuthDTOTransformer,
  LoginRequestDTO,
  RegisterRequestDTO,
  CreateAdminRequestDTO,
} from "../dto/AuthDTO";

/**
 * Auth Controller - Presentation Layer
 *
 * ✅ SRP: Responsabilidad única - Manejo de HTTP requests/responses para autenticación
 * - Delega validaciones a AuthValidator
 * - Delega lógica de negocio a AuthService
 * - Delega transformaciones a AuthDTOTransformer
 */
export class AuthController extends BaseController {
  private authService: AuthService;
  private container: DIContainer;

  constructor(container: DIContainer) {
    super();
    this.container = container;
    this.authService = new AuthService(container);
  }

  /**
   * POST /api/auth/login
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async login(req: Request, res: Response): Promise<void> {
    try {
      // ✅ SRP: Transformar DTO de entrada
      const loginDTO: LoginRequestDTO = {
        email: req.body.email,
        password: req.body.password,
      };

      // ✅ SRP: Validar campos básicos
      AuthDTOTransformer.validateBasicFields(loginDTO);

      // ✅ SRP: Convertir DTO a formato del servicio
      const loginRequest = AuthDTOTransformer.fromLoginDTO(loginDTO);

      // ✅ SRP: Delegar lógica de negocio al servicio
      const result = await this.authService.login(loginRequest);

      // ✅ SRP: Si no es exitoso, manejar error
      if (!result.success) {
        const status =
          result.message === "Email not found" ||
          result.message === "Incorrect password"
            ? 400
            : 500;

        res.status(status).json({
          success: false,
          message: result.message,
        });
        return;
      }

      // ✅ SRP: Respuesta exitosa con estructura esperada por el frontend
      res.status(200).json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * POST /api/auth/register
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async register(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      // ✅ SRP: Transformar DTO de entrada (mapeo flexible para diferentes nombres de campos)
      const registerDTO: RegisterRequestDTO = {
        email:
          req.body.email ||
          req.body.correo_electronico ||
          req.body.correoElectronico,
        password:
          req.body.password || req.body.contrasena || req.body.contraseña,
        nombre: req.body.firstName || req.body.nombre || req.body.primer_nombre,
        nombre2:
          req.body.secondName || req.body.nombre2 || req.body.segundo_nombre,
        apellido:
          req.body.lastName || req.body.apellido || req.body.primer_apellido,
        apellido2:
          req.body.secondLastName ||
          req.body.apellido2 ||
          req.body.segundo_apellido,
        ced_usu:
          req.body.cedula ||
          req.body.ced_usu ||
          req.body.dni ||
          req.body.identificacion,
        fec_nac_usu:
          req.body.fec_nac_usu ||
          req.body.fecha_nacimiento ||
          req.body.fechaNacimiento,
        carrera: req.body.carrera || req.body.id_carrera || req.body.idCarrera,
      };

      // ✅ SRP: Validar campos básicos
      AuthDTOTransformer.validateBasicFields(registerDTO);

      // ✅ SRP: Convertir DTO a formato del servicio
      const registerRequest = AuthDTOTransformer.fromRegisterDTO(registerDTO);

      // ✅ SRP: Delegar lógica de negocio al servicio
      const result = await this.authService.register(registerRequest);

      // ✅ SRP: Si no es exitoso, lanzar error para manejo del BaseController
      if (!result.success) {
        const error: any = new Error(result.message);
        if (
          result.message?.includes("already exists") ||
          result.message?.includes("required") ||
          result.message?.includes("not valid")
        ) {
          error.name = "ValidationError";
        }
        throw error;
      }

      // ✅ SRP: Devolver resultado para que BaseController use 200
      // Luego cambiaremos la respuesta a 201 manualmente
      return { message: result.message };
    });

    // Si llegamos aquí, fue exitoso, cambiar a 201
    if (res.statusCode === 200) {
      res.status(201);
    }
  }
  /**
   * Simple implementations for other auth methods
   */
  public async logout(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      return { message: "Session closed successfully" };
    });
  }

  public async getProfile(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      return { message: "Get profile not implemented yet" };
    });
  }

  public async updateProfile(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      return { message: "Update profile not implemented yet" };
    });
  }

  public async changePassword(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      return { message: "Change password not implemented yet" };
    });
  }

  public async forgotPassword(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      return { message: "Forgot password not implemented yet" };
    });
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      return { message: "Reset password not implemented yet" };
    });
  }

  public async verifyEmail(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      return { message: "Email verification not implemented yet" };
    });
  }

  public async resendVerification(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      return { message: "Resend verification not implemented yet" };
    });
  }

  public async refreshToken(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      return { message: "Refresh token not implemented yet" };
    });
  }

  /**
   * POST /api/auth/createAdmin
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async createAdmin(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      // ✅ SRP: Transformar DTO de entrada
      const createAdminDTO: CreateAdminRequestDTO = {
        ced_usu: req.body.ced_usu,
        nom_usu1: req.body.nom_usu1,
        nom_usu2: req.body.nom_usu2,
        ape_usu1: req.body.ape_usu1,
        ape_usu2: req.body.ape_usu2,
        cor_cue: req.body.cor_cue,
        pas_usu: req.body.pas_usu,
        fec_nac_usu: req.body.fec_nac_usu,
        num_tel_usu: req.body.num_tel_usu,
      };

      // ✅ SRP: Validar campos básicos
      AuthDTOTransformer.validateBasicFields(createAdminDTO);

      // ✅ SRP: Convertir DTO a formato del servicio
      const createAdminRequest =
        AuthDTOTransformer.fromCreateAdminDTO(createAdminDTO);

      // ✅ SRP: Delegar lógica de negocio al servicio
      const result = await this.authService.createAdmin(createAdminRequest);

      // ✅ SRP: Si no es exitoso, lanzar error para manejo del BaseController
      if (!result.success) {
        const error: any = new Error(result.message);
        if (
          result.message?.includes("ya existe") ||
          result.message?.includes("requeridos") ||
          result.message?.includes("inválida")
        ) {
          error.name = "ValidationError";
        }
        throw error;
      }

      // ✅ SRP: Transformar respuesta usando DTO
      const responseData = AuthDTOTransformer.toResponseDTO(result);

      // ✅ SRP: Devolver resultado para que BaseController use 200
      return {
        message: result.message,
        data: responseData.user,
      };
    });

    // Si llegamos aquí, fue exitoso, cambiar a 201
    if (res.statusCode === 200) {
      res.status(201);
    }
  }
}
