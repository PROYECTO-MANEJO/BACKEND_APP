/**
 * Homepage Content Entity - Domain Layer
 *
 * Representa el contenido editable de la página principal
 */
export interface ImageSection {
    id: string;
    type: "hero" | "section1" | "section2" | "section3" | "section4";
    buffer?: Buffer;
    mimeType?: string;
    uploadedAt?: Date;
    uploadedBy?: string;
}
export interface ContentSection {
    id: string;
    title: string;
    subtitle?: string;
    description: string;
    order: number;
    isVisible: boolean;
}
export interface HomepageContentData {
    id: string;
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    offerTitle: string;
    offerSubtitle: string;
    sections: ContentSection[];
    footerText1: string;
    footerText2: string;
    footerText3: string;
    images: Record<string, ImageSection>;
    lastEditorId?: string;
    lastEditorName?: string;
    lastUpdateDate: Date;
    createdAt: Date;
    version: number;
    isPublished: boolean;
}
export declare class HomepageContent {
    private data;
    constructor(data: HomepageContentData);
    static create(heroTitle: string, heroSubtitle: string, heroDescription: string, editorId?: string, editorName?: string): HomepageContent;
    static fromPrismaData(homepageData: any): HomepageContent;
    private static mapImagesFromPrisma;
    private static detectMimeType;
    private validateData;
    getId(): string;
    getHeroTitle(): string;
    getHeroSubtitle(): string;
    getHeroDescription(): string;
    getOfferTitle(): string;
    getOfferSubtitle(): string;
    getSections(): ContentSection[];
    getVisibleSections(): ContentSection[];
    getSectionById(sectionId: string): ContentSection | undefined;
    getFooterTexts(): {
        text1: string;
        text2: string;
        text3: string;
    };
    getImages(): Record<string, ImageSection>;
    getImage(type: string): ImageSection | undefined;
    getLastEditor(): {
        id?: string;
        name?: string;
    };
    getLastUpdateDate(): Date;
    getCreatedAt(): Date;
    getVersion(): number;
    isPublished(): boolean;
    hasImage(type: string): boolean;
    isComplete(): boolean;
    canEdit(): boolean;
    updateHeroSection(title: string, subtitle: string, description: string, editorId?: string, editorName?: string): HomepageContent;
    updateOfferSection(title: string, subtitle: string, editorId?: string, editorName?: string): HomepageContent;
    updateSection(sectionId: string, title: string, description: string, editorId?: string, editorName?: string): HomepageContent;
    updateFooter(text1: string, text2: string, text3: string, editorId?: string, editorName?: string): HomepageContent;
    uploadImage(type: string, buffer: Buffer, mimeType: string, editorId?: string, editorName?: string): HomepageContent;
    removeImage(type: string, editorId?: string, editorName?: string): HomepageContent;
    toggleSectionVisibility(sectionId: string, editorId?: string, editorName?: string): HomepageContent;
    publish(editorId?: string, editorName?: string): HomepageContent;
    unpublish(editorId?: string, editorName?: string): HomepageContent;
    getContentStatistics(): {
        totalSections: number;
        visibleSections: number;
        totalImages: number;
        totalCharacters: number;
        completionPercentage: number;
        lastUpdateDaysAgo: number;
    };
    private calculateCompletionPercentage;
}
//# sourceMappingURL=HomepageContent.d.ts.map