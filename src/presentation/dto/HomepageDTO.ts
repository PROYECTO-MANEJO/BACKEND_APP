/**
 * DTOs para el manejo del contenido de la página principal
 */

export interface HomepageContentDTO {
  // Hero Section
  titulo_hero?: string;
  subtitulo_hero?: string;
  descripcion_hero?: string;

  // What We Offer Section
  titulo_ofrecemos?: string;
  subtitulo_ofrecemos?: string;

  // Content Sections
  titulo_seccion1?: string;
  descripcion_seccion1?: string;
  titulo_seccion2?: string;
  descripcion_seccion2?: string;
  titulo_seccion3?: string;
  descripcion_seccion3?: string;
  titulo_seccion4?: string;
  descripcion_seccion4?: string;

  // Footer
  texto_footer1?: string;
  texto_footer2?: string;
  texto_footer3?: string;
}

export interface HomepageResponseDTO {
  id_pag: number;
  titulo_hero: string;
  subtitulo_hero: string;
  descripcion_hero: string;
  titulo_ofrecemos: string;
  subtitulo_ofrecemos: string;
  titulo_seccion1: string;
  descripcion_seccion1: string;
  titulo_seccion2: string;
  descripcion_seccion2: string;
  titulo_seccion3: string;
  descripcion_seccion3: string;
  titulo_seccion4: string;
  descripcion_seccion4: string;
  texto_footer1: string;
  texto_footer2: string;
  texto_footer3: string;
  imagen_hero?: string;
  imagen_seccion1?: string;
  imagen_seccion2?: string;
  imagen_seccion3?: string;
  imagen_seccion4?: string;
  ultimoEditor?: {
    nom_usu1: string;
    ape_usu1: string;
  };
  fecha_actualizacion?: Date;
  fecha_creacion: Date;
}

export interface ImageUploadDTO {
  imageType: "hero" | "seccion1" | "seccion2" | "seccion3" | "seccion4";
  file: Buffer;
  mimeType: string;
}

export interface HomepageImageRequestDTO {
  imageType: string;
  imageFile?: any;
}

/**
 * Homepage DTO Transformer
 * ✅ SRP: Solo transformación entre DTOs y requests del dominio
 */
export class HomepageDTOTransformer {
  /**
   * ✅ SRP: Convertir HomepageContentDTO a formato del servicio
   */
  public static fromContentRequestDTO(dto: HomepageContentDTO) {
    return {
      titulo_hero: dto.titulo_hero,
      subtitulo_hero: dto.subtitulo_hero,
      descripcion_hero: dto.descripcion_hero,
      titulo_ofrecemos: dto.titulo_ofrecemos,
      subtitulo_ofrecemos: dto.subtitulo_ofrecemos,
      titulo_seccion1: dto.titulo_seccion1,
      descripcion_seccion1: dto.descripcion_seccion1,
      titulo_seccion2: dto.titulo_seccion2,
      descripcion_seccion2: dto.descripcion_seccion2,
      titulo_seccion3: dto.titulo_seccion3,
      descripcion_seccion3: dto.descripcion_seccion3,
      titulo_seccion4: dto.titulo_seccion4,
      descripcion_seccion4: dto.descripcion_seccion4,
      texto_footer1: dto.texto_footer1,
      texto_footer2: dto.texto_footer2,
      texto_footer3: dto.texto_footer3,
    };
  }

  /**
   * ✅ SRP: Convertir HomepageImageRequestDTO a formato del servicio
   */
  public static fromImageRequestDTO(dto: HomepageImageRequestDTO) {
    return {
      imageType: dto.imageType,
      imageFile: dto.imageFile,
    };
  }

  /**
   * ✅ SRP: Convertir respuesta del servicio a respuesta genérica
   */
  public static toResponseDTO(serviceResponse: any): any {
    return {
      success: serviceResponse.success,
      message: serviceResponse.message,
      data: serviceResponse.data,
    };
  }

  /**
   * ✅ SRP: Validar campos básicos de entrada
   */
  public static validateBasicFields(dto: any): void {
    // Validaciones básicas de tipos
    if (dto.titulo_hero !== undefined && typeof dto.titulo_hero !== "string") {
      throw new Error("El título hero debe ser una cadena de texto");
    }

    if (
      dto.subtitulo_hero !== undefined &&
      typeof dto.subtitulo_hero !== "string"
    ) {
      throw new Error("El subtítulo hero debe ser una cadena de texto");
    }

    if (
      dto.descripcion_hero !== undefined &&
      typeof dto.descripcion_hero !== "string"
    ) {
      throw new Error("La descripción hero debe ser una cadena de texto");
    }

    if (dto.imageType !== undefined && typeof dto.imageType !== "string") {
      throw new Error("El tipo de imagen debe ser una cadena de texto");
    }
  }
}
