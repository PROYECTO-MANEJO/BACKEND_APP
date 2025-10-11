/**
 * Event Administration Entity - Domain Layer
 *
 * Representa la administración de eventos con estadísticas e inscripciones
 */

export interface EventStatistics {
  totalInscriptions: number;
  approvedInscriptions: number;
  pendingInscriptions: number;
  rejectedInscriptions: number;
  availableSlots: number;
  capacityUtilization: number; // porcentaje de utilización
}

export interface InscriptionSummary {
  id: string;
  participantName: string;
  participantEmail: string;
  participantCedula: string;
  inscriptionDate: Date;
  paymentStatus: "APPROVED" | "PENDING" | "REJECTED";
  paymentAmount: number;
  paymentProof?: string;
  participationRegistered: boolean;
}

export interface EventAdministrationData {
  id: string;

  // Event basic info
  eventId: string;
  eventName: string;
  eventDescription: string;

  // Event dates
  startDate: Date;
  endDate: Date;
  inscriptionStartDate: Date;
  inscriptionEndDate: Date;

  // Capacity management
  maxCapacity: number;
  minCapacity: number;

  // Category and organization
  categoryId: string;
  categoryName: string;
  organizerId: string;
  organizerName: string;

  // Administrative status
  isActive: boolean;
  isAdministrable: boolean;
  canRegisterParticipation: boolean;

  // Statistics
  statistics: EventStatistics;

  // Inscriptions management
  inscriptions: InscriptionSummary[];

