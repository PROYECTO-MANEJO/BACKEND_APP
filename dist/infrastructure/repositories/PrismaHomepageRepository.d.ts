import { PrismaClient } from "@prisma/client";
import { IHomepageRepository } from "../../domain/repositories/IHomepageRepository";
import { HomepageContent, HomepageContentData, ImageSection } from "../../domain/entities/HomepageContent";
/**
 * Implementación del repositorio de Homepage usando Prisma
 * Sigue los principios SOLID y Clean Architecture
 */
export declare class PrismaHomepageRepository implements IHomepageRepository {
    private prisma;
    constructor(prisma: PrismaClient);
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
     * Obtener historial de cambios
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
    /**
     * Mapear datos de Prisma a entidad del dominio
     */
    private mapPrismaToEntity;
    /**
     * Crear contenido por defecto en Prisma (método auxiliar)
     */
    private createDefaultPrismaContent;
}
//# sourceMappingURL=PrismaHomepageRepository.d.ts.map