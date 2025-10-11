/**
 * EventCategory Entity - Domain Layer
 *
 * Representa una categoría de eventos con todas sus propiedades y reglas de negocio
 */

export interface EventCategoryStatistics {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  totalEnrollments: number;
  averageAttendance: number;
  averageRating?: number;
  revenueGenerated: number;
}

export interface EventCategorySettings {
  defaultDuration: number; // in hours
  defaultCapacity: number;
  defaultRequiresApproval: boolean;
  defaultMinimumAttendance: number; // percentage
  allowVirtualEvents: boolean;
  requiresInstructorApproval: boolean;
  autoPublishEvents: boolean;
}

export interface EventCategoryData {
  id: string;
  
  // Basic Information
  name: string;
  description: string;
  code?: string;
  
  // Visual and Branding
  color?: string;
  icon?: string;
  imageUrl?: string;
  
  // Configuration
  settings: EventCategorySettings;
  
  // Content and Templates
  certificateTemplate?: string;
  emailTemplates: {
    enrollment?: string;
    reminder?: string;
    completion?: string;
    cancellation?: string;
  };
  
  // Restrictions and Rules
  restrictions: {
    maxEventsPerMonth?: number;
    maxCapacityPerEvent?: number;
    restrictedToRoles?: string[];
    requiresSpecialApproval: boolean;
    minimumAdvanceNotice: number; // days
  };
  
  // Statistics and Analytics
  statistics: EventCategoryStatistics;
  
  // Metadata
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastModifiedBy?: string;
  
  // SEO and Discovery
  keywords: string[];
  isPopular: boolean;
  isFeatured: boolean;
  
  // Associated Data
  parentCategoryId?: string;
  subcategoryIds: string[];
}

export class EventCategory {
  constructor(private data: EventCategoryData) {
    this.validateData();
  }

