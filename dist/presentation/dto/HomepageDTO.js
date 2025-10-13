"use strict";
/**
 * DTOs para el manejo del contenido de la página principal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomepageDTOTransformer = void 0;
/**
 * Homepage DTO Transformer
 * ✅ SRP: Solo transformación entre DTOs y requests del dominio
 */
class HomepageDTOTransformer {
    /**
     * ✅ SRP: Convertir HomepageContentDTO a formato del servicio
     */
    static fromContentRequestDTO(dto) {
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
    static fromImageRequestDTO(dto) {
        return {
            imageType: dto.imageType,
            imageFile: dto.imageFile,
        };
    }
    /**
     * ✅ SRP: Convertir respuesta del servicio a respuesta genérica
     */
    static toResponseDTO(serviceResponse) {
        return {
            success: serviceResponse.success,
            message: serviceResponse.message,
            data: serviceResponse.data,
        };
    }
    /**
     * ✅ SRP: Validar campos básicos de entrada
     */
    static validateBasicFields(dto) {
        // Validaciones básicas de tipos
        if (dto.titulo_hero !== undefined && typeof dto.titulo_hero !== "string") {
            throw new Error("El título hero debe ser una cadena de texto");
        }
        if (dto.subtitulo_hero !== undefined &&
            typeof dto.subtitulo_hero !== "string") {
            throw new Error("El subtítulo hero debe ser una cadena de texto");
        }
        if (dto.descripcion_hero !== undefined &&
            typeof dto.descripcion_hero !== "string") {
            throw new Error("La descripción hero debe ser una cadena de texto");
        }
        if (dto.imageType !== undefined && typeof dto.imageType !== "string") {
            throw new Error("El tipo de imagen debe ser una cadena de texto");
        }
    }
}
exports.HomepageDTOTransformer = HomepageDTOTransformer;
//# sourceMappingURL=HomepageDTO.js.map