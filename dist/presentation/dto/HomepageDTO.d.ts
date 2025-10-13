/**
 * DTOs para el manejo del contenido de la página principal
 */
export interface HomepageContentDTO {
    titulo_hero?: string;
    subtitulo_hero?: string;
    descripcion_hero?: string;
    titulo_ofrecemos?: string;
    subtitulo_ofrecemos?: string;
    titulo_seccion1?: string;
    descripcion_seccion1?: string;
    titulo_seccion2?: string;
    descripcion_seccion2?: string;
    titulo_seccion3?: string;
    descripcion_seccion3?: string;
    titulo_seccion4?: string;
    descripcion_seccion4?: string;
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
export declare class HomepageDTOTransformer {
    /**
     * ✅ SRP: Convertir HomepageContentDTO a formato del servicio
     */
    static fromContentRequestDTO(dto: HomepageContentDTO): {
        titulo_hero: string | undefined;
        subtitulo_hero: string | undefined;
        descripcion_hero: string | undefined;
        titulo_ofrecemos: string | undefined;
        subtitulo_ofrecemos: string | undefined;
        titulo_seccion1: string | undefined;
        descripcion_seccion1: string | undefined;
        titulo_seccion2: string | undefined;
        descripcion_seccion2: string | undefined;
        titulo_seccion3: string | undefined;
        descripcion_seccion3: string | undefined;
        titulo_seccion4: string | undefined;
        descripcion_seccion4: string | undefined;
        texto_footer1: string | undefined;
        texto_footer2: string | undefined;
        texto_footer3: string | undefined;
    };
    /**
     * ✅ SRP: Convertir HomepageImageRequestDTO a formato del servicio
     */
    static fromImageRequestDTO(dto: HomepageImageRequestDTO): {
        imageType: string;
        imageFile: any;
    };
    /**
     * ✅ SRP: Convertir respuesta del servicio a respuesta genérica
     */
    static toResponseDTO(serviceResponse: any): any;
    /**
     * ✅ SRP: Validar campos básicos de entrada
     */
    static validateBasicFields(dto: any): void;
}
//# sourceMappingURL=HomepageDTO.d.ts.map