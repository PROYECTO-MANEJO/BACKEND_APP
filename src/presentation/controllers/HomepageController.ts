import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { IHomepageRepository } from "../../domain/repositories/IHomepageRepository";
import { HomepageContentDTO, HomepageResponseDTO } from "../dto/HomepageDTO";

export interface AuthenticatedRequest extends Request {
  usuario?: {
    id_usu: string;
    rol: string;
    ced_usu: string;
  };
  uid?: string;
}

export class HomepageController extends BaseController {
  private homepageRepository: IHomepageRepository;

  constructor(private container: DIContainer) {
    super();
    this.homepageRepository = container.getHomepageRepository();
  }

  /**
   * GET /api/homepage/content
   * Obtener contenido de la página principal
   */
  public async getContent(req: Request, res: Response): Promise<void> {
    try {
      // Buscar contenido o crear por defecto usando el repositorio
      let homepageContent = await this.homepageRepository.getContent();

      if (!homepageContent) {
        homepageContent = await this.homepageRepository.createDefaultContent();
      }

      // Convertir entidad del dominio a respuesta HTTP
      const sections = homepageContent.getSections();
      const footerTexts = homepageContent.getFooterTexts();
      const images = homepageContent.getImages();
      const lastEditor = homepageContent.getLastEditor();

      const response: HomepageResponseDTO = {
        id_pag: parseInt(homepageContent.getId()),
        titulo_hero: homepageContent.getHeroTitle(),
        subtitulo_hero: homepageContent.getHeroSubtitle(),
        descripcion_hero: homepageContent.getHeroDescription(),
        titulo_ofrecemos: homepageContent.getOfferTitle(),
        subtitulo_ofrecemos: homepageContent.getOfferSubtitle(),
        titulo_seccion1: sections[0]?.title || "",
        descripcion_seccion1: sections[0]?.description || "",
        titulo_seccion2: sections[1]?.title || "",
        descripcion_seccion2: sections[1]?.description || "",
        titulo_seccion3: sections[2]?.title || "",
        descripcion_seccion3: sections[2]?.description || "",
        titulo_seccion4: sections[3]?.title || "",
        descripcion_seccion4: sections[3]?.description || "",
        texto_footer1: footerTexts.text1,
        texto_footer2: footerTexts.text2,
        texto_footer3: footerTexts.text3,
        imagen_hero: images.hero
          ? `/api/homepage/image/hero?t=${Date.now()}`
          : undefined,
        imagen_seccion1: images.seccion1
          ? `/api/homepage/image/seccion1?t=${Date.now()}`
          : undefined,
        imagen_seccion2: images.seccion2
          ? `/api/homepage/image/seccion2?t=${Date.now()}`
          : undefined,
        imagen_seccion3: images.seccion3
          ? `/api/homepage/image/seccion3?t=${Date.now()}`
          : undefined,
        imagen_seccion4: images.seccion4
          ? `/api/homepage/image/seccion4?t=${Date.now()}`
          : undefined,
        ultimoEditor: lastEditor.name
          ? {
              nom_usu1: lastEditor.name.split(" ")[0] || "",
              ape_usu1: lastEditor.name.split(" ")[1] || "",
            }
          : undefined,
        fecha_actualizacion: homepageContent.getLastUpdateDate(),
        fecha_creacion: homepageContent.getCreatedAt(),
      };

      res.json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      console.error("[getContent] Error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * PUT /api/homepage/content
   * Actualizar contenido de la página principal
   */
  public async updateContent(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const usuarioId = req.usuario?.id_usu;
      const data: HomepageContentDTO = req.body;

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      if (!data) {
        res.status(400).json({
          success: false,
          message: "Datos requeridos",
        });
        return;
      }

      // Mapear datos del DTO al formato del dominio
      const contentData = {
        heroTitle: data.titulo_hero,
        heroSubtitle: data.subtitulo_hero,
        heroDescription: data.descripcion_hero,
        offerTitle: data.titulo_ofrecemos,
        offerSubtitle: data.subtitulo_ofrecemos,
        footerText1: data.texto_footer1,
        footerText2: data.texto_footer2,
        footerText3: data.texto_footer3,
        // Mapear secciones si están presentes
        sections: [
          {
            id: "1",
            title: data.titulo_seccion1 || "",
            description: data.descripcion_seccion1 || "",
            order: 1,
            isVisible: true,
          },
          {
            id: "2",
            title: data.titulo_seccion2 || "",
            description: data.descripcion_seccion2 || "",
            order: 2,
            isVisible: true,
          },
          {
            id: "3",
            title: data.titulo_seccion3 || "",
            description: data.descripcion_seccion3 || "",
            order: 3,
            isVisible: true,
          },
          {
            id: "4",
            title: data.titulo_seccion4 || "",
            description: data.descripcion_seccion4 || "",
            order: 4,
            isVisible: true,
          },
        ].filter((section) => section.title || section.description),
      };

      // Actualizar usando el repositorio
      const updatedContent = await this.homepageRepository.updateContent(
        contentData,
        usuarioId
      );

      // Convertir entidad del dominio a respuesta HTTP
      const sections = updatedContent.getSections();
      const footerTexts = updatedContent.getFooterTexts();
      const images = updatedContent.getImages();
      const lastEditor = updatedContent.getLastEditor();

      const response: HomepageResponseDTO = {
        id_pag: parseInt(updatedContent.getId()),
        titulo_hero: updatedContent.getHeroTitle(),
        subtitulo_hero: updatedContent.getHeroSubtitle(),
        descripcion_hero: updatedContent.getHeroDescription(),
        titulo_ofrecemos: updatedContent.getOfferTitle(),
        subtitulo_ofrecemos: updatedContent.getOfferSubtitle(),
        titulo_seccion1: sections[0]?.title || "",
        descripcion_seccion1: sections[0]?.description || "",
        titulo_seccion2: sections[1]?.title || "",
        descripcion_seccion2: sections[1]?.description || "",
        titulo_seccion3: sections[2]?.title || "",
        descripcion_seccion3: sections[2]?.description || "",
        titulo_seccion4: sections[3]?.title || "",
        descripcion_seccion4: sections[3]?.description || "",
        texto_footer1: footerTexts.text1,
        texto_footer2: footerTexts.text2,
        texto_footer3: footerTexts.text3,
        imagen_hero: images.hero
          ? `/api/homepage/image/hero?t=${Date.now()}`
          : undefined,
        imagen_seccion1: images.seccion1
          ? `/api/homepage/image/seccion1?t=${Date.now()}`
          : undefined,
        imagen_seccion2: images.seccion2
          ? `/api/homepage/image/seccion2?t=${Date.now()}`
          : undefined,
        imagen_seccion3: images.seccion3
          ? `/api/homepage/image/seccion3?t=${Date.now()}`
          : undefined,
        imagen_seccion4: images.seccion4
          ? `/api/homepage/image/seccion4?t=${Date.now()}`
          : undefined,
        ultimoEditor: lastEditor.name
          ? {
              nom_usu1: lastEditor.name.split(" ")[0] || "",
              ape_usu1: lastEditor.name.split(" ")[1] || "",
            }
          : undefined,
        fecha_actualizacion: updatedContent.getLastUpdateDate(),
        fecha_creacion: updatedContent.getCreatedAt(),
      };

      res.json({
        success: true,
        message: "Contenido actualizado exitosamente",
        data: response,
      });
    } catch (error: any) {
      console.error("[updateContent] Error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * POST /api/homepage/image/:imageType (o /api/pagina-principal/imagen/:tipoImagen)
   * Subir imagen específica
   */
  public async uploadImage(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      // Compatibilidad con ambos parámetros: imageType (nuevo) y tipoImagen (legacy)
      const imageType = req.params.imageType || req.params.tipoImagen;
      const usuarioId = req.usuario?.id_usu;

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "No se ha proporcionado ninguna imagen",
        });
        return;
      }

      if (!imageType) {
        res.status(400).json({
          success: false,
          message: "Tipo de imagen requerido",
        });
        return;
      }

      // Validar tipo de imagen
      const tiposPermitidos = [
        "imagen_hero",
        "imagen_seccion1",
        "imagen_seccion2",
        "imagen_seccion3",
        "imagen_seccion4",
      ];
      if (!tiposPermitidos.includes(imageType)) {
        res.status(400).json({
          success: false,
          message: "Tipo de imagen no válido",
        });
        return;
      }

      // Normalizar nombre del tipo de imagen
      let normalizedType = imageType;
      if (imageType === "imagen_hero") normalizedType = "hero";
      else if (imageType.startsWith("imagen_"))
        normalizedType = imageType.replace("imagen_", "");

      // Validar tipo de archivo
      if (!req.file.mimetype.startsWith("image/")) {
        res.status(400).json({
          success: false,
          message: "El archivo debe ser una imagen",
        });
        return;
      }

      // Actualizar imagen usando el repositorio
      await this.homepageRepository.updateImage(
        normalizedType,
        req.file.buffer,
        req.file.mimetype,
        usuarioId
      );

      res.json({
        success: true,
        message: "Imagen subida exitosamente",
        imageUrl: `/api/homepage/image/${normalizedType}?t=${Date.now()}`,
      });
    } catch (error: any) {
      console.error("[uploadImage] Error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/homepage/image/:imageType (o /api/pagina-principal/imagen/:tipoImagen)
   * Obtener imagen específica
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

      // Normalizar nombre del tipo de imagen
      if (imageType === "imagen_hero") imageType = "hero";
      else if (imageType.startsWith("imagen_"))
        imageType = imageType.replace("imagen_", "");

      // Obtener imagen usando el repositorio
      const imageSection = await this.homepageRepository.getImageByType(
        imageType
      );

      if (!imageSection || !imageSection.buffer) {
        res.status(404).json({
          success: false,
          message: "Imagen no encontrada",
        });
        return;
      }

      // Determinar tipo de contenido basado en los primeros bytes
      let contentType = imageSection.mimeType || "image/jpeg"; // usar el tipo almacenado o default

      // Si no hay mimeType almacenado, detectar por magic numbers
      if (!imageSection.mimeType) {
        const buffer = imageSection.buffer;
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
      }

      res.set("Content-Type", contentType);
      res.set("Cache-Control", "public, max-age=31536000"); // Cache por 1 año
      res.send(imageSection.buffer);
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
   * Obtener eventos y cursos para usuarios NO autenticados (Homepage sin login)
   */
  public async getPublicContent(req: Request, res: Response): Promise<void> {
    try {
      console.log("Obteniendo eventos y cursos para usuario no autenticado");
      const prisma = this.container.getPrismaClient();

      // Obtener todos los eventos activos
      const eventos = await prisma.evento.findMany({
        where: {
          estado: "ACTIVO",
        },
        select: {
          id_eve: true,
          nom_eve: true,
          des_eve: true,
          fec_ini_eve: true,
          fec_fin_eve: true,
          hor_ini_eve: true,
          hor_fin_eve: true,
          ubi_eve: true,
          dur_eve: true,
          capacidad_max_eve: true,
          es_gratuito: true,
          precio: true,
          tipo_audiencia_eve: true,
          categoria: {
            select: {
              nom_cat: true,
            },
          },
          eventosPorCarrera: {
            select: {
              carrera: {
                select: {
                  nom_car: true,
                },
              },
            },
          },
          inscripciones: {
            where: {
              estado_pago: "APROBADO",
            },
            select: {
              id_ins: true,
            },
          },
        },
        orderBy: {
          fec_ini_eve: "asc",
        },
        take: 8,
      });

      // Obtener todos los cursos activos
      const cursos = await prisma.curso.findMany({
        where: {
          estado: "ACTIVO",
        },
        select: {
          id_cur: true,
          nom_cur: true,
          des_cur: true,
          fec_ini_cur: true,
          fec_fin_cur: true,
          dur_cur: true,
          capacidad_max_cur: true,
          es_gratuito: true,
          precio: true,
          tipo_audiencia_cur: true,
          requiere_verificacion_docs: true,
          categoria: {
            select: {
              nom_cat: true,
            },
          },
          cursosPorCarrera: {
            select: {
              carrera: {
                select: {
                  nom_car: true,
                },
              },
            },
          },
          inscripcionesCurso: {
            where: {
              estado_pago_cur: "APROBADO",
            },
            select: {
              id_ins_cur: true,
            },
          },
        },
        orderBy: {
          fec_ini_cur: "asc",
        },
        take: 8,
      });

      console.log(`Eventos públicos encontrados: ${eventos.length}`);
      console.log(`Cursos públicos encontrados: ${cursos.length}`);

      res.json({
        success: true,
        eventos,
        cursos,
      });
    } catch (error: any) {
      console.error("[getPublicContent] Error:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener eventos y cursos",
      });
    }
  }

  /**
   * GET /api/homepage/student-content
   * Obtener eventos y cursos para ESTUDIANTES (por carrera + públicos)
   */
  public async getStudentContent(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.uid;
      console.log("ID de usuario ESTUDIANTE:", userId);

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      const prisma = this.container.getPrismaClient();

      // Obtener la carrera del usuario
      const usuario = await prisma.usuario.findUnique({
        where: { id_usu: userId },
        select: {
          id_car_per: true,
          carrera: {
            select: {
              nom_car: true,
            },
          },
        },
      });

      console.log("Datos del usuario:", usuario);

      // Si el usuario no tiene carrera asignada, mostrar solo contenido público
      if (!usuario || !usuario.id_car_per) {
        console.log(
          "Usuario sin carrera asignada, mostrando contenido público y para todas las carreras"
        );

        // Obtener eventos públicos y para todas las carreras
        const eventosPublicos = await prisma.evento.findMany({
          where: {
            estado: "ACTIVO",
            OR: [
              { tipo_audiencia_eve: "PUBLICO_GENERAL" },
              { tipo_audiencia_eve: "TODAS_CARRERAS" }, // ✅ Agregar eventos para todas las carreras
            ],
            fec_fin_eve: {
              gte: new Date(),
            },
          },
          include: {
            categoria: {
              select: {
                nom_cat: true,
              },
            },
          },
          orderBy: { fec_ini_eve: "asc" },
        });

        // Obtener cursos públicos y para todas las carreras
        const cursosPublicos = await prisma.curso.findMany({
          where: {
            estado: "ACTIVO",
            OR: [
              { tipo_audiencia_cur: "PUBLICO_GENERAL" },
              { tipo_audiencia_cur: "TODAS_CARRERAS" }, // ✅ Agregar cursos para todas las carreras
            ],
            fec_fin_cur: {
              gte: new Date(),
            },
          },
          include: {
            categoria: {
              select: {
                nom_cat: true,
              },
            },
          },
          orderBy: { fec_ini_cur: "asc" },
        });

        res.json({
          success: true,
          eventos: eventosPublicos.map((evento) => ({
            id_eve: evento.id_eve,
            nom_eve: evento.nom_eve,
            des_eve: evento.des_eve,
            fec_ini_eve: evento.fec_ini_eve,
            fec_fin_eve: evento.fec_fin_eve,
            hor_ini_eve: evento.hor_ini_eve,
            hor_fin_eve: evento.hor_fin_eve,
            ubi_eve: evento.ubi_eve,
            capacidad_max_eve: evento.capacidad_max_eve,
            es_gratuito: evento.es_gratuito,
            precio: evento.precio,
            categoria: evento.categoria?.nom_cat,
            tipo_audiencia: evento.tipo_audiencia_eve,
          })),
          cursos: cursosPublicos.map((curso) => ({
            id_cur: curso.id_cur,
            nom_cur: curso.nom_cur,
            des_cur: curso.des_cur,
            fec_ini_cur: curso.fec_ini_cur,
            fec_fin_cur: curso.fec_fin_cur,
            dur_cur: curso.dur_cur,
            capacidad_max_cur: curso.capacidad_max_cur,
            es_gratuito: curso.es_gratuito,
            precio: curso.precio,
            categoria: curso.categoria?.nom_cat,
            tipo_audiencia: curso.tipo_audiencia_cur,
          })),
          carrera: null,
          mensaje:
            "Mostrando contenido público y para todas las carreras (usuario sin carrera asignada)",
        });
        return;
      }

      // Obtener eventos para el estudiante
      const eventos = await prisma.evento.findMany({
        where: {
          estado: "ACTIVO",
          OR: [
            // Eventos públicos para todos
            { tipo_audiencia_eve: "PUBLICO_GENERAL" },
            // Eventos para todas las carreras
            { tipo_audiencia_eve: "TODAS_CARRERAS" },
            // Eventos específicos para mi carrera
            {
              AND: [
                { tipo_audiencia_eve: "CARRERA_ESPECIFICA" },
                {
                  eventosPorCarrera: {
                    some: {
                      id_car_per: usuario.id_car_per,
                    },
                  },
                },
              ],
            },
          ],
        },
        select: {
          id_eve: true,
          nom_eve: true,
          des_eve: true,
          fec_ini_eve: true,
          fec_fin_eve: true,
          hor_ini_eve: true,
          hor_fin_eve: true,
          ubi_eve: true,
          dur_eve: true,
          capacidad_max_eve: true,
          es_gratuito: true,
          precio: true,
          tipo_audiencia_eve: true,
          categoria: {
            select: {
              nom_cat: true,
            },
          },
          eventosPorCarrera: {
            select: {
              carrera: {
                select: {
                  nom_car: true,
                },
              },
            },
          },
          inscripciones: {
            where: {
              estado_pago: "APROBADO",
            },
            select: {
              id_ins: true,
            },
          },
        },
        orderBy: {
          fec_ini_eve: "asc",
        },
      });

      // Obtener cursos para el estudiante
      const cursos = await prisma.curso.findMany({
        where: {
          estado: "ACTIVO",
          OR: [
            // Cursos públicos para todos
            { tipo_audiencia_cur: "PUBLICO_GENERAL" },
            // Cursos para todas las carreras
            { tipo_audiencia_cur: "TODAS_CARRERAS" },
            // Cursos específicos para mi carrera
            {
              AND: [
                { tipo_audiencia_cur: "CARRERA_ESPECIFICA" },
                {
                  cursosPorCarrera: {
                    some: {
                      id_car_per: usuario.id_car_per,
                    },
                  },
                },
              ],
            },
          ],
        },
        select: {
          id_cur: true,
          nom_cur: true,
          des_cur: true,
          fec_ini_cur: true,
          fec_fin_cur: true,
          dur_cur: true,
          capacidad_max_cur: true,
          es_gratuito: true,
          precio: true,
          tipo_audiencia_cur: true,
          requiere_verificacion_docs: true,
          categoria: {
            select: {
              nom_cat: true,
            },
          },
          cursosPorCarrera: {
            select: {
              carrera: {
                select: {
                  nom_car: true,
                },
              },
            },
          },
          inscripcionesCurso: {
            where: {
              estado_pago_cur: "APROBADO",
            },
            select: {
              id_ins_cur: true,
            },
          },
        },
        orderBy: {
          fec_ini_cur: "asc",
        },
      });

      console.log(`Eventos encontrados para estudiante: ${eventos.length}`);
      console.log(`Cursos encontrados para estudiante: ${cursos.length}`);

      res.json({
        success: true,
        eventos,
        cursos,
        carrera: usuario.carrera?.nom_car,
      });
    } catch (error: any) {
      console.error("[getStudentContent] Error:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener eventos y cursos",
      });
    }
  }

  /**
   * GET /api/homepage/external-content
   * Obtener eventos y cursos para USUARIOS EXTERNOS (solo públicos)
   */
  public async getExternalContent(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "Obteniendo eventos y cursos para USUARIO EXTERNO (incluyendo TODAS_CARRERAS)"
      );
      const prisma = this.container.getPrismaClient();

      // Eventos públicos y para todas las carreras para usuarios externos
      const eventos = await prisma.evento.findMany({
        where: {
          estado: "ACTIVO",
          OR: [
            { tipo_audiencia_eve: "PUBLICO_GENERAL" },
            { tipo_audiencia_eve: "TODAS_CARRERAS" }, // ✅ Agregar eventos para todas las carreras
          ],
          fec_ini_eve: {
            gte: new Date(), // Solo eventos futuros
          },
        },
        select: {
          id_eve: true,
          nom_eve: true,
          des_eve: true,
          fec_ini_eve: true,
          fec_fin_eve: true,
          hor_ini_eve: true,
          hor_fin_eve: true,
          ubi_eve: true,
          dur_eve: true,
          capacidad_max_eve: true,
          es_gratuito: true,
          precio: true,
          tipo_audiencia_eve: true,
          categoria: {
            select: {
              nom_cat: true,
            },
          },
          eventosPorCarrera: {
            select: {
              carrera: {
                select: {
                  nom_car: true,
                },
              },
            },
          },
          inscripciones: {
            where: {
              estado_pago: "APROBADO",
            },
            select: {
              id_ins: true,
            },
          },
        },
        orderBy: {
          fec_ini_eve: "asc",
        },
      });

      // Cursos públicos y para todas las carreras para usuarios externos
      const cursos = await prisma.curso.findMany({
        where: {
          estado: "ACTIVO",
          OR: [
            { tipo_audiencia_cur: "PUBLICO_GENERAL" },
            { tipo_audiencia_cur: "TODAS_CARRERAS" }, // ✅ Agregar cursos para todas las carreras
          ],
          fec_ini_cur: {
            gte: new Date(), // Solo cursos futuros
          },
        },
        select: {
          id_cur: true,
          nom_cur: true,
          des_cur: true,
          fec_ini_cur: true,
          fec_fin_cur: true,
          dur_cur: true,
          capacidad_max_cur: true,
          es_gratuito: true,
          precio: true,
          tipo_audiencia_cur: true,
          requiere_verificacion_docs: true,
          categoria: {
            select: {
              nom_cat: true,
            },
          },
          cursosPorCarrera: {
            select: {
              carrera: {
                select: {
                  nom_car: true,
                },
              },
            },
          },
          inscripcionesCurso: {
            where: {
              estado_pago_cur: "APROBADO",
            },
            select: {
              id_ins_cur: true,
            },
          },
        },
        orderBy: {
          fec_ini_cur: "asc",
        },
      });

      console.log(
        `Eventos públicos encontrados para usuario externo: ${eventos.length}`
      );
      console.log(
        `Cursos públicos encontrados para usuario externo: ${cursos.length}`
      );

      res.json({
        success: true,
        eventos,
        cursos,
      });
    } catch (error: any) {
      console.error("[getExternalContent] Error:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener eventos y cursos",
      });
    }
  }
}
