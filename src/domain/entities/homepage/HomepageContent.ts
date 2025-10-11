/**
 * Homepage Content Entity - Domain Layer
 *
 * Representa el contenido editable de la página principal
 */

export interface ImageSection {
  id: string;
  type: 'hero' | 'section1' | 'section2' | 'section3' | 'section4';
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
  
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  
  // What We Offer Section
  offerTitle: string;
  offerSubtitle: string;
  
  // Content Sections
  sections: ContentSection[];
  
  // Footer Content
  footerText1: string;
  footerText2: string;
  footerText3: string;
  
  // Images
  images: Record<string, ImageSection>;
  
  // Metadata
  lastEditorId?: string;
  lastEditorName?: string;
  lastUpdateDate: Date;
  createdAt: Date;
  version: number;
  isPublished: boolean;
}

export class HomepageContent {
  constructor(private data: HomepageContentData) {
    this.validateData();
  }

  public static create(
    heroTitle: string,
    heroSubtitle: string,
    heroDescription: string,
    editorId?: string,
    editorName?: string
  ): HomepageContent {
    const now = new Date();
    
    const contentData: HomepageContentData = {
      id: `homepage-${Date.now()}`,
      heroTitle: heroTitle.trim(),
      heroSubtitle: heroSubtitle.trim(),
      heroDescription: heroDescription.trim(),
      offerTitle: '¿Qué Ofrecemos?',
      offerSubtitle: 'Descubre todas las oportunidades de crecimiento académico y profesional',
      sections: [
        {
          id: 'section-1',
          title: 'Cursos Especializados',
          description: 'Amplia variedad de cursos técnicos y académicos para tu desarrollo profesional',
          order: 1,
          isVisible: true
        },
        {
          id: 'section-2', 
          title: 'Eventos Académicos',
          description: 'Conferencias, seminarios y talleres con expertos de la industria',
          order: 2,
          isVisible: true
        },
        {
          id: 'section-3',
          title: 'Certificaciones Oficiales', 
          description: 'Certificados oficiales reconocidos por la industria',
          order: 3,
          isVisible: true
        },
        {
          id: 'section-4',
          title: 'Comunidad Académica',
          description: 'Ambiente colaborativo de excelencia educativa e innovación',
          order: 4,
          isVisible: true
        }
      ],
      footerText1: 'Facultad de Ingeniería en Sistemas, Electrónica e Industrial',
      footerText2: 'Universidad Técnica de Ambato - Campus Huachi',
      footerText3: '© 2024 FISEI-UTA. Todos los derechos reservados.',
      images: {},
      lastEditorId: editorId,
      lastEditorName: editorName,
      lastUpdateDate: now,
      createdAt: now,
      version: 1,
      isPublished: true
    };

    return new HomepageContent(contentData);
  }

  public static fromPrismaData(homepageData: any): HomepageContent {
    const contentData: HomepageContentData = {
      id: homepageData.id_pag?.toString() || 'homepage-1',
      heroTitle: homepageData.titulo_hero || '',
      heroSubtitle: homepageData.subtitulo_hero || '',
      heroDescription: homepageData.descripcion_hero || '',
      offerTitle: homepageData.titulo_ofrecemos || '¿Qué Ofrecemos?',
      offerSubtitle: homepageData.subtitulo_ofrecemos || '',
      sections: [
        {
          id: 'section-1',
          title: homepageData.titulo_seccion1 || '',
          description: homepageData.descripcion_seccion1 || '',
          order: 1,
          isVisible: true
        },
        {
          id: 'section-2',
          title: homepageData.titulo_seccion2 || '',
          description: homepageData.descripcion_seccion2 || '',
          order: 2,
          isVisible: true
        },
        {
          id: 'section-3',
          title: homepageData.titulo_seccion3 || '',
          description: homepageData.descripcion_seccion3 || '',
          order: 3,
          isVisible: true
        },
        {
          id: 'section-4',
          title: homepageData.titulo_seccion4 || '',
          description: homepageData.descripcion_seccion4 || '',
          order: 4,
          isVisible: true
        }
      ],
      footerText1: homepageData.texto_footer1 || '',
      footerText2: homepageData.texto_footer2 || '',
      footerText3: homepageData.texto_footer3 || '',
      images: HomepageContent.mapImagesFromPrisma(homepageData),
      lastEditorId: homepageData.id_usuario_ultima_edicion?.toString(),
      lastEditorName: homepageData.ultimoEditor?.nombre_completo_usu,
      lastUpdateDate: homepageData.fecha_ultima_actualizacion || new Date(),
      createdAt: homepageData.fecha_creacion || new Date(),
      version: homepageData.version || 1,
      isPublished: homepageData.publicado !== false
    };

    return new HomepageContent(contentData);
  }