  public static create(
    name: string,
    description: string,
    code?: string,
    color?: string,
    createdBy?: string
  ): EventCategory {
    const now = new Date();
    
    const categoryData: EventCategoryData = {
      id: `event-category-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      code: code?.trim().toUpperCase(),
      color: color || '#007bff',
      
      settings: {
        defaultDuration: 2, // 2 hours
        defaultCapacity: 50,
        defaultRequiresApproval: false,
        defaultMinimumAttendance: 80,
        allowVirtualEvents: true,
        requiresInstructorApproval: false,
        autoPublishEvents: true
      },
      
      emailTemplates: {},
      
      restrictions: {
        requiresSpecialApproval: false,
        minimumAdvanceNotice: 7 // 7 days
      },
      
      statistics: {
        totalEvents: 0,
        activeEvents: 0,
        completedEvents: 0,
        totalEnrollments: 0,
        averageAttendance: 0,
        revenueGenerated: 0
      },
      
      isActive: true,
      displayOrder: 0,
      createdAt: now,
      updatedAt: now,
      createdBy,
      
      keywords: [],
      isPopular: false,
      isFeatured: false,
      
      subcategoryIds: []
    };

    return new EventCategory(categoryData);
  }

  public static fromPrismaData(categoryData: any): EventCategory {
    const category: EventCategoryData = {
      id: categoryData.id_cat?.toString() || '',
      name: categoryData.nom_cat || '',
      description: categoryData.des_cat || '',
      code: categoryData.codigo_cat,
      color: categoryData.color_cat || '#007bff',
      icon: categoryData.icono_cat,
      imageUrl: categoryData.imagen_cat,
      
      settings: {
        defaultDuration: categoryData.duracion_default || 2,
        defaultCapacity: categoryData.capacidad_default || 50,
        defaultRequiresApproval: categoryData.requiere_aprobacion_default === true,
        defaultMinimumAttendance: categoryData.asistencia_minima_default || 80,
        allowVirtualEvents: categoryData.permite_eventos_virtuales !== false,
        requiresInstructorApproval: categoryData.requiere_aprobacion_instructor === true,
        autoPublishEvents: categoryData.auto_publicar_eventos !== false
      },
      
      emailTemplates: {
        enrollment: categoryData.plantilla_email_inscripcion,
        reminder: categoryData.plantilla_email_recordatorio,
        completion: categoryData.plantilla_email_completado,
        cancellation: categoryData.plantilla_email_cancelacion
      },
      
      restrictions: {
        maxEventsPerMonth: categoryData.max_eventos_mes,
        maxCapacityPerEvent: categoryData.max_capacidad_evento,
        restrictedToRoles: categoryData.roles_restringidos ? JSON.parse(categoryData.roles_restringidos) : undefined,
        requiresSpecialApproval: categoryData.requiere_aprobacion_especial === true,
        minimumAdvanceNotice: categoryData.aviso_minimo_dias || 7
      },
      
      statistics: {
        totalEvents: categoryData._count?.eventos || 0,
        activeEvents: categoryData.eventos_activos_count || 0,
        completedEvents: categoryData.eventos_completados_count || 0,
        totalEnrollments: categoryData.total_inscripciones || 0,
        averageAttendance: categoryData.promedio_asistencia || 0,
        averageRating: categoryData.promedio_calificacion,
        revenueGenerated: categoryData.ingresos_generados || 0
      },
      
      isActive: categoryData.activa !== false,
      displayOrder: categoryData.orden_visualizacion || 0,
      createdAt: categoryData.fecha_creacion ? new Date(categoryData.fecha_creacion) : new Date(),
      updatedAt: categoryData.fecha_actualizacion ? new Date(categoryData.fecha_actualizacion) : new Date(),
      createdBy: categoryData.creado_por,
      lastModifiedBy: categoryData.modificado_por,
      
      keywords: categoryData.palabras_clave ? JSON.parse(categoryData.palabras_clave) : [],
      isPopular: categoryData.es_popular === true,
      isFeatured: categoryData.es_destacada === true,
      
      parentCategoryId: categoryData.id_categoria_padre?.toString(),
      subcategoryIds: (categoryData.subcategorias || []).map((sub: any) => sub.id_cat.toString())
    };

    return new EventCategory(category);
  }

  private validateData(): void {
    if (!this.data.name?.trim()) {
      throw new Error("Category name is required");
    }

    if (!this.data.description?.trim()) {
      throw new Error("Category description is required");
    }

    if (this.data.code && this.data.code.length > 10) {
      throw new Error("Category code cannot exceed 10 characters");
    }

    if (this.data.settings.defaultDuration <= 0) {
      throw new Error("Default duration must be greater than 0");
    }

    if (this.data.settings.defaultCapacity <= 0) {
      throw new Error("Default capacity must be greater than 0");
    }

    if (this.data.settings.defaultMinimumAttendance < 0 || 
        this.data.settings.defaultMinimumAttendance > 100) {
      throw new Error("Default minimum attendance must be between 0 and 100");
    }

    if (this.data.restrictions.minimumAdvanceNotice < 0) {
      throw new Error("Minimum advance notice cannot be negative");
    }

    if (this.data.displayOrder < 0) {
      throw new Error("Display order cannot be negative");
    }
  }

  // Getters
  public getId(): string {
    return this.data.id;
  }

  public getName(): string {
    return this.data.name;
  }

  public getDescription(): string {
    return this.data.description;
  }

  public getCode(): string | undefined {
    return this.data.code;
  }

  public getColor(): string | undefined {
    return this.data.color;
  }

  public getIcon(): string | undefined {
    return this.data.icon;
  }

  public getImageUrl(): string | undefined {
    return this.data.imageUrl;
  }

  public getSettings(): EventCategorySettings {
    return { ...this.data.settings };
  }

  public getEmailTemplates(): typeof this.data.emailTemplates {
    return { ...this.data.emailTemplates };
  }

  public getRestrictions(): typeof this.data.restrictions {
    return { ...this.data.restrictions };
  }

  public getStatistics(): EventCategoryStatistics {
    return { ...this.data.statistics };
  }

  public getDisplayOrder(): number {
    return this.data.displayOrder;
  }

  public getKeywords(): string[] {
    return [...this.data.keywords];
  }

  public getParentCategoryId(): string | undefined {
    return this.data.parentCategoryId;
  }

  public getSubcategoryIds(): string[] {
    return [...this.data.subcategoryIds];
  }

  public getCreatedAt(): Date {
    return this.data.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.data.updatedAt;
  }

  public getCreatedBy(): string | undefined {
    return this.data.createdBy;
  }

  // Status checks
  public isActive(): boolean {
    return this.data.isActive;
  }

  public isPopular(): boolean {
    return this.data.isPopular;
  }

  public isFeatured(): boolean {
    return this.data.isFeatured;
  }

  public hasSubcategories(): boolean {
    return this.data.subcategoryIds.length > 0;
  }

  public hasParentCategory(): boolean {
    return !!this.data.parentCategoryId;
  }

  public allowsVirtualEvents(): boolean {
    return this.data.settings.allowVirtualEvents;
  }

  public requiresInstructorApproval(): boolean {
    return this.data.settings.requiresInstructorApproval;
  }

  public requiresSpecialApproval(): boolean {
    return this.data.restrictions.requiresSpecialApproval;
  }

  public autoPublishesEvents(): boolean {
    return this.data.settings.autoPublishEvents;
  }

  public hasEventLimit(): boolean {
    return !!this.data.restrictions.maxEventsPerMonth;
  }

  public hasCapacityLimit(): boolean {
    return !!this.data.restrictions.maxCapacityPerEvent;
  }

  public isRestrictedToRoles(): boolean {
    return !!this.data.restrictions.restrictedToRoles && this.data.restrictions.restrictedToRoles.length > 0;
  }

  // Validation methods
  public canCreateEvent(
    organizerRoles: string[],
    eventsThisMonth: number,
    eventCapacity: number,
    advanceNotice: number
  ): {
    canCreate: boolean;
    reason?: string;
  } {
    if (!this.data.isActive) {
      return { canCreate: false, reason: "Category is not active" };
    }

    if (this.isRestrictedToRoles()) {
      const hasRequiredRole = organizerRoles.some(role => 
        this.data.restrictions.restrictedToRoles!.includes(role)
      );
      
      if (!hasRequiredRole) {
        return { 
          canCreate: false, 
          reason: `Category is restricted to roles: ${this.data.restrictions.restrictedToRoles!.join(', ')}` 
        };
      }
    }

    if (this.hasEventLimit()) {
      if (eventsThisMonth >= this.data.restrictions.maxEventsPerMonth!) {
        return { 
          canCreate: false, 
          reason: `Monthly event limit reached (${this.data.restrictions.maxEventsPerMonth})` 
        };
      }
    }

    if (this.hasCapacityLimit()) {
      if (eventCapacity > this.data.restrictions.maxCapacityPerEvent!) {
        return { 
          canCreate: false, 
          reason: `Event capacity exceeds category limit (${this.data.restrictions.maxCapacityPerEvent})` 
        };
      }
    }

    if (advanceNotice < this.data.restrictions.minimumAdvanceNotice) {
      return { 
        canCreate: false, 
        reason: `Minimum advance notice is ${this.data.restrictions.minimumAdvanceNotice} days` 
      };
    }

    return { canCreate: true };
  }

  // Actions
  public updateBasicInfo(
    name?: string,
    description?: string,
    code?: string,
    color?: string,
    updatedBy?: string
  ): EventCategory {
    const updates: Partial<EventCategoryData> = {
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    if (name && name.trim()) {
      updates.name = name.trim();
    }

    if (description && description.trim()) {
      updates.description = description.trim();
    }

    if (code !== undefined) {
      updates.code = code?.trim().toUpperCase() || undefined;
    }

    if (color && color.trim()) {
      updates.color = color.trim();
    }

    const updatedData = { ...this.data, ...updates };
    return new EventCategory(updatedData);
  }

  public updateVisualElements(
    icon?: string,
    imageUrl?: string,
    updatedBy?: string
  ): EventCategory {
    const updatedData = {
      ...this.data,
      icon: icon?.trim() || this.data.icon,
      imageUrl: imageUrl?.trim() || this.data.imageUrl,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new EventCategory(updatedData);
  }

  public updateSettings(
    settings: Partial<EventCategorySettings>,
    updatedBy?: string
  ): EventCategory {
    const updatedSettings = { ...this.data.settings, ...settings };

    // Validate updated settings
    if (updatedSettings.defaultDuration <= 0) {
      throw new Error("Default duration must be greater than 0");
    }

    if (updatedSettings.defaultCapacity <= 0) {
      throw new Error("Default capacity must be greater than 0");
    }

    if (updatedSettings.defaultMinimumAttendance < 0 || 
        updatedSettings.defaultMinimumAttendance > 100) {
      throw new Error("Default minimum attendance must be between 0 and 100");
    }

    const updatedData = {
      ...this.data,
      settings: updatedSettings,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new EventCategory(updatedData);
  }

  public updateEmailTemplates(
    templates: Partial<typeof this.data.emailTemplates>,
    updatedBy?: string
  ): EventCategory {
    const updatedTemplates = { ...this.data.emailTemplates, ...templates };

    const updatedData = {
      ...this.data,
      emailTemplates: updatedTemplates,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new EventCategory(updatedData);
  }

  public updateRestrictions(
    restrictions: Partial<typeof this.data.restrictions>,
    updatedBy?: string
  ): EventCategory {
    const updatedRestrictions = { ...this.data.restrictions, ...restrictions };

    // Validate restrictions
    if (updatedRestrictions.minimumAdvanceNotice < 0) {
      throw new Error("Minimum advance notice cannot be negative");
    }

    if (updatedRestrictions.maxEventsPerMonth !== undefined && updatedRestrictions.maxEventsPerMonth <= 0) {
      throw new Error("Maximum events per month must be greater than 0");
    }

    if (updatedRestrictions.maxCapacityPerEvent !== undefined && updatedRestrictions.maxCapacityPerEvent <= 0) {
      throw new Error("Maximum capacity per event must be greater than 0");
    }

    const updatedData = {
      ...this.data,
      restrictions: updatedRestrictions,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new EventCategory(updatedData);
  }

  public addKeyword(keyword: string, updatedBy?: string): EventCategory {
    if (!keyword?.trim()) {
      throw new Error("Keyword cannot be empty");
    }

    const trimmedKeyword = keyword.trim().toLowerCase();
    if (this.data.keywords.includes(trimmedKeyword)) {
      throw new Error("Keyword already exists");
    }

    const updatedData = {
      ...this.data,
      keywords: [...this.data.keywords, trimmedKeyword],
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new EventCategory(updatedData);
  }

  public removeKeyword(keyword: string, updatedBy?: string): EventCategory {
    const updatedKeywords = this.data.keywords.filter(k => k !== keyword.toLowerCase());

    const updatedData = {
      ...this.data,
      keywords: updatedKeywords,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new EventCategory(updatedData);
  }

  public addSubcategory(subcategoryId: string, updatedBy?: string): EventCategory {
    if (this.data.subcategoryIds.includes(subcategoryId)) {
      throw new Error("Subcategory already exists");
    }

    const updatedData = {
      ...this.data,
      subcategoryIds: [...this.data.subcategoryIds, subcategoryId],
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new EventCategory(updatedData);
  }

  public removeSubcategory(subcategoryId: string, updatedBy?: string): EventCategory {
    const updatedSubcategoryIds = this.data.subcategoryIds.filter(id => id !== subcategoryId);

    const updatedData = {
      ...this.data,
      subcategoryIds: updatedSubcategoryIds,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new EventCategory(updatedData);
  }

  public setParentCategory(parentCategoryId: string | undefined, updatedBy?: string): EventCategory {
    const updatedData = {
      ...this.data,
      parentCategoryId,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new EventCategory(updatedData);
  }

  public activate(updatedBy?: string): EventCategory {
    const updatedData = {
      ...this.data,
      isActive: true,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new EventCategory(updatedData);
  }

  public deactivate(updatedBy?: string): EventCategory {
    const updatedData = {
      ...this.data,
      isActive: false,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new EventCategory(updatedData);
  }

  public setDisplayOrder(order: number, updatedBy?: string): EventCategory {
    if (order < 0) {
      throw new Error("Display order cannot be negative");
    }

    const updatedData = {
      ...this.data,
      displayOrder: order,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new EventCategory(updatedData);
  }

  public markAsPopular(updatedBy?: string): EventCategory {
    const updatedData = {
      ...this.data,
      isPopular: true,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new EventCategory(updatedData);
  }

  public unmarkAsPopular(updatedBy?: string): EventCategory {
    const updatedData = {
      ...this.data,
      isPopular: false,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new EventCategory(updatedData);
  }

  public markAsFeatured(updatedBy?: string): EventCategory {
    const updatedData = {
      ...this.data,
      isFeatured: true,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new EventCategory(updatedData);
  }

  public unmarkAsFeatured(updatedBy?: string): EventCategory {
    const updatedData = {
      ...this.data,
      isFeatured: false,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new EventCategory(updatedData);
  }

  public updateStatistics(statistics: Partial<EventCategoryStatistics>): EventCategory {
    const updatedStatistics = { ...this.data.statistics, ...statistics };

    const updatedData = {
      ...this.data,
      statistics: updatedStatistics,
      updatedAt: new Date()
    };

    return new EventCategory(updatedData);
  }

  // Analytics and reporting
  public getAverageEventsPerMonth(): number {
    if (this.data.statistics.totalEvents === 0) return 0;
    
    const monthsActive = Math.max(1, Math.floor(
      (new Date().getTime() - this.data.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
    ));
    
    return this.data.statistics.totalEvents / monthsActive;
  }

  public getCompletionRate(): number {
    if (this.data.statistics.totalEvents === 0) return 0;
    return (this.data.statistics.completedEvents / this.data.statistics.totalEvents) * 100;
  }

  public getAverageEnrollmentsPerEvent(): number {
    if (this.data.statistics.totalEvents === 0) return 0;
    return this.data.statistics.totalEnrollments / this.data.statistics.totalEvents;
  }

  public getCategorySummary() {
    return {
      id: this.data.id,
      name: this.data.name,
      description: this.data.description,
      code: this.data.code,
      color: this.data.color,
      isActive: this.data.isActive,
      isPopular: this.data.isPopular,
      isFeatured: this.data.isFeatured,
      displayOrder: this.data.displayOrder,
      totalEvents: this.data.statistics.totalEvents,
      activeEvents: this.data.statistics.activeEvents,
      completionRate: this.getCompletionRate(),
      averageEnrollmentsPerEvent: this.getAverageEnrollmentsPerEvent(),
      averageAttendance: this.data.statistics.averageAttendance,
      revenueGenerated: this.data.statistics.revenueGenerated,
      hasSubcategories: this.hasSubcategories(),
      subcategoryCount: this.data.subcategoryIds.length
    };
  }

  public getDetailedReport() {
    return {
      ...this.getCategorySummary(),
      settings: this.data.settings,
      restrictions: this.data.restrictions,
      statistics: this.data.statistics,
      keywords: this.data.keywords,
      parentCategoryId: this.data.parentCategoryId,
      subcategoryIds: this.data.subcategoryIds,
      emailTemplates: this.data.emailTemplates,
      icon: this.data.icon,
      imageUrl: this.data.imageUrl,
      createdAt: this.data.createdAt,
      updatedAt: this.data.updatedAt,
      createdBy: this.data.createdBy,
      lastModifiedBy: this.data.lastModifiedBy,
      averageEventsPerMonth: this.getAverageEventsPerMonth()
    };
  }
}