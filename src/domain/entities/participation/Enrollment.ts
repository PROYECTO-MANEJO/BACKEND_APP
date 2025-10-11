/**
 * Enrollment Entity - Domain Layer
 *
 * Representa la inscripción de un usuario a eventos o cursos
 */

export type EnrollmentType = 'EVENT' | 'COURSE';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
export type EnrollmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface PaymentDetails {
  amount: number;
  currency: string;
  paymentMethod?: string;
  transactionId?: string;
  paymentDate?: Date;
  paymentNotes?: string;
  processedBy?: string;
}

export interface EnrollmentData {
  id: string;
  
  // Activity Information
  activityId: string;
  activityName: string;
  activityType: EnrollmentType;
  
  // Participant Information
  participantId: string;
  participantName: string;
  participantEmail: string;
  participantCedula: string;
  participantPhone?: string;
  
  // Enrollment Details
  enrollmentDate: Date;
  confirmationDate?: Date;
  cancellationDate?: Date;
  cancellationReason?: string;
  
  // Status Information
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
  paymentDetails: PaymentDetails;
  
  // Activity Information
  startDate?: Date;
  endDate?: Date;
  location?: string;
  instructor?: string;
  
  // Capacity and availability
  hasWaitingList: boolean;
  waitingListPosition?: number;
  priorityScore: number; // For waiting list ordering
  
  // Requirements
  requiresApproval: boolean;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvalDate?: Date;
  approvalNotes?: string;
  
  // Documents and requirements
  requiredDocuments: string[];
  submittedDocuments: string[];
  documentationComplete: boolean;
  
  // Notifications
  confirmationSent: boolean;
  remindersSent: number;
  notificationsEnabled: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastModifiedBy?: string;
  source?: string; // 'WEB' | 'ADMIN' | 'IMPORT' | 'API'
}

export class Enrollment {
  constructor(private data: EnrollmentData) {
    this.validateData();
  }

  public static create(
    activityId: string,
    activityName: string,
    activityType: EnrollmentType,
    participantId: string,
    participantName: string,
    participantEmail: string,
    participantCedula: string,
    paymentAmount: number,
    paymentCurrency: string = 'CRC',
    participantPhone?: string,
    startDate?: Date,
    endDate?: Date,
    location?: string,
    instructor?: string,
    requiresApproval: boolean = false,
    requiredDocuments: string[] = [],
    source: string = 'WEB',
    createdBy?: string
  ): Enrollment {
    const now = new Date();
    
    const enrollmentData: EnrollmentData = {
      id: `enrollment-${activityType.toLowerCase()}-${Date.now()}`,
      activityId,
      activityName: activityName.trim(),
      activityType,
      participantId,
      participantName: participantName.trim(),
      participantEmail: participantEmail.trim().toLowerCase(),
      participantCedula: participantCedula.trim(),
      participantPhone: participantPhone?.trim(),
      enrollmentDate: now,
      status: requiresApproval ? 'PENDING' : 'CONFIRMED',
      paymentStatus: 'PENDING',
      paymentDetails: {
        amount: paymentAmount,
        currency: paymentCurrency
      },
      startDate,
      endDate,
      location: location?.trim(),
      instructor: instructor?.trim(),
      hasWaitingList: false,
      priorityScore: 0,
      requiresApproval,
      approvalStatus: requiresApproval ? 'PENDING' : 'APPROVED',
      requiredDocuments,
      submittedDocuments: [],
      documentationComplete: requiredDocuments.length === 0,
      confirmationSent: false,
      remindersSent: 0,
      notificationsEnabled: true,
      createdAt: now,
      updatedAt: now,
      createdBy,
      source
    };

    return new Enrollment(enrollmentData);
  }

  public static fromPrismaData(enrollmentData: any, activityType: EnrollmentType): Enrollment {
    // Map from database structure based on activity type
    if (activityType === 'EVENT') {
      return Enrollment.fromEventInscription(enrollmentData);
    } else {
      return Enrollment.fromCourseInscription(enrollmentData);
    }
  }