  private static mapImagesFromPrisma(homepageData: any): Record<string, ImageSection> {
    const images: Record<string, ImageSection> = {};
    
    const imageTypes = ['hero', 'seccion1', 'seccion2', 'seccion3', 'seccion4'];
    
    imageTypes.forEach(type => {
      const buffer = homepageData[`imagen_${type}`];
      if (buffer) {
        images[type] = {
          id: `image-${type}`,
          type: type === 'seccion1' ? 'section1' : 
                type === 'seccion2' ? 'section2' :
                type === 'seccion3' ? 'section3' :
                type === 'seccion4' ? 'section4' : 'hero',
          buffer,
          mimeType: HomepageContent.detectMimeType(buffer),
          uploadedAt: homepageData.fecha_ultima_actualizacion,
          uploadedBy: homepageData.ultimoEditor?.nombre_completo_usu
        };
      }
    });

    return images;
  }

  private static detectMimeType(buffer: Buffer): string {
    if (!buffer || buffer.length < 4) return 'image/jpeg';
    
    // Detect format by magic numbers
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      return 'image/jpeg';
    } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return 'image/png';
    } else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return 'image/gif';
    } else if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      return 'image/webp';
    }
    
    return 'image/jpeg';
  }

  private validateData(): void {
    if (!this.data.heroTitle?.trim()) {
      throw new Error("Hero title is required");
    }

    if (this.data.heroTitle.length > 200) {
      throw new Error("Hero title cannot exceed 200 characters");
    }

    if (!this.data.heroDescription?.trim()) {
      throw new Error("Hero description is required");
    }

    if (this.data.heroDescription.length > 1000) {
      throw new Error("Hero description cannot exceed 1000 characters");
    }

    if (!this.data.sections || this.data.sections.length === 0) {
      throw new Error("At least one content section is required");
    }

    this.data.sections.forEach((section, index) => {
      if (!section.title?.trim()) {
        throw new Error(`Section ${index + 1} title is required`);
      }
      
      if (section.title.length > 100) {
        throw new Error(`Section ${index + 1} title cannot exceed 100 characters`);
      }
      
      if (!section.description?.trim()) {
        throw new Error(`Section ${index + 1} description is required`);
      }
      
      if (section.description.length > 2000) {
        throw new Error(`Section ${index + 1} description cannot exceed 2000 characters`);
      }
    });

    if (this.data.version < 1) {
      throw new Error("Version must be greater than 0");
    }
  }

  // Getters
  public getId(): string {
    return this.data.id;
  }

  public getHeroTitle(): string {
    return this.data.heroTitle;
  }

  public getHeroSubtitle(): string {
    return this.data.heroSubtitle;
  }

  public getHeroDescription(): string {
    return this.data.heroDescription;
  }

  public getOfferTitle(): string {
    return this.data.offerTitle;
  }

  public getOfferSubtitle(): string {
    return this.data.offerSubtitle;
  }

  public getSections(): ContentSection[] {
    return [...this.data.sections];
  }

  public getVisibleSections(): ContentSection[] {
    return this.data.sections.filter(section => section.isVisible);
  }

  public getSectionById(sectionId: string): ContentSection | undefined {
    return this.data.sections.find(section => section.id === sectionId);
  }

  public getFooterTexts(): { text1: string; text2: string; text3: string } {
    return {
      text1: this.data.footerText1,
      text2: this.data.footerText2,
      text3: this.data.footerText3
    };
  }

  public getImages(): Record<string, ImageSection> {
    return { ...this.data.images };
  }

  public getImage(type: string): ImageSection | undefined {
    return this.data.images[type];
  }

  public getLastEditor(): { id?: string; name?: string } {
    return {
      id: this.data.lastEditorId,
      name: this.data.lastEditorName
    };
  }

  public getLastUpdateDate(): Date {
    return this.data.lastUpdateDate;
  }

  public getCreatedAt(): Date {
    return this.data.createdAt;
  }

  public getVersion(): number {
    return this.data.version;
  }

  public isPublished(): boolean {
    return this.data.isPublished;
  }

  // Status checks
  public hasImage(type: string): boolean {
    return !!this.data.images[type]?.buffer;
  }

  public isComplete(): boolean {
    return !!(
      this.data.heroTitle &&
      this.data.heroDescription &&
      this.data.sections.length > 0 &&
      this.data.sections.every(s => s.title && s.description)
    );
  }

  public canEdit(): boolean {
    return this.data.isPublished;
  }

  // Actions
  public updateHeroSection(
    title: string, 
    subtitle: string, 
    description: string, 
    editorId?: string,
    editorName?: string
  ): HomepageContent {
    const updatedData = {
      ...this.data,
      heroTitle: title.trim(),
      heroSubtitle: subtitle.trim(),
      heroDescription: description.trim(),
      lastEditorId: editorId,
      lastEditorName: editorName,
      lastUpdateDate: new Date(),
      version: this.data.version + 1
    };

    return new HomepageContent(updatedData);
  }

  public updateOfferSection(
    title: string, 
    subtitle: string, 
    editorId?: string,
    editorName?: string
  ): HomepageContent {
    const updatedData = {
      ...this.data,
      offerTitle: title.trim(),
      offerSubtitle: subtitle.trim(),
      lastEditorId: editorId,
      lastEditorName: editorName,
      lastUpdateDate: new Date(),
      version: this.data.version + 1
    };

    return new HomepageContent(updatedData);
  }

  public updateSection(
    sectionId: string,
    title: string,
    description: string,
    editorId?: string,
    editorName?: string
  ): HomepageContent {
    const sectionIndex = this.data.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) {
      throw new Error(`Section ${sectionId} not found`);
    }

    const currentSection = this.data.sections[sectionIndex];
    if (!currentSection) {
      throw new Error(`Section ${sectionId} not found`);
    }

    const updatedSections = [...this.data.sections];
    updatedSections[sectionIndex] = {
      id: currentSection.id,
      title: title.trim(),
      description: description.trim(),
      order: currentSection.order,
      isVisible: currentSection.isVisible
    };

    const updatedData = {
      ...this.data,
      sections: updatedSections,
      lastEditorId: editorId,
      lastEditorName: editorName,
      lastUpdateDate: new Date(),
      version: this.data.version + 1
    };

    return new HomepageContent(updatedData);
  }

  public updateFooter(
    text1: string,
    text2: string,
    text3: string,
    editorId?: string,
    editorName?: string
  ): HomepageContent {
    const updatedData = {
      ...this.data,
      footerText1: text1.trim(),
      footerText2: text2.trim(),
      footerText3: text3.trim(),
      lastEditorId: editorId,
      lastEditorName: editorName,
      lastUpdateDate: new Date(),
      version: this.data.version + 1
    };

    return new HomepageContent(updatedData);
  }

  public uploadImage(
    type: string,
    buffer: Buffer,
    mimeType: string,
    editorId?: string,
    editorName?: string
  ): HomepageContent {
    if (!buffer || buffer.length === 0) {
      throw new Error("Image buffer is required");
    }

    if (buffer.length > 5 * 1024 * 1024) { // 5MB limit
      throw new Error("Image size cannot exceed 5MB");
    }

    const validTypes = ['hero', 'section1', 'section2', 'section3', 'section4'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid image type: ${type}`);
    }

    const imageSection: ImageSection = {
      id: `image-${type}`,
      type: type as any,
      buffer,
      mimeType,
      uploadedAt: new Date(),
      uploadedBy: editorName
    };

    const updatedImages = {
      ...this.data.images,
      [type]: imageSection
    };

    const updatedData = {
      ...this.data,
      images: updatedImages,
      lastEditorId: editorId,
      lastEditorName: editorName,
      lastUpdateDate: new Date(),
      version: this.data.version + 1
    };

    return new HomepageContent(updatedData);
  }

  public removeImage(
    type: string,
    editorId?: string,
    editorName?: string
  ): HomepageContent {
    if (!this.data.images[type]) {
      throw new Error(`Image ${type} not found`);
    }

    const updatedImages = { ...this.data.images };
    delete updatedImages[type];

    const updatedData = {
      ...this.data,
      images: updatedImages,
      lastEditorId: editorId,
      lastEditorName: editorName,
      lastUpdateDate: new Date(),
      version: this.data.version + 1
    };

    return new HomepageContent(updatedData);
  }

  public toggleSectionVisibility(
    sectionId: string,
    editorId?: string,
    editorName?: string
  ): HomepageContent {
    const sectionIndex = this.data.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) {
      throw new Error(`Section ${sectionId} not found`);
    }

    const currentSection = this.data.sections[sectionIndex];
    if (!currentSection) {
      throw new Error(`Section ${sectionId} not found`);
    }

    const updatedSections = [...this.data.sections];
    updatedSections[sectionIndex] = {
      id: currentSection.id,
      title: currentSection.title,
      description: currentSection.description,
      order: currentSection.order,
      isVisible: !currentSection.isVisible
    };

    const updatedData = {
      ...this.data,
      sections: updatedSections,
      lastEditorId: editorId,
      lastEditorName: editorName,
      lastUpdateDate: new Date(),
      version: this.data.version + 1
    };

    return new HomepageContent(updatedData);
  }

  public publish(editorId?: string, editorName?: string): HomepageContent {
    if (!this.isComplete()) {
      throw new Error("Cannot publish incomplete homepage content");
    }

    const updatedData = {
      ...this.data,
      isPublished: true,
      lastEditorId: editorId,
      lastEditorName: editorName,
      lastUpdateDate: new Date(),
      version: this.data.version + 1
    };

    return new HomepageContent(updatedData);
  }

  public unpublish(editorId?: string, editorName?: string): HomepageContent {
    const updatedData = {
      ...this.data,
      isPublished: false,
      lastEditorId: editorId,
      lastEditorName: editorName,
      lastUpdateDate: new Date(),
      version: this.data.version + 1
    };

    return new HomepageContent(updatedData);
  }

  // Statistics and analysis
  public getContentStatistics() {
    return {
      totalSections: this.data.sections.length,
      visibleSections: this.data.sections.filter(s => s.isVisible).length,
      totalImages: Object.keys(this.data.images).length,
      totalCharacters: this.data.heroDescription.length + 
                      this.data.sections.reduce((sum, s) => sum + s.description.length, 0),
      completionPercentage: this.calculateCompletionPercentage(),
      lastUpdateDaysAgo: Math.floor((new Date().getTime() - this.data.lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24))
    };
  }

  private calculateCompletionPercentage(): number {
    let completedItems = 0;
    let totalItems = 0;

    // Hero section (3 items: title, subtitle, description)
    totalItems += 3;
    if (this.data.heroTitle) completedItems++;
    if (this.data.heroSubtitle) completedItems++;
    if (this.data.heroDescription) completedItems++;

    // Sections (title and description for each)
    this.data.sections.forEach(section => {
      totalItems += 2;
      if (section.title) completedItems++;
      if (section.description) completedItems++;
    });

    // Footer (3 items)
    totalItems += 3;
    if (this.data.footerText1) completedItems++;
    if (this.data.footerText2) completedItems++;
    if (this.data.footerText3) completedItems++;

    // Images (optional, 5 items)
    totalItems += 5;
    Object.keys(this.data.images).forEach(key => {
      if (this.data.images[key]?.buffer) completedItems++;
    });

    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  }
}