import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { IHomepageRepository } from "../../domain/repositories/IHomepageRepository";
import {
  HomepageContentDTO,
  HomepageResponseDTO,
  HomepageImageRequestDTO,
  HomepageDTOTransformer,
} from "../dto/HomepageDTO";
import { HomepageService } from "../../application/services/HomepageService";

export interface AuthenticatedRequest extends Request {
  usuario?: {
    id_usu: string;
    rol: string;
    ced_usu: string;
  };
  uid?: string;
}

/**
 * ✅ LSP: Liskov Substitution Principle - Puede sustituir a BaseController sin romper funcionalidad
 * ✅ OCP: Open/Closed Principle - Abierto para extensión (nuevos métodos), cerrado para modificación
 * ✅ DIP: Dependency Inversion Principle - Depende de abstracciones (IHomepageRepository, DIContainer)
 * ✅ ISP: Interface Segregation Principle - Usa interfaces específicas, no interfaces gordas
 */
export class HomepageController extends BaseController {
  // ✅ DIP: Depende de abstracción IHomepageRepository, no de implementación concreta
  private homepageRepository: IHomepageRepository;
  private homepageService: HomepageService;

  // ✅ DIP: Inyección de dependencias a través del constructor
  constructor(private container: DIContainer) {
    super(); // ✅ LSP: Llama correctamente al constructor padre
    // ✅ DIP: Obtiene dependencias del contenedor, no las crea directamente
    this.homepageRepository = container.getHomepageRepository();
    this.homepageService = new HomepageService(container);
  }

  /**
   * GET /api/homepage/content
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   * ✅ OCP: Método puede ser extendido sin modificar BaseController
   * ✅ LSP: Cumple contrato de BaseController.execute()
   */
  public async getContent(req: Request, res: Response): Promise<void> {
    // ✅ LSP: Usa correctamente el método execute del padre
    await this.execute(req, res, async () => {
      // ✅ SRP: Delegar lógica de negocio al servicio
      // ✅ DIP: Depende de abstracción HomepageService, no de implementación concreta
      const result = await this.homepageService.getHomepageContent();

      // ✅ SRP: Si no es exitoso, lanzar error para manejo del BaseController
      if (!result.success) {
        const error: any = new Error(result.message);
        error.name = "HomepageError";
        throw error;
      }

      // ✅ SRP: Retornar datos para el BaseController
      return result.data;
    });
  }