  private static fromEventInscription(inscription: any): Enrollment {
    const evento = inscription.evento;
    const usuario = inscription.usuario;
    
    const enrollmentData: EnrollmentData = {
      id: inscription.id_ins.toString(),
      activityId: evento.id_eve.toString(),
      activityName: evento.nom_eve,
      activityType: 'EVENT',
      participantId: usuario.id_usu.toString(),
      participantName: `${usuario.nom_usu1} ${usuario.nom_usu2 || ''} ${usuario.ape_usu1} ${usuario.ape_usu2 || ''}`.trim(),
      participantEmail: usuario.email_usu || '',
      participantCedula: usuario.ced_usu,
      participantPhone: usuario.tel_usu,
      enrollmentDate: new Date(inscription.fec_ins),
      status: Enrollment.mapEnrollmentStatus(inscription.estado_pago),
      paymentStatus: inscription.estado_pago as PaymentStatus,
      paymentDetails: {
        amount: evento.precio_eve || 0,
        currency: 'CRC',
        paymentMethod: inscription.metodo_pago,
        transactionId: inscription.transaction_id,
        paymentDate: inscription.fecha_pago ? new Date(inscription.fecha_pago) : undefined,
        paymentNotes: inscription.notas_pago
      },
      startDate: evento.fec_ini_eve ? new Date(evento.fec_ini_eve) : undefined,
      endDate: evento.fec_fin_eve ? new Date(evento.fec_fin_eve) : undefined,
      location: evento.ubicacion_eve,
      instructor: evento.instructor || evento.organizador,
      hasWaitingList: false,
      priorityScore: 0,
      requiresApproval: evento.requiere_aprobacion || false,
      approvalStatus: inscription.aprobacion_estado as 'PENDING' | 'APPROVED' | 'REJECTED' || 'APPROVED',
      approvedBy: inscription.aprobado_por,
      approvalDate: inscription.fecha_aprobacion ? new Date(inscription.fecha_aprobacion) : undefined,
      requiredDocuments: [],
      submittedDocuments: [],
      documentationComplete: true,
      confirmationSent: inscription.confirmacion_enviada || false,
      remindersSent: inscription.recordatorios_enviados || 0,
      notificationsEnabled: true,
      createdAt: new Date(inscription.fec_ins),
      updatedAt: inscription.fecha_actualizacion ? new Date(inscription.fecha_actualizacion) : new Date(inscription.fec_ins),
      source: 'WEB'
    };

    return new Enrollment(enrollmentData);
  }

  private static fromCourseInscription(inscripcionCurso: any): Enrollment {
    const curso = inscripcionCurso.curso;
    const usuario = inscripcionCurso.usuario;
    
    const enrollmentData: EnrollmentData = {
      id: inscripcionCurso.id_ins_cur.toString(),
      activityId: curso.id_cur.toString(),
      activityName: curso.nom_cur,
      activityType: 'COURSE',
      participantId: usuario.id_usu.toString(),
      participantName: `${usuario.nom_usu1} ${usuario.nom_usu2 || ''} ${usuario.ape_usu1} ${usuario.ape_usu2 || ''}`.trim(),
      participantEmail: usuario.email_usu || '',
      participantCedula: usuario.ced_usu,
      participantPhone: usuario.tel_usu,
      enrollmentDate: new Date(inscripcionCurso.fec_ins_cur),
      status: Enrollment.mapEnrollmentStatus(inscripcionCurso.estado_pago_cur),
      paymentStatus: inscripcionCurso.estado_pago_cur as PaymentStatus,
      paymentDetails: {
        amount: curso.precio_cur || 0,
        currency: 'CRC',
        paymentMethod: inscripcionCurso.metodo_pago_cur,
        transactionId: inscripcionCurso.transaction_id_cur,
        paymentDate: inscripcionCurso.fecha_pago_cur ? new Date(inscripcionCurso.fecha_pago_cur) : undefined,
        paymentNotes: inscripcionCurso.notas_pago_cur
      },
      startDate: curso.fec_ini_cur ? new Date(curso.fec_ini_cur) : undefined,
      endDate: curso.fec_fin_cur ? new Date(curso.fec_fin_cur) : undefined,
      location: curso.ubicacion_cur,
      instructor: curso.instructor_cur,
      hasWaitingList: false,
      priorityScore: 0,
      requiresApproval: curso.requiere_aprobacion_cur || false,
      approvalStatus: inscripcionCurso.aprobacion_estado_cur as 'PENDING' | 'APPROVED' | 'REJECTED' || 'APPROVED',
      approvedBy: inscripcionCurso.aprobado_por_cur,
      approvalDate: inscripcionCurso.fecha_aprobacion_cur ? new Date(inscripcionCurso.fecha_aprobacion_cur) : undefined,
      requiredDocuments: [],
      submittedDocuments: [],
      documentationComplete: true,
      confirmationSent: inscripcionCurso.confirmacion_enviada_cur || false,
      remindersSent: inscripcionCurso.recordatorios_enviados_cur || 0,
      notificationsEnabled: true,
      createdAt: new Date(inscripcionCurso.fec_ins_cur),
      updatedAt: inscripcionCurso.fecha_actualizacion_cur ? new Date(inscripcionCurso.fecha_actualizacion_cur) : new Date(inscripcionCurso.fec_ins_cur),
      source: 'WEB'
    };

    return new Enrollment(enrollmentData);
  }

