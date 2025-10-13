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
