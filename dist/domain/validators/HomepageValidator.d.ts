/**
 * Homepage Validator - Domain Layer
 *
 * ✅ SRP: Responsabilidad única - Validaciones de reglas de negocio para Homepage
 * ✅ SOLID: Single Responsibility Principle - Solo validaciones de Homepage
 * ✅ DRY: Don't Repeat Yourself - Centraliza todas las validaciones
 */
export interface HomepageContentValidation {
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
export interface HomepageValidationData {
    filtros?: {
        categoria?: string;
        fechas?: {
            inicio?: Date;
            fin?: Date;
        };
        modalidad?: string;
        estado?: string;
    };
    paginacion?: {
        pagina?: number;
        limite?: number;
    };
}
export declare class HomepageValidator {
    /**
     * ✅ SRP: Solo validación de filtros de búsqueda
     */
    static validateFilters(data: HomepageValidationData): void;
    /**
     * ✅ SRP: Solo validación de paginación
     */
    static validatePagination(data: HomepageValidationData): void;
    /**
     * ✅ SRP: Solo validación de búsqueda de texto
     */
    static validateSearchText(texto: string): void;
    /**
     * ✅ SRP: Validar actualización de contenido de homepage
     */
    static validateContentUpdate(content: HomepageContentValidation): void;
    /**
     * ✅ SRP: Validar imagen de homepage
     */
    static validateImageUpdate(imageType: string, imageFile?: any): void;
    /**
     * ✅ SRP: Validaciones específicas de campos
     */
    private static validateHeroTitle;
    private static validateHeroSubtitle;
    private static validateHeroDescription;
    private static validateOfferTitle;
    private static validateOfferSubtitle;
    private static validateSectionTitle;
    private static validateSectionDescription;
    private static validateFooterText;
    private static validateImageFile;
}
//# sourceMappingURL=HomepageValidator.d.ts.map