  /**
   * PUT /api/homepage/content
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async updateContent(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    await this.execute(req, res, async () => {
      const usuarioId = req.usuario?.id_usu;
      const contentDTO: HomepageContentDTO = req.body;

      // ✅ SRP: Validaciones básicas
      if (!usuarioId) {
        const error: any = new Error("Usuario no autenticado");
        error.name = "AuthenticationError";
        throw error;
      }

      if (!contentDTO) {
        const error: any = new Error("Datos requeridos");
        error.name = "ValidationError";
        throw error;
      }

      // ✅ SRP: Validar campos básicos del DTO
      HomepageDTOTransformer.validateBasicFields(contentDTO);

      // ✅ SRP: Convertir DTO a formato del servicio
      const contentRequest = {
        ...HomepageDTOTransformer.fromContentRequestDTO(contentDTO),
        editor_id: usuarioId,
      };

      // ✅ SRP: Delegar lógica de negocio al servicio
      const result = await this.homepageService.updateHomepageContent(
        contentRequest
      );

      // ✅ SRP: Si no es exitoso, lanzar error para manejo del BaseController
      if (!result.success) {
        const error: any = new Error(result.message);
        error.name = "HomepageError";
        throw error;
      }

      // ✅ SRP: Retornar resultado exitoso
      return {
        message: result.message,
        data: result.data,
      };
    });
  }

  /**
   * POST /api/homepage/image/:imageType
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async uploadImage(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    await this.execute(req, res, async () => {
      const usuarioId = req.usuario?.id_usu;
      // Compatibilidad con ambos parámetros: imageType (nuevo) y tipoImagen (legacy)
      const imageType = req.params.imageType || req.params.tipoImagen;

      // ✅ SRP: Validaciones básicas
      if (!usuarioId) {
        const error: any = new Error("Usuario no autenticado");
        error.name = "AuthenticationError";
        throw error;
      }

      if (!req.file) {
        const error: any = new Error("No se ha proporcionado ninguna imagen");
        error.name = "ValidationError";
        throw error;
      }

      if (!imageType) {
        const error: any = new Error("Tipo de imagen requerido");
        error.name = "ValidationError";
        throw error;
      }

      // ✅ SRP: Normalizar nombre del tipo de imagen para compatibilidad
      let normalizedType = imageType;
      if (imageType === "imagen_hero") normalizedType = "hero";
      else if (imageType.startsWith("imagen_")) {
        normalizedType = imageType.replace("imagen_", "");
      }

      // ✅ SRP: Crear DTO de imagen
      const imageDTO: HomepageImageRequestDTO = {
        imageType: normalizedType,
        imageFile: {
          buffer: req.file.buffer,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
      };

      // ✅ SRP: Validar campos básicos
      HomepageDTOTransformer.validateBasicFields(imageDTO);

      // ✅ SRP: Convertir DTO a formato del servicio
      const imageRequest = {
        ...HomepageDTOTransformer.fromImageRequestDTO(imageDTO),
        editor_id: usuarioId,
      };

      // ✅ SRP: Delegar lógica de negocio al servicio
      const result = await this.homepageService.updateHomepageImage(
        imageRequest
      );

      // ✅ SRP: Si no es exitoso, lanzar error para manejo del BaseController
      if (!result.success) {
        const error: any = new Error(result.message);
        error.name = "HomepageError";
        throw error;
      }

      // ✅ SRP: Retornar resultado exitoso
      return {
        message: result.message,
        imageUrl: `/api/homepage/image/${normalizedType}?t=${Date.now()}`,
      };
    });
  }

  /**
   * GET /api/homepage/image/:imageType
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async getImage(req: Request, res: Response): Promise<void> {
    try {
      // Compatibilidad con ambos parámetros: imageType (nuevo) y tipoImagen (legacy)
      let imageType = req.params.imageType || req.params.tipoImagen;

      if (!imageType) {
        res.status(400).json({
          success: false,
          message: "Tipo de imagen requerido",
        });
        return;
      }

      // ✅ SRP: Normalizar nombre del tipo de imagen para compatibilidad
      if (imageType === "imagen_hero") imageType = "hero";
      else if (imageType.startsWith("imagen_")) {
        imageType = imageType.replace("imagen_", "");
      }

      // ✅ SRP: Delegar lógica de negocio al servicio
      const result = await this.homepageService.getHomepageImage(imageType);

      // ✅ SRP: Si no es exitoso, manejar error
      if (!result.success) {
        const statusCode = result.message?.includes("no encontrada")
          ? 404
          : 500;
        res.status(statusCode).json({
          success: false,
          message: result.message,
        });
        return;
      }

      // ✅ SRP: Determinar tipo de contenido (lógica simple mantenida en controller)
      const buffer = result.data;
      let contentType = "image/jpeg"; // default

      // Detectar tipo por magic numbers
      if (buffer[0] === 0xff && buffer[1] === 0xd8) {
        contentType = "image/jpeg";
      } else if (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      ) {
        contentType = "image/png";
      } else if (
        buffer[0] === 0x47 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46
      ) {
        contentType = "image/gif";
      } else if (
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46
      ) {
        contentType = "image/webp";
      }

      // ✅ SRP: Configurar respuesta HTTP para imagen
      res.set("Content-Type", contentType);
      res.set("Cache-Control", "public, max-age=31536000"); // Cache por 1 año
      res.send(buffer);
    } catch (error: any) {
      console.error("[getImage] Error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * GET /api/homepage/public-content
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async getPublicContent(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      // ✅ SRP: Delegar lógica de negocio al servicio
      const result = await this.homepageService.getPublicContent();

      // ✅ SRP: Si no es exitoso, lanzar error para manejo del BaseController
      if (!result.success) {
        const error: any = new Error(result.message);
        error.name = "HomepageError";
        throw error;
      }

      // ✅ SRP: Retornar datos en el formato que espera el frontend (eventos y cursos en la raíz)
      return result.data;
    });
  }

  /**
   * GET /api/homepage/student-content
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async getStudentContent(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    await this.execute(req, res, async () => {
      const userId = req.uid;

      // ✅ SRP: Validación básica
      if (!userId) {
        const error: any = new Error("Usuario no autenticado");
        error.name = "AuthenticationError";
        throw error;
      }

      // ✅ SRP: Delegar lógica de negocio al servicio
      const result = await this.homepageService.getStudentContent(userId);

      // ✅ SRP: Si no es exitoso, lanzar error para manejo del BaseController
      if (!result.success) {
        const error: any = new Error(result.message);
        error.name = "HomepageError";
        throw error;
      }

      // ✅ SRP: Retornar datos en el formato que espera el frontend (eventos y cursos en la raíz)
      return result.data;
    });
  }

  /**
   * GET /api/homepage/external-content
   * ✅ SRP: Solo maneja HTTP request/response, delega todo lo demás
   */
  public async getExternalContent(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      // ✅ SRP: Delegar lógica de negocio al servicio
      const result = await this.homepageService.getExternalContent();

      // ✅ SRP: Si no es exitoso, lanzar error para manejo del BaseController
      if (!result.success) {
        const error: any = new Error(result.message);
        error.name = "HomepageError";
        throw error;
      }

      // ✅ SRP: Retornar datos en el formato que espera el frontend (eventos y cursos en la raíz)
      return result.data;
    });
  }
}
