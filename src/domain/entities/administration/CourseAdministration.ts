/**
 * Course Administration Entity - Domain Layer
 *
 * Representa la administración de cursos con estadísticas e inscripciones
 */

export interface CourseStatistics {
  totalInscriptions: number;
  approvedInscriptions: number;
  pendingInscriptions: number;
  rejectedInscriptions: number;
  availableSlots: number;
  capacityUtilization: number; // porcentaje de utilización
}

export interface CourseInscriptionSummary {
  id: string;
  participantName: string;
  participantEmail: string;
  participantCedula: string;
  inscriptionDate: Date;
  paymentStatus: "APPROVED" | "PENDING" | "REJECTED";
  paymentAmount: number;
  paymentProof?: string;
  participationRegistered: boolean;
  completionStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "DROPPED";
  completionPercentage: number;
}

export interface CourseAdministrationData {
  id: string;
  
  // Course basic info
  courseId: string;
  courseName: string;
  courseDescription: string;
  
  // Course dates
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
  
  // Course specific
  duration: number; // in hours
  modalidad: "PRESENCIAL" | "VIRTUAL" | "HIBRIDA";
  
  // Statistics
  statistics: CourseStatistics;
  
  // Inscriptions management
  inscriptions: CourseInscriptionSummary[];
  
