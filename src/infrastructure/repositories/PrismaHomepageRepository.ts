import { PrismaClient } from "@prisma/client";
import {
  IHomepageRepository,
  UpdateHomepageContentData,
} from "../../domain/repositories/IHomepageRepository";
import {
  HomepageContent,
  HomepageContentData,
  ImageSection,
  ContentSection,
} from "../../domain/entities/HomepageContent";

/**
 * Implementación del repositorio de Homepage usando Prisma
 * Sigue los principios SOLID y Clean Architecture
 */
export class PrismaHomepageRepository implements IHomepageRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Obtener el contenido actual de la página principal
   */
  async getContent(): Promise<HomepageContent | null> {
    try {
      const prismaContent = await this.prisma.paginaPrincipal.findFirst({
        include: {
          ultimoEditor: true,
        },
      });

      if (!prismaContent) {
        return null;
      }

      return this.mapPrismaToEntity(prismaContent);
    } catch (error) {
      console.error("[PrismaHomepageRepository.getContent] Error:", error);
      throw new Error("Error al obtener contenido de la página principal");
    }
  }

  /**
   * Crear contenido de página principal por defecto
   */
  async createDefaultContent(): Promise<HomepageContent> {
    try {
      const defaultData = {
        titulo_hero: "FISEI - SIGEC",
        subtitulo_hero: "Sistema Integral de Gestión de Eventos y Cursos",
        descripcion_hero:
          "Facultad de Ingeniería en Sistemas, Electrónica e Industrial - Universidad Técnica de Ambato",
        titulo_ofrecemos: "¿Qué Ofrecemos?",
        subtitulo_ofrecemos:
          "Descubre todas las oportunidades de crecimiento académico y profesional que tenemos para ti",
        titulo_seccion1: "Cursos Especializados",
        descripcion_seccion1:
          "Ofrecemos una amplia variedad de cursos técnicos y académicos diseñados para potenciar tu desarrollo profesional.",
        titulo_seccion2: "Eventos Académicos",
        descripcion_seccion2:
          "Participa en conferencias, seminarios y talleres que enriquecerán tu experiencia universitaria.",
        titulo_seccion3: "Certificaciones Oficiales",
        descripcion_seccion3:
          "Obtén certificados oficiales que validen tus conocimientos y habilidades adquiridas.",
        titulo_seccion4: "Comunidad Académica",
        descripcion_seccion4:
          "Forma parte de una comunidad universitaria comprometida con la excelencia educativa.",
        texto_footer1:
          "Facultad de Ingeniería en Sistemas, Electrónica e Industrial",
        texto_footer2: "Universidad Técnica de Ambato - Campus Huachi",
        texto_footer3: "© 2024 FISEI-UTA. Todos los derechos reservados.",
        fecha_creacion: new Date(),
      };

      const prismaContent = await this.prisma.paginaPrincipal.create({
        data: defaultData,
        include: {
          ultimoEditor: true,
        },
      });

      return this.mapPrismaToEntity(prismaContent);
    } catch (error) {
      console.error(
        "[PrismaHomepageRepository.createDefaultContent] Error:",
        error
      );
      throw new Error("Error al crear contenido por defecto");
    }
  }

  /**
   * Actualizar contenido de la página principal
   */
  async updateContent(
    contentData: Partial<HomepageContentData>,
    editorId: string
  ): Promise<HomepageContent> {
    try {
      // Primero obtener el registro existente o crear uno
      let existingContent = await this.prisma.paginaPrincipal.findFirst();

      if (!existingContent) {
        existingContent = await this.prisma.paginaPrincipal.create({
          data: {
            titulo_hero: contentData.heroTitle || "FISEI - SIGEC",
            subtitulo_hero:
              contentData.heroSubtitle || "Sistema Integral de Gestión",
            descripcion_hero:
              contentData.heroDescription ||
              "Facultad de Ingeniería en Sistemas",
            titulo_ofrecemos: contentData.offerTitle || "¿Qué Ofrecemos?",
            subtitulo_ofrecemos:
              contentData.offerSubtitle || "Oportunidades de crecimiento",
            titulo_seccion1: "Cursos Especializados",
            descripcion_seccion1: "Cursos técnicos y académicos de calidad",
            titulo_seccion2: "Eventos Académicos",
            descripcion_seccion2: "Conferencias y seminarios especializados",
            titulo_seccion3: "Certificaciones Oficiales",
            descripcion_seccion3: "Certificados que validan tus conocimientos",
            titulo_seccion4: "Comunidad Académica",
            descripcion_seccion4: "Comunidad comprometida con la excelencia",
            texto_footer1:
              "Facultad de Ingeniería en Sistemas, Electrónica e Industrial",
            texto_footer2: "Universidad Técnica de Ambato - Campus Huachi",
            texto_footer3: "© 2024 FISEI-UTA. Todos los derechos reservados.",
            fecha_creacion: new Date(),
            id_usuario_ultima_edicion: editorId,
          },
        });
      }

      // Preparar datos de actualización
      const updateData: any = {
        fecha_actualizacion: new Date(),
        id_usuario_ultima_edicion: editorId,
      };

      // Mapear campos del dominio a la base de datos
      if (contentData.heroTitle !== undefined)
        updateData.titulo_hero = contentData.heroTitle;
      if (contentData.heroSubtitle !== undefined)
        updateData.subtitulo_hero = contentData.heroSubtitle;
      if (contentData.heroDescription !== undefined)
        updateData.descripcion_hero = contentData.heroDescription;
      if (contentData.offerTitle !== undefined)
        updateData.titulo_ofrecemos = contentData.offerTitle;
      if (contentData.offerSubtitle !== undefined)
        updateData.subtitulo_ofrecemos = contentData.offerSubtitle;
      if (contentData.footerText1 !== undefined)
        updateData.texto_footer1 = contentData.footerText1;
      if (contentData.footerText2 !== undefined)
        updateData.texto_footer2 = contentData.footerText2;
      if (contentData.footerText3 !== undefined)
        updateData.texto_footer3 = contentData.footerText3;

      // Mapear secciones si están presentes
      if (contentData.sections && contentData.sections.length > 0) {
        const sections = contentData.sections;
        sections.forEach((section, index) => {
          const sectionNum = index + 1;
          if (sectionNum <= 4) {
            updateData[`titulo_seccion${sectionNum}`] = section.title;
            updateData[`descripcion_seccion${sectionNum}`] =
              section.description;
          }
        });
      }

      const updatedContent = await this.prisma.paginaPrincipal.update({
        where: { id_pag: existingContent.id_pag },
        data: updateData,
        include: {
          ultimoEditor: true,
        },
      });

      return this.mapPrismaToEntity(updatedContent);
    } catch (error) {
      console.error("[PrismaHomepageRepository.updateContent] Error:", error);
      throw new Error("Error al actualizar contenido de la página principal");
    }
  }

  /**
   * Obtener imagen por tipo
   */
  async getImageByType(imageType: string): Promise<ImageSection | null> {
    try {
      const content = await this.prisma.paginaPrincipal.findFirst();

      if (!content) {
        return null;
      }

      const imageField = `imagen_${imageType}` as keyof typeof content;
      const imageBuffer = content[imageField] as Buffer | null;

      if (!imageBuffer) {
        return null;
      }

      return {
        id: `${content.id_pag}_${imageType}`,
        type: imageType as any,
        buffer: imageBuffer,
        mimeType: "image/jpeg", // Valor por defecto, idealmente debería almacenarse
        uploadedAt:
          content.fecha_ultima_actualizacion || content.fecha_creacion,
        uploadedBy: content.id_usuario_ultima_edicion || "sistema",
      };
    } catch (error) {
      console.error("[PrismaHomepageRepository.getImageByType] Error:", error);
      throw new Error("Error al obtener imagen");
    }
  }

  /**
   * Actualizar imagen
   */
  async updateImage(
    imageType: string,
    imageBuffer: Buffer,
    mimeType: string,
    uploadedBy: string
  ): Promise<void> {
    try {
      let content = await this.prisma.paginaPrincipal.findFirst();

      if (!content) {
        content = await this.createDefaultPrismaContent();
      }

      // TypeScript guard: content no puede ser null aquí
      if (!content) {
        throw new Error("No se pudo crear o encontrar contenido de página");
      }

      const updateData = {
        fecha_ultima_actualizacion: new Date(),
        id_usuario_ultima_edicion: uploadedBy,
        [`imagen_${imageType}`]: imageBuffer,
      };

      await this.prisma.paginaPrincipal.update({
        where: { id_pag: content.id_pag },
        data: updateData,
      });
    } catch (error) {
      console.error("[PrismaHomepageRepository.updateImage] Error:", error);
      throw new Error("Error al actualizar imagen");
    }
  }

  /**
   * Eliminar imagen
   */
  async deleteImage(imageType: string): Promise<void> {
    try {
      const content = await this.prisma.paginaPrincipal.findFirst();

      if (!content) {
        return;
      }

      const updateData = {
        fecha_ultima_actualizacion: new Date(),
        [`imagen_${imageType}`]: null,
      };

      await this.prisma.paginaPrincipal.update({
        where: { id_pag: content.id_pag },
        data: updateData,
      });
    } catch (error) {
      console.error("[PrismaHomepageRepository.deleteImage] Error:", error);
      throw new Error("Error al eliminar imagen");
    }
  }

  /**
   * Obtener historial de cambios
   */
  async getUpdateHistory(limit: number = 10): Promise<any[]> {
    try {
      // En una implementación completa, esto requeriría una tabla de auditoría
      // Por ahora retornamos información básica del último registro
      const content = await this.prisma.paginaPrincipal.findFirst({
        include: {
          ultimoEditor: true,
        },
      });

      if (!content) {
        return [];
      }

      return [
        {
          id: content.id_pag,
          updatedAt:
            content.fecha_ultima_actualizacion || content.fecha_creacion,
          updatedBy: content.ultimoEditor?.nom_usu1 || "Sistema",
          action: "update",
        },
      ];
    } catch (error) {
      console.error(
        "[PrismaHomepageRepository.getUpdateHistory] Error:",
        error
      );
      return [];
    }
  }

  /**
   * Verificar si existe contenido
   */
  async hasContent(): Promise<boolean> {
    try {
      const count = await this.prisma.paginaPrincipal.count();
      return count > 0;
    } catch (error) {
      console.error("[PrismaHomepageRepository.hasContent] Error:", error);
      return false;
    }
  }

  /**
   * Obtener metadatos del contenido
   */
  async getContentMetadata(): Promise<{
    lastUpdate: Date;
    lastEditor: string;
    version: number;
    isPublished: boolean;
  } | null> {
    try {
      const content = await this.prisma.paginaPrincipal.findFirst({
        include: {
          ultimoEditor: true,
        },
      });

      if (!content) {
        return null;
      }

      return {
        lastUpdate:
          content.fecha_ultima_actualizacion || content.fecha_creacion,
        lastEditor: content.ultimoEditor?.nom_usu1 || "Sistema",
        version: 1, // Implementar versionado si es necesario
        isPublished: true, // Por defecto publicado
      };
    } catch (error) {
      console.error(
        "[PrismaHomepageRepository.getContentMetadata] Error:",
        error
      );
      return null;
    }
  }

  /**
   * Mapear datos de Prisma a entidad del dominio
   */
  private mapPrismaToEntity(prismaContent: any): HomepageContent {
    const sections: ContentSection[] = [
      {
        id: "1",
        title: prismaContent.titulo_seccion1 || "",
        description: prismaContent.descripcion_seccion1 || "",
        order: 1,
        isVisible: true,
      },
      {
        id: "2",
        title: prismaContent.titulo_seccion2 || "",
        description: prismaContent.descripcion_seccion2 || "",
        order: 2,
        isVisible: true,
      },
      {
        id: "3",
        title: prismaContent.titulo_seccion3 || "",
        description: prismaContent.descripcion_seccion3 || "",
        order: 3,
        isVisible: true,
      },
      {
        id: "4",
        title: prismaContent.titulo_seccion4 || "",
        description: prismaContent.descripcion_seccion4 || "",
        order: 4,
        isVisible: true,
      },
    ];

    const images: Record<string, ImageSection> = {};

    // Mapear imágenes si existen
    const imageTypes = ["hero", "seccion1", "seccion2", "seccion3", "seccion4"];
    imageTypes.forEach((type) => {
      const imageBuffer = prismaContent[`imagen_${type}`];
      if (imageBuffer) {
        images[type] = {
          id: `${prismaContent.id_pag}_${type}`,
          type: type as any,
          buffer: imageBuffer,
          mimeType: "image/jpeg",
          uploadedAt:
            prismaContent.fecha_ultima_actualizacion ||
            prismaContent.fecha_creacion,
          uploadedBy: prismaContent.id_usuario_ultima_edicion || "sistema",
        };
      }
    });

    const contentData: HomepageContentData = {
      id: prismaContent.id_pag.toString(),
      heroTitle: prismaContent.titulo_hero || "",
      heroSubtitle: prismaContent.subtitulo_hero || "",
      heroDescription: prismaContent.descripcion_hero || "",
      offerTitle: prismaContent.titulo_ofrecemos || "",
      offerSubtitle: prismaContent.subtitulo_ofrecemos || "",
      sections,
      footerText1: prismaContent.texto_footer1 || "",
      footerText2: prismaContent.texto_footer2 || "",
      footerText3: prismaContent.texto_footer3 || "",
      images,
      lastEditorId: prismaContent.id_usuario_ultima_edicion || "",
      lastEditorName: prismaContent.ultimoEditor?.nom_usu1 || "Sistema",
      lastUpdateDate:
        prismaContent.fecha_ultima_actualizacion ||
        prismaContent.fecha_creacion,
      createdAt: prismaContent.fecha_creacion,
      version: 1,
      isPublished: true,
    };

    return new HomepageContent(contentData);
  }

  /**
   * Crear contenido por defecto en Prisma (método auxiliar)
   */
  private async createDefaultPrismaContent(): Promise<any> {
    return await this.prisma.paginaPrincipal.create({
      data: {
        titulo_hero: "FISEI - SIGEC",
        subtitulo_hero: "Sistema Integral de Gestión de Eventos y Cursos",
        descripcion_hero:
          "Facultad de Ingeniería en Sistemas, Electrónica e Industrial",
        titulo_ofrecemos: "¿Qué Ofrecemos?",
        subtitulo_ofrecemos:
          "Oportunidades de crecimiento académico y profesional",
        titulo_seccion1: "Cursos Especializados",
        descripcion_seccion1: "Cursos técnicos y académicos de calidad",
        titulo_seccion2: "Eventos Académicos",
        descripcion_seccion2: "Conferencias y seminarios especializados",
        titulo_seccion3: "Certificaciones Oficiales",
        descripcion_seccion3: "Certificados que validan tus conocimientos",
        titulo_seccion4: "Comunidad Académica",
        descripcion_seccion4: "Comunidad comprometida con la excelencia",
        texto_footer1:
          "Facultad de Ingeniería en Sistemas, Electrónica e Industrial",
        texto_footer2: "Universidad Técnica de Ambato - Campus Huachi",
        texto_footer3: "© 2024 FISEI-UTA. Todos los derechos reservados.",
        fecha_creacion: new Date(),
      },
    });
  }
}