  // Financial info
  eventCost: number;
  totalRevenue: number;
  pendingRevenue: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export class EventAdministration {
  constructor(private data: EventAdministrationData) {
    this.validateData();
  }

  public static create(
    eventId: string,
    eventName: string,
    startDate: Date,
    endDate: Date,
    maxCapacity: number,
    categoryId: string,
    categoryName: string,
    organizerId: string,
    organizerName: string,
    eventCost: number = 0,
    eventDescription?: string
  ): EventAdministration {
    const now = new Date();

    const adminData: EventAdministrationData = {
      id: `event-admin-${eventId}`,
      eventId,
      eventName: eventName.trim(),
      eventDescription: eventDescription?.trim() || "",
      startDate,
      endDate,
      inscriptionStartDate: now,
      inscriptionEndDate: startDate,
      maxCapacity,
      minCapacity: 0,
      categoryId,
      categoryName: categoryName.trim(),
      organizerId,
      organizerName: organizerName.trim(),
      isActive: true,
      isAdministrable: endDate >= now,
      canRegisterParticipation: false,
      statistics: {
        totalInscriptions: 0,
        approvedInscriptions: 0,
        pendingInscriptions: 0,
        rejectedInscriptions: 0,
        availableSlots: maxCapacity,
        capacityUtilization: 0,
      },
      inscriptions: [],
      eventCost,
      totalRevenue: 0,
      pendingRevenue: 0,
      createdAt: now,
      updatedAt: now,
    };

    return new EventAdministration(adminData);
  }

  public static fromPrismaData(eventData: any): EventAdministration {
    const inscriptions: InscriptionSummary[] =
      eventData.inscripciones?.map((ins: any) => ({
        id: ins.id_ins.toString(),
        participantName: `${ins.usuario.nombres} ${ins.usuario.apellidos}`,
        participantEmail: ins.usuario.correo,
        participantCedula: ins.usuario.cedula,
        inscriptionDate: new Date(ins.fec_ins),
        paymentStatus: this.mapPaymentStatus(ins.estado_pago),
        paymentAmount: parseFloat(ins.monto_pago) || 0,
        paymentProof: ins.comprobante_pago,
        participationRegistered: ins.participacion?.length > 0,
      })) || [];

    const statistics = this.calculateStatistics(
      inscriptions,
      eventData.capacidad_max_eve
    );

    const adminData: EventAdministrationData = {
      id: `event-admin-${eventData.id_eve}`,
      eventId: eventData.id_eve.toString(),
      eventName: eventData.nom_eve,
      eventDescription: eventData.des_eve || "",
      startDate: new Date(eventData.fec_ini_eve),
      endDate: new Date(eventData.fec_fin_eve),
      inscriptionStartDate: new Date(eventData.fec_ini_ins_eve),
      inscriptionEndDate: new Date(eventData.fec_fin_ins_eve),
      maxCapacity: eventData.capacidad_max_eve,
      minCapacity: eventData.capacidad_min_eve || 0,
      categoryId: eventData.id_cat_eve.toString(),
      categoryName: eventData.categoria?.nom_cat || "",
      organizerId: eventData.id_org_eve.toString(),
      organizerName: this.formatOrganizerName(eventData.organizador),
      isActive: true,
      isAdministrable: new Date(eventData.fec_fin_eve) >= new Date(),
      canRegisterParticipation: new Date() >= new Date(eventData.fec_ini_eve),
      statistics,
      inscriptions,
      eventCost: parseFloat(eventData.cos_eve) || 0,
      totalRevenue:
        statistics.approvedInscriptions * (parseFloat(eventData.cos_eve) || 0),
      pendingRevenue:
        statistics.pendingInscriptions * (parseFloat(eventData.cos_eve) || 0),
      createdAt: new Date(eventData.fec_cre_eve),
      updatedAt: new Date(),
    };

    return new EventAdministration(adminData);
  }

  private static mapPaymentStatus(
    status: string
  ): "APPROVED" | "PENDING" | "REJECTED" {
    switch (status?.toLowerCase()) {
      case "aprobada":
      case "approved":
        return "APPROVED";
      case "rechazada":
      case "rejected":
        return "REJECTED";
      default:
        return "PENDING";
    }
  }

  private static formatOrganizerName(organizer: any): string {
    if (!organizer) return "Unknown Organizer";

    const parts = [
      organizer.nom_org1,
      organizer.nom_org2,
      organizer.ape_org1,
      organizer.ape_org2,
    ].filter(Boolean);

    return parts.join(" ").trim() || "Unknown Organizer";
  }

  private static calculateStatistics(
    inscriptions: InscriptionSummary[],
    maxCapacity: number
  ): EventStatistics {
    const totalInscriptions = inscriptions.length;
    const approvedInscriptions = inscriptions.filter(
      (ins) => ins.paymentStatus === "APPROVED"
    ).length;
    const pendingInscriptions = inscriptions.filter(
      (ins) => ins.paymentStatus === "PENDING"
    ).length;
    const rejectedInscriptions = inscriptions.filter(
      (ins) => ins.paymentStatus === "REJECTED"
    ).length;
    const availableSlots = Math.max(0, maxCapacity - totalInscriptions);
    const capacityUtilization =
      maxCapacity > 0 ? (totalInscriptions / maxCapacity) * 100 : 0;

    return {
      totalInscriptions,
      approvedInscriptions,
      pendingInscriptions,
      rejectedInscriptions,
      availableSlots,
      capacityUtilization,
    };
  }

  private validateData(): void {
    if (!this.data.eventId || this.data.eventId.trim().length === 0) {
      throw new Error("Event ID is required");
    }

    if (!this.data.eventName || this.data.eventName.trim().length === 0) {
      throw new Error("Event name is required");
    }

    if (this.data.maxCapacity <= 0) {
      throw new Error("Max capacity must be greater than 0");
    }

    if (this.data.endDate <= this.data.startDate) {
      throw new Error("End date must be after start date");
    }

    if (this.data.eventCost < 0) {
      throw new Error("Event cost cannot be negative");
    }
  }

  // Getters
  public getId(): string {
    return this.data.id;
  }

  public getEventId(): string {
    return this.data.eventId;
  }

  public getEventName(): string {
    return this.data.eventName;
  }

  public getEventDescription(): string {
    return this.data.eventDescription;
  }

  public getStartDate(): Date {
    return this.data.startDate;
  }

  public getEndDate(): Date {
    return this.data.endDate;
  }

  public getMaxCapacity(): number {
    return this.data.maxCapacity;
  }

  public getCategoryName(): string {
    return this.data.categoryName;
  }

  public getOrganizerName(): string {
    return this.data.organizerName;
  }

  public getStatistics(): EventStatistics {
    return { ...this.data.statistics };
  }

  public getInscriptions(): InscriptionSummary[] {
    return [...this.data.inscriptions];
  }

  public getEventCost(): number {
    return this.data.eventCost;
  }

  public getTotalRevenue(): number {
    return this.data.totalRevenue;
  }

  public getPendingRevenue(): number {
    return this.data.pendingRevenue;
  }

  // Business Methods
  public isActive(): boolean {
    return this.data.isActive;
  }

  public isAdministrable(): boolean {
    return this.data.isAdministrable;
  }

  public canRegisterParticipation(): boolean {
    return (
      this.data.canRegisterParticipation && new Date() >= this.data.startDate
    );
  }

  public hasAvailableSlots(): boolean {
    return this.data.statistics.availableSlots > 0;
  }

  public isFullyBooked(): boolean {
    return this.data.statistics.availableSlots === 0;
  }

  public getCapacityUtilization(): number {
    return this.data.statistics.capacityUtilization;
  }

  public hasInscriptions(): boolean {
    return this.data.statistics.totalInscriptions > 0;
  }

  public hasPendingInscriptions(): boolean {
    return this.data.statistics.pendingInscriptions > 0;
  }

  public getInscriptionById(
    inscriptionId: string
  ): InscriptionSummary | undefined {
    return this.data.inscriptions.find((ins) => ins.id === inscriptionId);
  }

  public getInscriptionsByStatus(
    status: "APPROVED" | "PENDING" | "REJECTED"
  ): InscriptionSummary[] {
    return this.data.inscriptions.filter((ins) => ins.paymentStatus === status);
  }

  // Actions
  public approveInscription(inscriptionId: string): EventAdministration {
    const inscription = this.getInscriptionById(inscriptionId);
    if (!inscription) {
      throw new Error(`Inscription ${inscriptionId} not found`);
    }

    if (inscription.paymentStatus === "APPROVED") {
      throw new Error("Inscription is already approved");
    }

    const updatedInscriptions = this.data.inscriptions.map((ins) =>
      ins.id === inscriptionId
        ? { ...ins, paymentStatus: "APPROVED" as const }
        : ins
    );

    const updatedStatistics = EventAdministration.calculateStatistics(
      updatedInscriptions,
      this.data.maxCapacity
    );

    const updatedData = {
      ...this.data,
      inscriptions: updatedInscriptions,
      statistics: updatedStatistics,
      totalRevenue:
        updatedStatistics.approvedInscriptions * this.data.eventCost,
      pendingRevenue:
        updatedStatistics.pendingInscriptions * this.data.eventCost,
      updatedAt: new Date(),
    };

    return new EventAdministration(updatedData);
  }

  public rejectInscription(inscriptionId: string): EventAdministration {
    const inscription = this.getInscriptionById(inscriptionId);
    if (!inscription) {
      throw new Error(`Inscription ${inscriptionId} not found`);
    }

    if (inscription.paymentStatus === "REJECTED") {
      throw new Error("Inscription is already rejected");
    }

    const updatedInscriptions = this.data.inscriptions.map((ins) =>
      ins.id === inscriptionId
        ? { ...ins, paymentStatus: "REJECTED" as const }
        : ins
    );

    const updatedStatistics = EventAdministration.calculateStatistics(
      updatedInscriptions,
      this.data.maxCapacity
    );

    const updatedData = {
      ...this.data,
      inscriptions: updatedInscriptions,
      statistics: updatedStatistics,
      totalRevenue:
        updatedStatistics.approvedInscriptions * this.data.eventCost,
      pendingRevenue:
        updatedStatistics.pendingInscriptions * this.data.eventCost,
      updatedAt: new Date(),
    };

    return new EventAdministration(updatedData);
  }

  public markParticipationRegistered(
    inscriptionId: string
  ): EventAdministration {
    const inscription = this.getInscriptionById(inscriptionId);
    if (!inscription) {
      throw new Error(`Inscription ${inscriptionId} not found`);
    }

    if (inscription.paymentStatus !== "APPROVED") {
      throw new Error(
        "Cannot register participation for non-approved inscription"
      );
    }

    const updatedInscriptions = this.data.inscriptions.map((ins) =>
      ins.id === inscriptionId ? { ...ins, participationRegistered: true } : ins
    );

    const updatedData = {
      ...this.data,
      inscriptions: updatedInscriptions,
      updatedAt: new Date(),
    };

    return new EventAdministration(updatedData);
  }

  public updateCapacity(newMaxCapacity: number): EventAdministration {
    if (newMaxCapacity <= 0) {
      throw new Error("Max capacity must be greater than 0");
    }

    if (newMaxCapacity < this.data.statistics.totalInscriptions) {
      throw new Error("New capacity cannot be less than current inscriptions");
    }

    const updatedStatistics = EventAdministration.calculateStatistics(
      this.data.inscriptions,
      newMaxCapacity
    );

    const updatedData = {
      ...this.data,
      maxCapacity: newMaxCapacity,
      statistics: updatedStatistics,
      updatedAt: new Date(),
    };

    return new EventAdministration(updatedData);
  }

  public deactivate(): EventAdministration {
    const updatedData = {
      ...this.data,
      isActive: false,
      isAdministrable: false,
      updatedAt: new Date(),
    };

    return new EventAdministration(updatedData);
  }

  // Reporting Methods
  public getFinancialSummary(): {
    totalRevenue: number;
    pendingRevenue: number;
    potentialRevenue: number;
    revenuePercentage: number;
  } {
    const potentialRevenue = this.data.maxCapacity * this.data.eventCost;
    const revenuePercentage =
      potentialRevenue > 0
        ? (this.data.totalRevenue / potentialRevenue) * 100
        : 0;

    return {
      totalRevenue: this.data.totalRevenue,
      pendingRevenue: this.data.pendingRevenue,
      potentialRevenue,
      revenuePercentage,
    };
  }

  public getParticipationSummary(): {
    totalParticipants: number;
    registeredParticipants: number;
    pendingParticipants: number;
    participationRate: number;
  } {
    const approvedInscriptions = this.getInscriptionsByStatus("APPROVED");
    const registeredParticipants = approvedInscriptions.filter(
      (ins) => ins.participationRegistered
    ).length;
    const pendingParticipants = approvedInscriptions.filter(
      (ins) => !ins.participationRegistered
    ).length;
    const participationRate =
      approvedInscriptions.length > 0
        ? (registeredParticipants / approvedInscriptions.length) * 100
        : 0;

    return {
      totalParticipants: approvedInscriptions.length,
      registeredParticipants,
      pendingParticipants,
      participationRate,
    };
  }

  // Serialization
  public toPlainObject(): EventAdministrationData {
    return { ...this.data };
  }

  public toJSON(): EventAdministrationData {
    return this.toPlainObject();
  }
}