  private static mapEnrollmentStatus(paymentStatus: string): EnrollmentStatus {
    switch (paymentStatus) {
      case 'APPROVED':
        return 'CONFIRMED';
      case 'REJECTED':
      case 'REFUNDED':
        return 'CANCELLED';
      case 'PENDING':
      default:
        return 'PENDING';
    }
  }

  private validateData(): void {
    if (!this.data.activityId?.trim()) {
      throw new Error("Activity ID is required");
    }

    if (!this.data.activityName?.trim()) {
      throw new Error("Activity name is required");
    }

    if (!this.data.participantId?.trim()) {
      throw new Error("Participant ID is required");
    }

    if (!this.data.participantName?.trim()) {
      throw new Error("Participant name is required");
    }

    if (!this.data.participantEmail?.trim()) {
      throw new Error("Participant email is required");
    }

    if (!this.data.participantCedula?.trim()) {
      throw new Error("Participant cedula is required");
    }

    if (this.data.paymentDetails.amount < 0) {
      throw new Error("Payment amount cannot be negative");
    }

    if (this.data.priorityScore < 0) {
      throw new Error("Priority score cannot be negative");
    }

    if (this.data.remindersSent < 0) {
      throw new Error("Reminders sent cannot be negative");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.data.participantEmail)) {
      throw new Error("Invalid email format");
    }
  }

  // Getters
  public getId(): string {
    return this.data.id;
  }

  public getActivityId(): string {
    return this.data.activityId;
  }

  public getActivityName(): string {
    return this.data.activityName;
  }

  public getActivityType(): EnrollmentType {
    return this.data.activityType;
  }

  public getParticipantId(): string {
    return this.data.participantId;
  }

  public getParticipantName(): string {
    return this.data.participantName;
  }

  public getParticipantEmail(): string {
    return this.data.participantEmail;
  }

  public getParticipantCedula(): string {
    return this.data.participantCedula;
  }

  public getParticipantPhone(): string | undefined {
    return this.data.participantPhone;
  }

  public getEnrollmentDate(): Date {
    return this.data.enrollmentDate;
  }

  public getConfirmationDate(): Date | undefined {
    return this.data.confirmationDate;
  }

  public getStatus(): EnrollmentStatus {
    return this.data.status;
  }

  public getPaymentStatus(): PaymentStatus {
    return this.data.paymentStatus;
  }

  public getPaymentDetails(): PaymentDetails {
    return { ...this.data.paymentDetails };
  }

  public getStartDate(): Date | undefined {
    return this.data.startDate;
  }

  public getEndDate(): Date | undefined {
    return this.data.endDate;
  }

  public getLocation(): string | undefined {
    return this.data.location;
  }

  public getInstructor(): string | undefined {
    return this.data.instructor;
  }

  public getWaitingListPosition(): number | undefined {
    return this.data.waitingListPosition;
  }

  public getPriorityScore(): number {
    return this.data.priorityScore;
  }

  public getRequiredDocuments(): string[] {
    return [...this.data.requiredDocuments];
  }

  public getSubmittedDocuments(): string[] {
    return [...this.data.submittedDocuments];
  }

  public getCreatedAt(): Date {
    return this.data.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.data.updatedAt;
  }

  public getSource(): string | undefined {
    return this.data.source;
  }

  // Status checks
  public isPending(): boolean {
    return this.data.status === 'PENDING';
  }

  public isConfirmed(): boolean {
    return this.data.status === 'CONFIRMED';
  }

  public isCancelled(): boolean {
    return this.data.status === 'CANCELLED';
  }

  public isCompleted(): boolean {
    return this.data.status === 'COMPLETED';
  }

  public isPaymentPending(): boolean {
    return this.data.paymentStatus === 'PENDING';
  }

  public isPaymentApproved(): boolean {
    return this.data.paymentStatus === 'APPROVED';
  }

  public isPaymentRejected(): boolean {
    return this.data.paymentStatus === 'REJECTED';
  }

  public isPaymentRefunded(): boolean {
    return this.data.paymentStatus === 'REFUNDED';
  }

  public isOnWaitingList(): boolean {
    return this.data.hasWaitingList && this.data.waitingListPosition !== undefined;
  }

  public requiresApproval(): boolean {
    return this.data.requiresApproval;
  }

  public isApprovalPending(): boolean {
    return this.data.requiresApproval && this.data.approvalStatus === 'PENDING';
  }

  public isApproved(): boolean {
    return !this.data.requiresApproval || this.data.approvalStatus === 'APPROVED';
  }

  public isApprovalRejected(): boolean {
    return this.data.requiresApproval && this.data.approvalStatus === 'REJECTED';
  }

  public isDocumentationComplete(): boolean {
    return this.data.documentationComplete;
  }

  public isConfirmationSent(): boolean {
    return this.data.confirmationSent;
  }

  public canBeConfirmed(): boolean {
    return this.data.status === 'PENDING' && 
           this.isApproved() && 
           (this.data.paymentStatus === 'APPROVED' || this.data.paymentDetails.amount === 0) &&
           this.isDocumentationComplete();
  }

  public canBeCancelled(): boolean {
    return this.data.status !== 'CANCELLED' && this.data.status !== 'COMPLETED';
  }

  public canProcessPayment(): boolean {
    return this.data.paymentStatus === 'PENDING' && this.data.status !== 'CANCELLED';
  }

  // Actions
  public confirm(confirmedBy?: string): Enrollment {
    if (!this.canBeConfirmed()) {
      throw new Error("Cannot confirm enrollment: requirements not met");
    }

    const updatedData = {
      ...this.data,
      status: 'CONFIRMED' as EnrollmentStatus,
      confirmationDate: new Date(),
      updatedAt: new Date(),
      lastModifiedBy: confirmedBy
    };

    return new Enrollment(updatedData);
  }

  public cancel(reason?: string, cancelledBy?: string): Enrollment {
    if (!this.canBeCancelled()) {
      throw new Error("Cannot cancel enrollment: invalid status");
    }

    const updatedData = {
      ...this.data,
      status: 'CANCELLED' as EnrollmentStatus,
      cancellationDate: new Date(),
      cancellationReason: reason,
      updatedAt: new Date(),
      lastModifiedBy: cancelledBy
    };

    return new Enrollment(updatedData);
  }

  public updatePaymentStatus(
    paymentStatus: PaymentStatus,
    transactionId?: string,
    paymentMethod?: string,
    paymentNotes?: string,
    processedBy?: string
  ): Enrollment {
    if (!this.canProcessPayment() && paymentStatus !== 'REFUNDED') {
      throw new Error("Cannot update payment status");
    }

    const updatedPaymentDetails = {
      ...this.data.paymentDetails,
      paymentMethod: paymentMethod || this.data.paymentDetails.paymentMethod,
      transactionId: transactionId || this.data.paymentDetails.transactionId,
      paymentDate: paymentStatus === 'APPROVED' ? new Date() : this.data.paymentDetails.paymentDate,
      paymentNotes: paymentNotes || this.data.paymentDetails.paymentNotes,
      processedBy: processedBy || this.data.paymentDetails.processedBy
    };

    // Update enrollment status based on payment status
    let newStatus = this.data.status;
    if (paymentStatus === 'APPROVED' && this.data.status === 'PENDING' && this.isApproved() && this.isDocumentationComplete()) {
      newStatus = 'CONFIRMED';
    } else if (paymentStatus === 'REJECTED' || paymentStatus === 'REFUNDED') {
      newStatus = 'CANCELLED';
    }

    const updatedData = {
      ...this.data,
      status: newStatus,
      paymentStatus,
      paymentDetails: updatedPaymentDetails,
      confirmationDate: newStatus === 'CONFIRMED' ? new Date() : this.data.confirmationDate,
      updatedAt: new Date(),
      lastModifiedBy: processedBy
    };

    return new Enrollment(updatedData);
  }

  public updateApprovalStatus(
    approvalStatus: 'APPROVED' | 'REJECTED',
    approvedBy: string,
    approvalNotes?: string
  ): Enrollment {
    if (!this.data.requiresApproval) {
      throw new Error("This enrollment does not require approval");
    }

    if (this.data.approvalStatus !== 'PENDING') {
      throw new Error("Approval has already been processed");
    }

    // Update enrollment status based on approval
    let newStatus = this.data.status;
    if (approvalStatus === 'APPROVED' && this.data.status === 'PENDING' && this.isPaymentApproved() && this.isDocumentationComplete()) {
      newStatus = 'CONFIRMED';
    } else if (approvalStatus === 'REJECTED') {
      newStatus = 'CANCELLED';
    }

    const updatedData = {
      ...this.data,
      status: newStatus,
      approvalStatus,
      approvedBy,
      approvalDate: new Date(),
      approvalNotes,
      confirmationDate: newStatus === 'CONFIRMED' ? new Date() : this.data.confirmationDate,
      updatedAt: new Date(),
      lastModifiedBy: approvedBy
    };

    return new Enrollment(updatedData);
  }

  public addToWaitingList(position: number, priorityScore?: number): Enrollment {
    if (this.data.status !== 'PENDING') {
      throw new Error("Only pending enrollments can be added to waiting list");
    }

    const updatedData = {
      ...this.data,
      hasWaitingList: true,
      waitingListPosition: position,
      priorityScore: priorityScore || this.data.priorityScore,
      updatedAt: new Date()
    };

    return new Enrollment(updatedData);
  }

  public removeFromWaitingList(): Enrollment {
    if (!this.data.hasWaitingList) {
      throw new Error("Enrollment is not on waiting list");
    }

    const updatedData = {
      ...this.data,
      hasWaitingList: false,
      waitingListPosition: undefined,
      updatedAt: new Date()
    };

    return new Enrollment(updatedData);
  }

  public submitDocument(document: string, submittedBy?: string): Enrollment {
    if (this.data.submittedDocuments.includes(document)) {
      throw new Error("Document already submitted");
    }

    if (!this.data.requiredDocuments.includes(document)) {
      throw new Error("Document is not required");
    }

    const updatedSubmittedDocuments = [...this.data.submittedDocuments, document];
    const documentationComplete = this.data.requiredDocuments.every(doc => 
      updatedSubmittedDocuments.includes(doc)
    );

    // Update enrollment status if all requirements are now met
    let newStatus = this.data.status;
    if (documentationComplete && this.data.status === 'PENDING' && this.isApproved() && this.isPaymentApproved()) {
      newStatus = 'CONFIRMED';
    }

    const updatedData = {
      ...this.data,
      status: newStatus,
      submittedDocuments: updatedSubmittedDocuments,
      documentationComplete,
      confirmationDate: newStatus === 'CONFIRMED' ? new Date() : this.data.confirmationDate,
      updatedAt: new Date(),
      lastModifiedBy: submittedBy
    };

    return new Enrollment(updatedData);
  }

  public sendConfirmation(): Enrollment {
    if (!this.isConfirmed()) {
      throw new Error("Cannot send confirmation for unconfirmed enrollment");
    }

    const updatedData = {
      ...this.data,
      confirmationSent: true,
      updatedAt: new Date()
    };

    return new Enrollment(updatedData);
  }

  public sendReminder(): Enrollment {
    const updatedData = {
      ...this.data,
      remindersSent: this.data.remindersSent + 1,
      updatedAt: new Date()
    };

    return new Enrollment(updatedData);
  }

  public updatePriorityScore(priorityScore: number): Enrollment {
    if (priorityScore < 0) {
      throw new Error("Priority score cannot be negative");
    }

    const updatedData = {
      ...this.data,
      priorityScore,
      updatedAt: new Date()
    };

    return new Enrollment(updatedData);
  }

  public updateContactInfo(
    email?: string,
    phone?: string,
    updatedBy?: string
  ): Enrollment {
    const updates: Partial<EnrollmentData> = {
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }
      updates.participantEmail = email.trim().toLowerCase();
    }

    if (phone !== undefined) {
      updates.participantPhone = phone?.trim() || undefined;
    }

    const updatedData = {
      ...this.data,
      ...updates
    };

    return new Enrollment(updatedData);
  }

  // Statistics and analysis
  public getDaysUntilStart(): number | null {
    if (!this.data.startDate) return null;
    
    const today = new Date();
    const diffTime = this.data.startDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public getDaysEnrolled(): number {
    const today = new Date();
    const diffTime = today.getTime() - this.data.enrollmentDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  public getRequiredDocumentsStatus() {
    return {
      total: this.data.requiredDocuments.length,
      submitted: this.data.submittedDocuments.length,
      pending: this.data.requiredDocuments.filter(doc => !this.data.submittedDocuments.includes(doc)),
      complete: this.data.documentationComplete
    };
  }

  public getEnrollmentSummary() {
    return {
      id: this.data.id,
      participantName: this.data.participantName,
      participantEmail: this.data.participantEmail,
      participantCedula: this.data.participantCedula,
      activityName: this.data.activityName,
      activityType: this.data.activityType,
      status: this.data.status,
      paymentStatus: this.data.paymentStatus,
      paymentAmount: this.data.paymentDetails.amount,
      enrollmentDate: this.data.enrollmentDate,
      confirmationDate: this.data.confirmationDate,
      startDate: this.data.startDate,
      endDate: this.data.endDate,
      location: this.data.location,
      isOnWaitingList: this.isOnWaitingList(),
      waitingListPosition: this.data.waitingListPosition,
      daysUntilStart: this.getDaysUntilStart(),
      daysEnrolled: this.getDaysEnrolled()
    };
  }

  public getDetailedReport() {
    return {
      ...this.getEnrollmentSummary(),
      participantPhone: this.data.participantPhone,
      instructor: this.data.instructor,
      priorityScore: this.data.priorityScore,
      requiresApproval: this.data.requiresApproval,
      approvalStatus: this.data.approvalStatus,
      approvedBy: this.data.approvedBy,
      approvalDate: this.data.approvalDate,
      approvalNotes: this.data.approvalNotes,
      paymentDetails: this.data.paymentDetails,
      requiredDocuments: this.data.requiredDocuments,
      submittedDocuments: this.data.submittedDocuments,
      documentationComplete: this.data.documentationComplete,
      confirmationSent: this.data.confirmationSent,
      remindersSent: this.data.remindersSent,
      notificationsEnabled: this.data.notificationsEnabled,
      cancellationDate: this.data.cancellationDate,
      cancellationReason: this.data.cancellationReason,
      createdAt: this.data.createdAt,
      updatedAt: this.data.updatedAt,
      createdBy: this.data.createdBy,
      lastModifiedBy: this.data.lastModifiedBy,
      source: this.data.source
    };
  }
}