/**
 * Event Entity - Domain Layer
 *
 * Representa un evento con todas sus propiedades, validaciones y reglas de negocio
 */

export type EventArea = 'PRACTICA' | 'INVESTIGACION' | 'ACADEMICA' | 'TECNICA' | 'INDUSTRIAL' | 'EMPRESARIAL' | 'IA' | 'REDES';
export type EventAudience = 'CARRERA_ESPECIFICA' | 'TODAS_CARRERAS' | 'PUBLICO_GENERAL';
export type EventStatus = 'ACTIVO' | 'INACTIVO' | 'CANCELADO' | 'COMPLETADO' | 'EN_PROCESO';

export interface EventSchedule {
  startDate: Date;
  endDate?: Date;
  startTime: Date;
  endTime?: Date;
  duration: number; // in hours
}

export interface EventLocation {
  venue: string;
  address?: string;
  city?: string;
  capacity: number;
  hasVirtualOption: boolean;
  virtualLink?: string;
}

export interface EventPricing {
  isFree: boolean;
  price?: number;
  currency: string;
  earlyBirdDiscount?: {
    percentage: number;
    validUntil: Date;
  };
  groupDiscount?: {
    minParticipants: number;
    percentage: number;
  };
}

export interface EventRequirements {
  requiresMotivationLetter: boolean;
  requiresDocumentVerification: boolean;
  minimumAttendancePercentage: number;
  requiresApproval?: boolean;
  requiredDocuments: string[];
  prerequisites: string[];
}

export interface EventRegistration {
  isOpen: boolean;
  openDate?: Date;
  closeDate?: Date;
  maxCapacity: number;
  currentEnrollments: number;
  waitingListEnabled: boolean;
  autoApproval: boolean;
}

export interface EventMaterials {
  certificateTemplate?: string;
  presentationFiles: string[];
  resourceLinks: string[];
  recordingUrl?: string;
  handoutFiles: string[];
}

export interface EventFeedback {
  averageRating?: number;
  totalReviews: number;
  feedbackSummary?: string;
  improvementSuggestions: string[];
}

export interface EventData {
  id: string;
  
  // Basic Information
  name: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  
  // Scheduling
  schedule: EventSchedule;
  
  // Location and Capacity
  location: EventLocation;
  
  // Organizational Details
  organizerId: string;
  organizerName?: string;
  organizerEmail?: string;
  instructors: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    biography?: string;
  }>;
  
  // Event Classification
  area: EventArea;
  audience: EventAudience;
  tags: string[];
  
  // Pricing
  pricing: EventPricing;
  
  // Requirements and Approval
  requirements: EventRequirements;
  
  // Registration Management
  registration: EventRegistration;
  
  // Associated Careers (if audience is specific)
  associatedCareers: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  
  // Content and Materials
  materials: EventMaterials;
  
  // Feedback and Analytics
  feedback: EventFeedback;
  
  // Status and Metadata
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastModifiedBy?: string;
  
  // Analytics
  viewCount: number;
  shareCount: number;
  completionRate?: number;
  
  // Publication and Visibility
  isPublished: boolean;
  publishDate?: Date;
  featuredUntil?: Date;
  
  // External Integration
  externalEventId?: string;
  syncWithCalendar: boolean;
}

export class Event {
  constructor(private data: EventData) {
    this.validateData();
  }

