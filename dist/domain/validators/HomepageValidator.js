"use strict";
/**
 * Homepage Validator - Domain Layer
 *
 * ✅ SRP: Responsabilidad única - Validaciones de reglas de negocio para Homepage
 * ✅ SOLID: Single Responsibility Principle - Solo validaciones de Homepage
 * ✅ DRY: Don't Repeat Yourself - Centraliza todas las validaciones
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomepageValidator = void 0;
class HomepageValidator {
    /**
     * ✅ SRP: Solo validación de filtros de búsqueda
     */
    static validateFilters(data) {
        if (data.filtros?.fechas) {
            const { inicio, fin } = data.filtros.fechas;
            if (inicio && fin && inicio > fin) {
                throw new Error("La fecha de inicio no puede ser mayor a la fecha de fin");
            }
            if (inicio && inicio < new Date("2020-01-01")) {
                throw new Error("La fecha de inicio no puede ser anterior a 2020");
            }
            if (fin && fin > new Date("2030-12-31")) {
                throw new Error("La fecha de fin no puede ser posterior a 2030");
            }
        }
        if (data.filtros?.modalidad) {
            const modalidadesValidas = ["PRESENCIAL", "VIRTUAL", "MIXTA"];
            if (!modalidadesValidas.includes(data.filtros.modalidad)) {
                throw new Error(`Modalidad inválida. Debe ser una de: ${modalidadesValidas.join(", ")}`);
            }
        }
        if (data.filtros?.estado) {
            const estadosValidos = ["ACTIVO", "PROXIMO", "FINALIZADO"];
            if (!estadosValidos.includes(data.filtros.estado)) {
                throw new Error(`Estado inválido. Debe ser uno de: ${estadosValidos.join(", ")}`);
            }
        }
    }
    /**
     * ✅ SRP: Solo validación de paginación
     */
    static validatePagination(data) {
        if (data.paginacion?.pagina !== undefined) {
            if (data.paginacion.pagina < 1) {
                throw new Error("El número de página debe ser mayor a 0");
            }
            if (data.paginacion.pagina > 1000) {
                throw new Error("El número de página no puede exceder 1000");
            }
        }
        if (data.paginacion?.limite !== undefined) {
            if (data.paginacion.limite < 1) {
                throw new Error("El límite debe ser mayor a 0");
            }
            if (data.paginacion.limite > 100) {
                throw new Error("El límite no puede exceder 100 elementos por página");
            }
        }
    }
    /**
     * ✅ SRP: Solo validación de búsqueda de texto
     */
    static validateSearchText(texto) {
        if (typeof texto !== "string") {
            throw new Error("El texto de búsqueda debe ser una cadena");
        }
        if (texto.length < 2) {
            throw new Error("El texto de búsqueda debe tener al menos 2 caracteres");
        }
        if (texto.length > 100) {
            throw new Error("El texto de búsqueda no puede exceder 100 caracteres");
        }
    }
    /**
     * ✅ SRP: Validar actualización de contenido de homepage
     */
    static validateContentUpdate(content) {
        // Validar campos hero
        if (content.titulo_hero !== undefined) {
            this.validateHeroTitle(content.titulo_hero);
        }
        if (content.subtitulo_hero !== undefined) {
            this.validateHeroSubtitle(content.subtitulo_hero);
        }
        if (content.descripcion_hero !== undefined) {
            this.validateHeroDescription(content.descripcion_hero);
        }
        // Validar sección "Lo que ofrecemos"
        if (content.titulo_ofrecemos !== undefined) {
            this.validateOfferTitle(content.titulo_ofrecemos);
        }
        if (content.subtitulo_ofrecemos !== undefined) {
            this.validateOfferSubtitle(content.subtitulo_ofrecemos);
        }
        // Validar secciones 1-4
        for (let i = 1; i <= 4; i++) {
            const titleKey = `titulo_seccion${i}`;
            const descKey = `descripcion_seccion${i}`;
            if (content[titleKey] !== undefined) {
                this.validateSectionTitle(content[titleKey], i);
            }
            if (content[descKey] !== undefined) {
                this.validateSectionDescription(content[descKey], i);
            }
        }
        // Validar textos footer
        if (content.texto_footer1 !== undefined) {
            this.validateFooterText(content.texto_footer1, 1);
        }
        if (content.texto_footer2 !== undefined) {
            this.validateFooterText(content.texto_footer2, 2);
        }
        if (content.texto_footer3 !== undefined) {
            this.validateFooterText(content.texto_footer3, 3);
        }
    }
    /**
     * ✅ SRP: Validar imagen de homepage
     */
    static validateImageUpdate(imageType, imageFile) {
        const validImageTypes = [
            "hero",
            "seccion1",
            "seccion2",
            "seccion3",
            "seccion4",
        ];
        if (!validImageTypes.includes(imageType)) {
            throw new Error(`Tipo de imagen no válido. Debe ser uno de: ${validImageTypes.join(", ")}`);
        }
        if (imageFile) {
            this.validateImageFile(imageFile);
        }
    }
    /**
     * ✅ SRP: Validaciones específicas de campos
     */
    static validateHeroTitle(title) {
        if (typeof title !== "string") {
            throw new Error("El título hero debe ser una cadena de texto");
        }
        if (title.length > 100) {
            throw new Error("El título hero no puede exceder 100 caracteres");
        }
    }
    static validateHeroSubtitle(subtitle) {
        if (typeof subtitle !== "string") {
            throw new Error("El subtítulo hero debe ser una cadena de texto");
        }
        if (subtitle.length > 150) {
            throw new Error("El subtítulo hero no puede exceder 150 caracteres");
        }
    }
    static validateHeroDescription(description) {
        if (typeof description !== "string") {
            throw new Error("La descripción hero debe ser una cadena de texto");
        }
        if (description.length > 500) {
            throw new Error("La descripción hero no puede exceder 500 caracteres");
        }
    }
    static validateOfferTitle(title) {
        if (typeof title !== "string") {
            throw new Error("El título de ofrecemos debe ser una cadena de texto");
        }
        if (title.length > 80) {
            throw new Error("El título de ofrecemos no puede exceder 80 caracteres");
        }
    }
    static validateOfferSubtitle(subtitle) {
        if (typeof subtitle !== "string") {
            throw new Error("El subtítulo de ofrecemos debe ser una cadena de texto");
        }
        if (subtitle.length > 120) {
            throw new Error("El subtítulo de ofrecemos no puede exceder 120 caracteres");
        }
    }
    static validateSectionTitle(title, sectionNumber) {
        if (typeof title !== "string") {
            throw new Error(`El título de la sección ${sectionNumber} debe ser una cadena de texto`);
        }
        if (title.length > 80) {
            throw new Error(`El título de la sección ${sectionNumber} no puede exceder 80 caracteres`);
        }
    }
    static validateSectionDescription(description, sectionNumber) {
        if (typeof description !== "string") {
            throw new Error(`La descripción de la sección ${sectionNumber} debe ser una cadena de texto`);
        }
        if (description.length > 300) {
            throw new Error(`La descripción de la sección ${sectionNumber} no puede exceder 300 caracteres`);
        }
    }
    static validateFooterText(text, footerNumber) {
        if (typeof text !== "string") {
            throw new Error(`El texto del footer ${footerNumber} debe ser una cadena de texto`);
        }
        if (text.length > 200) {
            throw new Error(`El texto del footer ${footerNumber} no puede exceder 200 caracteres`);
        }
    }
    static validateImageFile(file) {
        const validMimeTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        ];
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
        if (!validMimeTypes.includes(file.mimetype)) {
            throw new Error("Formato de imagen no válido. Use JPEG, PNG o WebP");
        }
        if (file.size > maxSizeInBytes) {
            throw new Error("La imagen no puede exceder 5MB");
        }
    }
}
exports.HomepageValidator = HomepageValidator;
//# sourceMappingURL=HomepageValidator.js.map