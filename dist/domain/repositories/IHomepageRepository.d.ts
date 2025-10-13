import { HomepageContent, HomepageContentData, ImageSection } from "../entities/HomepageContent";
/**
 * Interfaz del repositorio para la gestión del contenido de la página principal
 * Sigue el principio de inversión de dependencias (DIP) de SOLID
 */
export interface IHomepageRepository {
    /**
     * Obtener el contenido actual de la página principal
     */
    getContent(): Promise<HomepageContent | null>;
    /**
     * Crear contenido de página principal por defecto
     */
    createDefaultContent(): Promise<HomepageContent>;
    /**
     * Actualizar contenido de la página principal
     */
    updateContent(contentData: Partial<HomepageContentData>, editorId: string): Promise<HomepageContent>;
    /**
     * Obtener imagen por tipo
     */
    getImageByType(imageType: string): Promise<ImageSection | null>;
    /**
     * Actualizar imagen
     */
    updateImage(imageType: string, imageBuffer: Buffer, mimeType: string, uploadedBy: string): Promise<void>;
    /**
     * Eliminar imagen
     */
    deleteImage(imageType: string): Promise<void>;
    /**
     * Obtener historial de cambios (opcional para auditoría)
     */
    getUpdateHistory(limit?: number): Promise<any[]>;
    /**
     * Verificar si existe contenido
     */
    hasContent(): Promise<boolean>;
    /**
     * Obtener metadatos del contenido
     */
    getContentMetadata(): Promise<{
        lastUpdate: Date;
        lastEditor: string;
        version: number;
        isPublished: boolean;
    } | null>;
}
/**
 * Filtros para el contenido de homepage
 */
export interface HomepageContentFilters {
    includeImages?: boolean;
    includeEditor?: boolean;
    version?: number;
}
/**
 * Datos de actualización para el contenido
 */
export interface UpdateHomepageContentData {
    heroTitle?: string;
    heroSubtitle?: string;
    heroDescription?: string;
    offerTitle?: string;
    offerSubtitle?: string;
    section1Title?: string;
    section1Description?: string;
    section2Title?: string;
    section2Description?: string;
    section3Title?: string;
    section3Description?: string;
    section4Title?: string;
    section4Description?: string;
    footerText1?: string;
    footerText2?: string;
    footerText3?: string;
    isPublished?: boolean;
}
//# sourceMappingURL=IHomepageRepository.d.ts.map