  public static create(
    name: string,
    description: string,
    categoryId: string,
    startDate: Date,
    startTime: Date,
    duration: number,
    venue: string,
    capacity: number,
    organizerId: string,
    area: EventArea,
    audience: EventAudience = 'PUBLICO_GENERAL',
    isFree: boolean = true,
    price?: number,
    endDate?: Date,
    endTime?: Date,
    minimumAttendancePercentage: number = 80,
    createdBy?: string
  ): Event {
    const now = new Date();
    
    const eventData: EventData = {
      id: `event-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      categoryId,
      schedule: {
        startDate,
        endDate,
        startTime,
        endTime,
        duration
      },
      location: {
        venue: venue.trim(),
        capacity,
        hasVirtualOption: false
      },
      organizerId,
      instructors: [],
      area,
      audience,
      tags: [],
      pricing: {
        isFree,
        price: isFree ? undefined : price,
        currency: 'CRC'
      },
      requirements: {
        requiresMotivationLetter: true,
        requiresDocumentVerification: false,
        minimumAttendancePercentage,
        requiredDocuments: [],
        prerequisites: []
      },
      registration: {
        isOpen: true,
        maxCapacity: capacity,
        currentEnrollments: 0,
        waitingListEnabled: true,
        autoApproval: true
      },
      associatedCareers: [],
      materials: {
        presentationFiles: [],
        resourceLinks: [],
        handoutFiles: []
      },
      feedback: {
        totalReviews: 0,
        improvementSuggestions: []
      },
      status: 'ACTIVO',
      createdAt: now,
      updatedAt: now,
      createdBy,
      viewCount: 0,
      shareCount: 0,
      isPublished: false,
      syncWithCalendar: false
    };

    return new Event(eventData);
  }

  public static fromPrismaData(eventData: any): Event {
    const event: EventData = {
      id: eventData.id_eve.toString(),
      name: eventData.nom_eve,
      description: eventData.des_eve,
      categoryId: eventData.id_cat_eve?.toString(),
      categoryName: eventData.categoriaEvento?.nom_cat,
      
      schedule: {
        startDate: new Date(eventData.fec_ini_eve),
        endDate: eventData.fec_fin_eve ? new Date(eventData.fec_fin_eve) : undefined,
        startTime: eventData.hor_ini_eve ? new Date(eventData.hor_ini_eve) : new Date(),
        endTime: eventData.hor_fin_eve ? new Date(eventData.hor_fin_eve) : undefined,
        duration: eventData.dur_eve || 1
      },
      
      location: {
        venue: eventData.ubi_eve || '',
        capacity: eventData.capacidad_max_eve || 0,
        hasVirtualOption: false
      },
      
      organizerId: eventData.ced_org_eve?.toString() || '',
      organizerName: eventData.organizador?.nom_org,
      organizerEmail: eventData.organizador?.email_org,
      instructors: [],
      
      area: (eventData.are_eve as EventArea) || 'ACADEMICA',
      audience: (eventData.tipo_audiencia_eve as EventAudience) || 'PUBLICO_GENERAL',
      tags: [],
      
      pricing: {
        isFree: eventData.es_gratuito !== false,
        price: eventData.precio || undefined,
        currency: 'CRC'
      },
      
      requirements: {
        requiresMotivationLetter: eventData.requiere_carta_motivacion !== false,
        requiresDocumentVerification: eventData.requiere_verificacion_docs === true,
        minimumAttendancePercentage: eventData.porcentaje_asistencia_aprobacion || 80,
        requiresApproval: eventData.requiere_aprobacion === true,
        requiredDocuments: [],
        prerequisites: []
      },
      
      registration: {
        isOpen: eventData.estado === 'ACTIVO',
        maxCapacity: eventData.capacidad_max_eve || 0,
        currentEnrollments: eventData._count?.inscripciones || 0,
        waitingListEnabled: true,
        autoApproval: eventData.requiere_aprobacion !== true
      },
      
      associatedCareers: (eventData.eventosPorCarrera || []).map((epc: any) => ({
        id: epc.carrera?.id_car?.toString() || '',
        name: epc.carrera?.nom_car || '',
        code: epc.carrera?.codigo_car || ''
      })),
      
      materials: {
        presentationFiles: [],
        resourceLinks: [],
        handoutFiles: []
      },
      
      feedback: {
        totalReviews: 0,
        improvementSuggestions: []
      },
      
      status: (eventData.estado as EventStatus) || 'ACTIVO',
      createdAt: eventData.created_at ? new Date(eventData.created_at) : new Date(),
      updatedAt: eventData.updated_at ? new Date(eventData.updated_at) : new Date(),
      
      viewCount: 0,
      shareCount: 0,
      isPublished: eventData.estado === 'ACTIVO',
      syncWithCalendar: false
    };

    return new Event(event);
  }

  private validateData(): void {
    if (!this.data.name?.trim()) {
      throw new Error("Event name is required");
    }

    if (!this.data.description?.trim()) {
      throw new Error("Event description is required");
    }

    if (!this.data.categoryId?.trim()) {
      throw new Error("Category ID is required");
    }

    if (!this.data.organizerId?.trim()) {
      throw new Error("Organizer ID is required");
    }

    if (!this.data.location.venue?.trim()) {
      throw new Error("Event venue is required");
    }

    if (this.data.location.capacity <= 0) {
      throw new Error("Event capacity must be greater than 0");
    }

    if (this.data.schedule.duration <= 0) {
      throw new Error("Event duration must be greater than 0");
    }

    if (this.data.schedule.startDate < new Date('2000-01-01')) {
      throw new Error("Event start date must be valid");
    }

    if (this.data.schedule.endDate && this.data.schedule.endDate < this.data.schedule.startDate) {
      throw new Error("Event end date must be after start date");
    }

    if (this.data.requirements.minimumAttendancePercentage < 0 || 
        this.data.requirements.minimumAttendancePercentage > 100) {
      throw new Error("Minimum attendance percentage must be between 0 and 100");
    }

    if (!this.data.pricing.isFree && (!this.data.pricing.price || this.data.pricing.price <= 0)) {
      throw new Error("Paid events must have a positive price");
    }

    if (this.data.pricing.isFree && this.data.pricing.price) {
      throw new Error("Free events cannot have a price");
    }

    if (this.data.registration.currentEnrollments < 0) {
      throw new Error("Current enrollments cannot be negative");
    }

    if (this.data.registration.currentEnrollments > this.data.registration.maxCapacity) {
      throw new Error("Current enrollments cannot exceed maximum capacity");
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

  public getCategoryId(): string {
    return this.data.categoryId;
  }

  public getCategoryName(): string | undefined {
    return this.data.categoryName;
  }

  public getSchedule(): EventSchedule {
    return { ...this.data.schedule };
  }

  public getLocation(): EventLocation {
    return { ...this.data.location };
  }

  public getOrganizerId(): string {
    return this.data.organizerId;
  }

  public getOrganizerName(): string | undefined {
    return this.data.organizerName;
  }

  public getInstructors(): Array<{id: string; name: string; email: string; role: string; biography?: string}> {
    return [...this.data.instructors];
  }

  public getArea(): EventArea {
    return this.data.area;
  }

  public getAudience(): EventAudience {
    return this.data.audience;
  }

  public getTags(): string[] {
    return [...this.data.tags];
  }

  public getPricing(): EventPricing {
    return { ...this.data.pricing };
  }

  public getRequirements(): EventRequirements {
    return { ...this.data.requirements };
  }

  public getRegistration(): EventRegistration {
    return { ...this.data.registration };
  }

  public getAssociatedCareers(): Array<{id: string; name: string; code: string}> {
    return [...this.data.associatedCareers];
  }

  public getMaterials(): EventMaterials {
    return { ...this.data.materials };
  }

  public getFeedback(): EventFeedback {
    return { ...this.data.feedback };
  }

  public getStatus(): EventStatus {
    return this.data.status;
  }

  public getCreatedAt(): Date {
    return this.data.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.data.updatedAt;
  }

  public getViewCount(): number {
    return this.data.viewCount;
  }

  public getCompletionRate(): number | undefined {
    return this.data.completionRate;
  }

  public isPublished(): boolean {
    return this.data.isPublished;
  }

  public isFeatured(): boolean {
    return this.data.featuredUntil ? new Date() < this.data.featuredUntil : false;
  }

  // Status checks
  public isActive(): boolean {
    return this.data.status === 'ACTIVO';
  }

  public isCompleted(): boolean {
    return this.data.status === 'COMPLETADO';
  }

  public isCancelled(): boolean {
    return this.data.status === 'CANCELADO';
  }

  public isInProgress(): boolean {
    return this.data.status === 'EN_PROCESO';
  }

  public isFree(): boolean {
    return this.data.pricing.isFree;
  }

  public isRegistrationOpen(): boolean {
    const now = new Date();
    return this.data.registration.isOpen && 
           this.data.status === 'ACTIVO' &&
           (!this.data.registration.closeDate || now <= this.data.registration.closeDate) &&
           (!this.data.registration.openDate || now >= this.data.registration.openDate);
  }

  public hasCapacity(): boolean {
    return this.data.registration.currentEnrollments < this.data.registration.maxCapacity;
  }

  public isWaitingListEnabled(): boolean {
    return this.data.registration.waitingListEnabled;
  }

  public requiresApproval(): boolean {
    return this.data.requirements.requiresApproval === true;
  }

  public requiresMotivationLetter(): boolean {
    return this.data.requirements.requiresMotivationLetter;
  }

  public hasStarted(): boolean {
    return new Date() >= this.data.schedule.startDate;
  }

  public hasEnded(): boolean {
    const endDate = this.data.schedule.endDate || this.data.schedule.startDate;
    return new Date() > endDate;
  }

  public isUpcoming(): boolean {
    return !this.hasStarted();
  }

  public isOngoing(): boolean {
    return this.hasStarted() && !this.hasEnded();
  }

  public canEnroll(): boolean {
    return this.isRegistrationOpen() && 
           (this.hasCapacity() || this.isWaitingListEnabled()) &&
           this.isUpcoming();
  }

  public canEdit(): boolean {
    return !this.hasStarted() || this.data.status === 'ACTIVO';
  }

  public canCancel(): boolean {
    return this.data.status === 'ACTIVO' && !this.hasEnded();
  }

  // Actions
  public updateBasicInfo(
    name?: string,
    description?: string,
    updatedBy?: string
  ): Event {
    if (!this.canEdit()) {
      throw new Error("Cannot edit event after it has started");
    }

    const updates: Partial<EventData> = {
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    if (name && name.trim()) {
      updates.name = name.trim();
    }

    if (description && description.trim()) {
      updates.description = description.trim();
    }

    const updatedData = { ...this.data, ...updates };
    return new Event(updatedData);
  }

  public updateSchedule(
    startDate?: Date,
    endDate?: Date,
    startTime?: Date,
    endTime?: Date,
    duration?: number,
    updatedBy?: string
  ): Event {
    if (!this.canEdit()) {
      throw new Error("Cannot edit event schedule after it has started");
    }

    const updatedSchedule = { ...this.data.schedule };

    if (startDate) {
      if (startDate < new Date()) {
        throw new Error("Start date cannot be in the past");
      }
      updatedSchedule.startDate = startDate;
    }

    if (endDate) {
      if (endDate < (startDate || this.data.schedule.startDate)) {
        throw new Error("End date cannot be before start date");
      }
      updatedSchedule.endDate = endDate;
    }

    if (startTime) {
      updatedSchedule.startTime = startTime;
    }

    if (endTime) {
      updatedSchedule.endTime = endTime;
    }

    if (duration !== undefined) {
      if (duration <= 0) {
        throw new Error("Duration must be greater than 0");
      }
      updatedSchedule.duration = duration;
    }

    const updatedData = {
      ...this.data,
      schedule: updatedSchedule,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new Event(updatedData);
  }

  public updateLocation(
    venue?: string,
    address?: string,
    city?: string,
    capacity?: number,
    hasVirtualOption?: boolean,
    virtualLink?: string,
    updatedBy?: string
  ): Event {
    const updatedLocation = { ...this.data.location };

    if (venue && venue.trim()) {
      updatedLocation.venue = venue.trim();
    }

    if (address !== undefined) {
      updatedLocation.address = address?.trim() || undefined;
    }

    if (city !== undefined) {
      updatedLocation.city = city?.trim() || undefined;
    }

    if (capacity !== undefined) {
      if (capacity <= 0) {
        throw new Error("Capacity must be greater than 0");
      }
      if (capacity < this.data.registration.currentEnrollments) {
        throw new Error("Cannot reduce capacity below current enrollments");
      }
      updatedLocation.capacity = capacity;
    }

    if (hasVirtualOption !== undefined) {
      updatedLocation.hasVirtualOption = hasVirtualOption;
      if (!hasVirtualOption) {
        updatedLocation.virtualLink = undefined;
      }
    }

    if (virtualLink !== undefined) {
      updatedLocation.virtualLink = virtualLink?.trim() || undefined;
    }

    const updatedRegistration = { ...this.data.registration };
    if (capacity !== undefined) {
      updatedRegistration.maxCapacity = capacity;
    }

    const updatedData = {
      ...this.data,
      location: updatedLocation,
      registration: updatedRegistration,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new Event(updatedData);
  }

  public updatePricing(
    isFree?: boolean,
    price?: number,
    currency?: string,
    updatedBy?: string
  ): Event {
    if (!this.canEdit()) {
      throw new Error("Cannot edit event pricing after it has started");
    }

    const updatedPricing = { ...this.data.pricing };

    if (isFree !== undefined) {
      updatedPricing.isFree = isFree;
      if (isFree) {
        updatedPricing.price = undefined;
      }
    }

    if (!updatedPricing.isFree && price !== undefined) {
      if (price <= 0) {
        throw new Error("Price must be greater than 0 for paid events");
      }
      updatedPricing.price = price;
    }

    if (currency && currency.trim()) {
      updatedPricing.currency = currency.trim();
    }

    const updatedData = {
      ...this.data,
      pricing: updatedPricing,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new Event(updatedData);
  }

  public updateRequirements(
    minimumAttendancePercentage?: number,
    requiresMotivationLetter?: boolean,
    requiresDocumentVerification?: boolean,
    requiresApproval?: boolean,
    requiredDocuments?: string[],
    prerequisites?: string[],
    updatedBy?: string
  ): Event {
    const updatedRequirements = { ...this.data.requirements };

    if (minimumAttendancePercentage !== undefined) {
      if (minimumAttendancePercentage < 0 || minimumAttendancePercentage > 100) {
        throw new Error("Minimum attendance percentage must be between 0 and 100");
      }
      updatedRequirements.minimumAttendancePercentage = minimumAttendancePercentage;
    }

    if (requiresMotivationLetter !== undefined) {
      updatedRequirements.requiresMotivationLetter = requiresMotivationLetter;
    }

    if (requiresDocumentVerification !== undefined) {
      updatedRequirements.requiresDocumentVerification = requiresDocumentVerification;
    }

    if (requiresApproval !== undefined) {
      updatedRequirements.requiresApproval = requiresApproval;
    }

    if (requiredDocuments) {
      updatedRequirements.requiredDocuments = [...requiredDocuments];
    }

    if (prerequisites) {
      updatedRequirements.prerequisites = [...prerequisites];
    }

    const updatedData = {
      ...this.data,
      requirements: updatedRequirements,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new Event(updatedData);
  }

  public addInstructor(
    id: string,
    name: string,
    email: string,
    role: string,
    biography?: string,
    updatedBy?: string
  ): Event {
    if (this.data.instructors.some(instructor => instructor.id === id)) {
      throw new Error("Instructor already exists for this event");
    }

    const newInstructor = {
      id: id.trim(),
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      biography: biography?.trim()
    };

    const updatedData = {
      ...this.data,
      instructors: [...this.data.instructors, newInstructor],
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new Event(updatedData);
  }

  public removeInstructor(instructorId: string, updatedBy?: string): Event {
    const updatedInstructors = this.data.instructors.filter(
      instructor => instructor.id !== instructorId
    );

    if (updatedInstructors.length === this.data.instructors.length) {
      throw new Error("Instructor not found");
    }

    const updatedData = {
      ...this.data,
      instructors: updatedInstructors,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new Event(updatedData);
  }

  public associateWithCareers(
    careers: Array<{id: string; name: string; code: string}>,
    updatedBy?: string
  ): Event {
    if (this.data.audience !== 'CARRERA_ESPECIFICA') {
      throw new Error("Can only associate careers with career-specific events");
    }

    const updatedData = {
      ...this.data,
      associatedCareers: [...careers],
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new Event(updatedData);
  }

  public addTag(tag: string, updatedBy?: string): Event {
    if (!tag?.trim()) {
      throw new Error("Tag cannot be empty");
    }

    const trimmedTag = tag.trim().toLowerCase();
    if (this.data.tags.includes(trimmedTag)) {
      throw new Error("Tag already exists");
    }

    const updatedData = {
      ...this.data,
      tags: [...this.data.tags, trimmedTag],
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new Event(updatedData);
  }

  public removeTag(tag: string, updatedBy?: string): Event {
    const updatedTags = this.data.tags.filter(t => t !== tag.toLowerCase());

    const updatedData = {
      ...this.data,
      tags: updatedTags,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new Event(updatedData);
  }

  public incrementEnrollment(): Event {
    const updatedRegistration = {
      ...this.data.registration,
      currentEnrollments: this.data.registration.currentEnrollments + 1
    };

    const updatedData = {
      ...this.data,
      registration: updatedRegistration,
      updatedAt: new Date()
    };

    return new Event(updatedData);
  }

  public decrementEnrollment(): Event {
    if (this.data.registration.currentEnrollments <= 0) {
      throw new Error("Cannot decrement enrollments below 0");
    }

    const updatedRegistration = {
      ...this.data.registration,
      currentEnrollments: this.data.registration.currentEnrollments - 1
    };

    const updatedData = {
      ...this.data,
      registration: updatedRegistration,
      updatedAt: new Date()
    };

    return new Event(updatedData);
  }

  public updateStatus(
    status: EventStatus,
    updatedBy?: string
  ): Event {
    const updatedData = {
      ...this.data,
      status,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new Event(updatedData);
  }

  public cancel(reason?: string, updatedBy?: string): Event {
    if (!this.canCancel()) {
      throw new Error("Cannot cancel event in current status");
    }

    const updatedData = {
      ...this.data,
      status: 'CANCELADO' as EventStatus,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new Event(updatedData);
  }

  public publish(updatedBy?: string): Event {
    const now = new Date();
    
    const updatedData = {
      ...this.data,
      isPublished: true,
      publishDate: now,
      updatedAt: now,
      lastModifiedBy: updatedBy
    };

    return new Event(updatedData);
  }

  public unpublish(updatedBy?: string): Event {
    const updatedData = {
      ...this.data,
      isPublished: false,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    return new Event(updatedData);
  }

  public incrementViewCount(): Event {
    const updatedData = {
      ...this.data,
      viewCount: this.data.viewCount + 1,
      updatedAt: new Date()
    };

    return new Event(updatedData);
  }

  public incrementShareCount(): Event {
    const updatedData = {
      ...this.data,
      shareCount: this.data.shareCount + 1,
      updatedAt: new Date()
    };

    return new Event(updatedData);
  }

  public updateCompletionRate(completionRate: number): Event {
    if (completionRate < 0 || completionRate > 100) {
      throw new Error("Completion rate must be between 0 and 100");
    }

    const updatedData = {
      ...this.data,
      completionRate,
      updatedAt: new Date()
    };

    return new Event(updatedData);
  }

  // Analytics and reporting
  public getAvailableSpots(): number {
    return Math.max(0, this.data.registration.maxCapacity - this.data.registration.currentEnrollments);
  }

  public getOccupancyRate(): number {
    if (this.data.registration.maxCapacity === 0) return 0;
    return (this.data.registration.currentEnrollments / this.data.registration.maxCapacity) * 100;
  }

  public getDaysUntilStart(): number {
    const today = new Date();
    const diffTime = this.data.schedule.startDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public getDurationInDays(): number {
    if (!this.data.schedule.endDate) return 1;
    
    const diffTime = this.data.schedule.endDate.getTime() - this.data.schedule.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  public getEventSummary() {
    return {
      id: this.data.id,
      name: this.data.name,
      description: this.data.description,
      categoryName: this.data.categoryName,
      startDate: this.data.schedule.startDate,
      endDate: this.data.schedule.endDate,
      duration: this.data.schedule.duration,
      venue: this.data.location.venue,
      capacity: this.data.location.capacity,
      currentEnrollments: this.data.registration.currentEnrollments,
      availableSpots: this.getAvailableSpots(),
      occupancyRate: this.getOccupancyRate(),
      area: this.data.area,
      audience: this.data.audience,
      isFree: this.data.pricing.isFree,
      price: this.data.pricing.price,
      status: this.data.status,
      isRegistrationOpen: this.isRegistrationOpen(),
      daysUntilStart: this.getDaysUntilStart(),
      isPublished: this.data.isPublished,
      viewCount: this.data.viewCount,
      organizerName: this.data.organizerName
    };
  }

  public getDetailedReport() {
    return {
      ...this.getEventSummary(),
      organizerId: this.data.organizerId,
      organizerEmail: this.data.organizerEmail,
      instructors: this.data.instructors,
      associatedCareers: this.data.associatedCareers,
      requirements: this.data.requirements,
      registration: this.data.registration,
      materials: this.data.materials,
      feedback: this.data.feedback,
      tags: this.data.tags,
      createdAt: this.data.createdAt,
      updatedAt: this.data.updatedAt,
      createdBy: this.data.createdBy,
      lastModifiedBy: this.data.lastModifiedBy,
      completionRate: this.data.completionRate,
      shareCount: this.data.shareCount,
      publishDate: this.data.publishDate,
      featuredUntil: this.data.featuredUntil
    };
  }
}