  // Financial info
  courseCost: number;
  totalRevenue: number;
  pendingRevenue: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export class CourseAdministration {
  constructor(private data: CourseAdministrationData) {
    this.validateData();
  }

  public static create(
    courseId: string,
    courseName: string,
    startDate: Date,
    endDate: Date,
    maxCapacity: number,
    categoryId: string,
    categoryName: string,
    organizerId: string,
    organizerName: string,
    duration: number,
    modalidad: "PRESENCIAL" | "VIRTUAL" | "HIBRIDA",
    courseCost: number = 0,
    courseDescription?: string
  ): CourseAdministration {
    const now = new Date();
    
    const adminData: CourseAdministrationData = {
      id: `course-admin-${courseId}`,
      courseId,
      courseName: courseName.trim(),
      courseDescription: courseDescription?.trim() || "",
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
      duration,
      modalidad,
      statistics: {
        totalInscriptions: 0,
        approvedInscriptions: 0,
        pendingInscriptions: 0,
        rejectedInscriptions: 0,
        availableSlots: maxCapacity,
        capacityUtilization: 0
      },
      inscriptions: [],
      courseCost,
      totalRevenue: 0,
      pendingRevenue: 0,
      createdAt: now,
      updatedAt: now
    };

    return new CourseAdministration(adminData);
  }

  public static fromPrismaData(courseData: any): CourseAdministration {
    const inscriptions: CourseInscriptionSummary[] = courseData.inscripcionesCurso?.map((ins: any) => ({
      id: ins.id_ins_cur.toString(),
      participantName: `${ins.usuario.nombres} ${ins.usuario.apellidos}`,
      participantEmail: ins.usuario.correo,
      participantCedula: ins.usuario.cedula,
      inscriptionDate: new Date(ins.fec_ins_cur),
      paymentStatus: this.mapPaymentStatus(ins.estado_pago),
      paymentAmount: parseFloat(ins.monto_pago) || 0,
      paymentProof: ins.comprobante_pago,
      participationRegistered: ins.participacion?.length > 0,
      completionStatus: this.mapCompletionStatus(ins.estado_completado),
      completionPercentage: ins.porcentaje_completado || 0
    })) || [];

    const statistics = this.calculateStatistics(inscriptions, courseData.capacidad_max_cur);

    const adminData: CourseAdministrationData = {
      id: `course-admin-${courseData.id_cur}`,
      courseId: courseData.id_cur.toString(),
      courseName: courseData.nom_cur,
      courseDescription: courseData.des_cur || "",
      startDate: new Date(courseData.fec_ini_cur),
      endDate: new Date(courseData.fec_fin_cur),
      inscriptionStartDate: new Date(courseData.fec_ini_ins_cur),
      inscriptionEndDate: new Date(courseData.fec_fin_ins_cur),
      maxCapacity: courseData.capacidad_max_cur,
      minCapacity: courseData.capacidad_min_cur || 0,
      categoryId: courseData.id_cat_cur.toString(),
      categoryName: courseData.categoria?.nom_cat || "",
      organizerId: courseData.id_org_cur.toString(),
      organizerName: this.formatOrganizerName(courseData.organizador),
      isActive: true,
      isAdministrable: new Date(courseData.fec_fin_cur) >= new Date(),
      canRegisterParticipation: new Date() >= new Date(courseData.fec_ini_cur),
      duration: courseData.duracion_cur || 0,
      modalidad: this.mapModalidad(courseData.modalidad_cur),
      statistics,
      inscriptions,
      courseCost: parseFloat(courseData.cos_cur) || 0,
      totalRevenue: statistics.approvedInscriptions * (parseFloat(courseData.cos_cur) || 0),
      pendingRevenue: statistics.pendingInscriptions * (parseFloat(courseData.cos_cur) || 0),
      createdAt: new Date(courseData.fec_cre_cur),
      updatedAt: new Date()
    };

    return new CourseAdministration(adminData);
  }

  private static mapPaymentStatus(status: string): "APPROVED" | "PENDING" | "REJECTED" {
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

  private static mapCompletionStatus(status?: string): "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "DROPPED" {
    switch (status?.toLowerCase()) {
      case "completado":
      case "completed":
        return "COMPLETED";
      case "en_progreso":
      case "in_progress":
        return "IN_PROGRESS";
      case "abandonado":
      case "dropped":
        return "DROPPED";
      default:
        return "NOT_STARTED";
    }
  }

  private static mapModalidad(modalidad?: string): "PRESENCIAL" | "VIRTUAL" | "HIBRIDA" {
    switch (modalidad?.toLowerCase()) {
      case "presencial":
        return "PRESENCIAL";
      case "virtual":
        return "VIRTUAL";
      case "hibrida":
      case "híbrida":
        return "HIBRIDA";
      default:
        return "PRESENCIAL";
    }
  }

  private static formatOrganizerName(organizer: any): string {
    if (!organizer) return "Unknown Organizer";
    
    const parts = [
      organizer.nom_org1,
      organizer.nom_org2,
      organizer.ape_org1,
      organizer.ape_org2
    ].filter(Boolean);
    
    return parts.join(" ").trim() || "Unknown Organizer";
  }

  private static calculateStatistics(inscriptions: CourseInscriptionSummary[], maxCapacity: number): CourseStatistics {
    const totalInscriptions = inscriptions.length;
    const approvedInscriptions = inscriptions.filter(ins => ins.paymentStatus === "APPROVED").length;
    const pendingInscriptions = inscriptions.filter(ins => ins.paymentStatus === "PENDING").length;
    const rejectedInscriptions = inscriptions.filter(ins => ins.paymentStatus === "REJECTED").length;
    const availableSlots = Math.max(0, maxCapacity - totalInscriptions);
    const capacityUtilization = maxCapacity > 0 ? (totalInscriptions / maxCapacity) * 100 : 0;

    return {
      totalInscriptions,
      approvedInscriptions,
      pendingInscriptions,
      rejectedInscriptions,
      availableSlots,
      capacityUtilization
    };
  }

  private validateData(): void {
    if (!this.data.courseId || this.data.courseId.trim().length === 0) {
      throw new Error("Course ID is required");
    }

    if (!this.data.courseName || this.data.courseName.trim().length === 0) {
      throw new Error("Course name is required");
    }

    if (this.data.maxCapacity <= 0) {
      throw new Error("Max capacity must be greater than 0");
    }

    if (this.data.endDate <= this.data.startDate) {
      throw new Error("End date must be after start date");
    }

    if (this.data.courseCost < 0) {
      throw new Error("Course cost cannot be negative");
    }

    if (this.data.duration <= 0) {
      throw new Error("Duration must be greater than 0");
    }
  }

  // Getters
  public getId(): string {
    return this.data.id;
  }

  public getCourseId(): string {
    return this.data.courseId;
  }

  public getCourseName(): string {
    return this.data.courseName;
  }

  public getCourseDescription(): string {
    return this.data.courseDescription;
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

  public getDuration(): number {
    return this.data.duration;
  }

  public getModalidad(): "PRESENCIAL" | "VIRTUAL" | "HIBRIDA" {
    return this.data.modalidad;
  }

  public getCategoryName(): string {
    return this.data.categoryName;
  }

  public getOrganizerName(): string {
    return this.data.organizerName;
  }

  public getStatistics(): CourseStatistics {
    return { ...this.data.statistics };
  }

  public getInscriptions(): CourseInscriptionSummary[] {
    return [...this.data.inscriptions];
  }

  public getCourseCost(): number {
    return this.data.courseCost;
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
    return this.data.canRegisterParticipation && new Date() >= this.data.startDate;
  }

  public hasAvailableSlots(): boolean {
    return this.data.statistics.availableSlots > 0;
  }

  public isFullyBooked(): boolean {
    return this.data.statistics.availableSlots === 0;
  }

  public isVirtual(): boolean {
    return this.data.modalidad === "VIRTUAL";
  }

  public isHybrid(): boolean {
    return this.data.modalidad === "HIBRIDA";
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

  public getInscriptionById(inscriptionId: string): CourseInscriptionSummary | undefined {
    return this.data.inscriptions.find(ins => ins.id === inscriptionId);
  }

  public getInscriptionsByStatus(status: "APPROVED" | "PENDING" | "REJECTED"): CourseInscriptionSummary[] {
    return this.data.inscriptions.filter(ins => ins.paymentStatus === status);
  }

  public getInscriptionsByCompletion(status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "DROPPED"): CourseInscriptionSummary[] {
    return this.data.inscriptions.filter(ins => ins.completionStatus === status);
  }

  // Actions
  public approveInscription(inscriptionId: string): CourseAdministration {
    const inscription = this.getInscriptionById(inscriptionId);
    if (!inscription) {
      throw new Error(`Inscription ${inscriptionId} not found`);
    }

    if (inscription.paymentStatus === "APPROVED") {
      throw new Error("Inscription is already approved");
    }

    const updatedInscriptions = this.data.inscriptions.map(ins =>
      ins.id === inscriptionId
        ? { ...ins, paymentStatus: "APPROVED" as const }
        : ins
    );

    const updatedStatistics = CourseAdministration.calculateStatistics(
      updatedInscriptions,
      this.data.maxCapacity
    );

    const updatedData = {
      ...this.data,
      inscriptions: updatedInscriptions,
      statistics: updatedStatistics,
      totalRevenue: updatedStatistics.approvedInscriptions * this.data.courseCost,
      pendingRevenue: updatedStatistics.pendingInscriptions * this.data.courseCost,
      updatedAt: new Date()
    };

    return new CourseAdministration(updatedData);
  }

  public rejectInscription(inscriptionId: string): CourseAdministration {
    const inscription = this.getInscriptionById(inscriptionId);
    if (!inscription) {
      throw new Error(`Inscription ${inscriptionId} not found`);
    }

    if (inscription.paymentStatus === "REJECTED") {
      throw new Error("Inscription is already rejected");
    }

    const updatedInscriptions = this.data.inscriptions.map(ins =>
      ins.id === inscriptionId
        ? { ...ins, paymentStatus: "REJECTED" as const }
        : ins
    );

    const updatedStatistics = CourseAdministration.calculateStatistics(
      updatedInscriptions,
      this.data.maxCapacity
    );

    const updatedData = {
      ...this.data,
      inscriptions: updatedInscriptions,
      statistics: updatedStatistics,
      totalRevenue: updatedStatistics.approvedInscriptions * this.data.courseCost,
      pendingRevenue: updatedStatistics.pendingInscriptions * this.data.courseCost,
      updatedAt: new Date()
    };

    return new CourseAdministration(updatedData);
  }

  public markParticipationRegistered(inscriptionId: string): CourseAdministration {
    const inscription = this.getInscriptionById(inscriptionId);
    if (!inscription) {
      throw new Error(`Inscription ${inscriptionId} not found`);
    }

    if (inscription.paymentStatus !== "APPROVED") {
      throw new Error("Cannot register participation for non-approved inscription");
    }

    const updatedInscriptions = this.data.inscriptions.map(ins =>
      ins.id === inscriptionId
        ? { ...ins, participationRegistered: true }
        : ins
    );

    const updatedData = {
      ...this.data,
      inscriptions: updatedInscriptions,
      updatedAt: new Date()
    };

    return new CourseAdministration(updatedData);
  }

  public updateCompletionStatus(
    inscriptionId: string, 
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "DROPPED",
    percentage: number = 0
  ): CourseAdministration {
    const inscription = this.getInscriptionById(inscriptionId);
    if (!inscription) {
      throw new Error(`Inscription ${inscriptionId} not found`);
    }

    if (inscription.paymentStatus !== "APPROVED") {
      throw new Error("Cannot update completion for non-approved inscription");
    }

    if (percentage < 0 || percentage > 100) {
      throw new Error("Completion percentage must be between 0 and 100");
    }

    const updatedInscriptions = this.data.inscriptions.map(ins =>
      ins.id === inscriptionId
        ? { 
            ...ins, 
            completionStatus: status,
            completionPercentage: percentage
          }
        : ins
    );

    const updatedData = {
      ...this.data,
      inscriptions: updatedInscriptions,
      updatedAt: new Date()
    };

    return new CourseAdministration(updatedData);
  }

  // Reporting Methods
  public getCompletionSummary(): {
    completedStudents: number;
    inProgressStudents: number;
    droppedStudents: number;
    notStartedStudents: number;
    completionRate: number;
    dropoutRate: number;
  } {
    const approvedInscriptions = this.getInscriptionsByStatus("APPROVED");
    const completed = this.getInscriptionsByCompletion("COMPLETED").length;
    const inProgress = this.getInscriptionsByCompletion("IN_PROGRESS").length;
    const dropped = this.getInscriptionsByCompletion("DROPPED").length;
    const notStarted = this.getInscriptionsByCompletion("NOT_STARTED").length;
    
    const totalActive = approvedInscriptions.length;
    const completionRate = totalActive > 0 ? (completed / totalActive) * 100 : 0;
    const dropoutRate = totalActive > 0 ? (dropped / totalActive) * 100 : 0;

    return {
      completedStudents: completed,
      inProgressStudents: inProgress,
      droppedStudents: dropped,
      notStartedStudents: notStarted,
      completionRate,
      dropoutRate
    };
  }

  public getFinancialSummary(): {
    totalRevenue: number;
    pendingRevenue: number;
    potentialRevenue: number;
    revenuePercentage: number;
  } {
    const potentialRevenue = this.data.maxCapacity * this.data.courseCost;
    const revenuePercentage = potentialRevenue > 0 
      ? (this.data.totalRevenue / potentialRevenue) * 100 
      : 0;

    return {
      totalRevenue: this.data.totalRevenue,
      pendingRevenue: this.data.pendingRevenue,
      potentialRevenue,
      revenuePercentage
    };
  }

  public getAverageCompletionPercentage(): number {
    const approvedInscriptions = this.getInscriptionsByStatus("APPROVED");
    if (approvedInscriptions.length === 0) return 0;
    
    const totalPercentage = approvedInscriptions.reduce(
      (sum, ins) => sum + ins.completionPercentage, 
      0
    );
    
    return totalPercentage / approvedInscriptions.length;
  }

  // Serialization
  public toPlainObject(): CourseAdministrationData {
    return { ...this.data };
  }

  public toJSON(): CourseAdministrationData {
    return this.toPlainObject();
  }
}