/**
 * Participation Registration Entity - Domain Layer
 *
 * Representa el registro de participación de usuarios en eventos y cursos
 */

export type ParticipationType = "EVENT" | "COURSE";
export type ParticipationStatus =
  | "REGISTERED"
  | "ATTENDED"
  | "COMPLETED"
  | "NO_SHOW"
  | "CANCELLED";

export interface ParticipationData {
  id: string;

  // Participant information
  participantId: string;
  participantName: string;
  participantEmail: string;
  participantCedula: string;

  // Activity information
  activityId: string;
  activityName: string;
  activityType: ParticipationType;

  // Participation details
  registrationDate: Date;
  attendanceDate?: Date;
  completionDate?: Date;

  // Status and progress
  status: ParticipationStatus;
  attendancePercentage: number; // for courses
  completionPercentage: number; // for courses

  // Certificate information
  certificateGenerated: boolean;
  certificateId?: string;
  certificateDate?: Date;

  // Administrative info
  registeredBy: string; // admin who registered the participation
  notes?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export class ParticipationRegistration {
  constructor(private data: ParticipationData) {
    this.validateData();
  }

  public static create(
    participantId: string,
    participantName: string,
    participantEmail: string,
    participantCedula: string,
    activityId: string,
    activityName: string,
    activityType: ParticipationType,
    registeredBy: string,
    notes?: string
  ): ParticipationRegistration {
    const now = new Date();

    const participationData: ParticipationData = {
      id: `participation-${activityType.toLowerCase()}-${activityId}-${participantId}`,
      participantId,
      participantName: participantName.trim(),
      participantEmail: participantEmail.trim().toLowerCase(),
      participantCedula: participantCedula.trim(),
      activityId,
      activityName: activityName.trim(),
      activityType,
      registrationDate: now,
      status: "REGISTERED",
      attendancePercentage: 0,
      completionPercentage: 0,
      certificateGenerated: false,
      registeredBy,
      notes: notes?.trim(),
      createdAt: now,
      updatedAt: now,
    };

    return new ParticipationRegistration(participationData);
  }

  public static fromPrismaData(
    participationData: any,
    activityType: ParticipationType
  ): ParticipationRegistration {
    // Map based on activity type (event participation vs course participation)
    const isEvent = activityType === "EVENT";

    const data: ParticipationData = {
      id: isEvent
        ? `participation-event-${participationData.id_eve_par}-${participationData.id_usu_par}`
        : `participation-course-${participationData.id_cur_par}-${participationData.id_usu_par}`,
      participantId: participationData.id_usu_par.toString(),
      participantName: participationData.usuario
        ? `${participationData.usuario.nombres} ${participationData.usuario.apellidos}`
        : "Unknown Participant",
      participantEmail: participationData.usuario?.correo || "",
      participantCedula: participationData.usuario?.cedula || "",
      activityId: isEvent
        ? participationData.id_eve_par.toString()
        : participationData.id_cur_par.toString(),
      activityName: isEvent
        ? participationData.evento?.nom_eve || "Unknown Event"
        : participationData.curso?.nom_cur || "Unknown Course",
      activityType,
      registrationDate: new Date(participationData.fec_reg_par),
      attendanceDate: participationData.fec_asi_par
        ? new Date(participationData.fec_asi_par)
        : undefined,
      completionDate: participationData.fec_com_par
        ? new Date(participationData.fec_com_par)
        : undefined,
      status: this.mapStatus(participationData.est_par),
      attendancePercentage: participationData.por_asi_par || 0,
      completionPercentage: participationData.por_com_par || 0,
      certificateGenerated: !!participationData.cer_gen_par,
      certificateId: participationData.id_cer_par?.toString(),
      certificateDate: participationData.fec_cer_par
        ? new Date(participationData.fec_cer_par)
        : undefined,
      registeredBy: participationData.reg_por_par || "system",
      notes: participationData.not_par,
      createdAt: new Date(participationData.fec_cre_par),
      updatedAt: new Date(
        participationData.fec_act_par || participationData.fec_cre_par
      ),
    };

    return new ParticipationRegistration(data);
  }

  private static mapStatus(status: string): ParticipationStatus {
    switch (status?.toLowerCase()) {
      case "asistio":
      case "attended":
        return "ATTENDED";
      case "completado":
      case "completed":
        return "COMPLETED";
      case "no_asistio":
      case "no_show":
        return "NO_SHOW";
      case "cancelado":
      case "cancelled":
        return "CANCELLED";
      default:
        return "REGISTERED";
    }
  }

  private validateData(): void {
    if (
      !this.data.participantId ||
      this.data.participantId.trim().length === 0
    ) {
      throw new Error("Participant ID is required");
    }

    if (
      !this.data.participantName ||
      this.data.participantName.trim().length === 0
    ) {
      throw new Error("Participant name is required");
    }

    if (!this.data.activityId || this.data.activityId.trim().length === 0) {
      throw new Error("Activity ID is required");
    }

    if (
      !this.data.participantEmail ||
      !this.isValidEmail(this.data.participantEmail)
    ) {
      throw new Error("Valid participant email is required");
    }

    if (
      this.data.attendancePercentage < 0 ||
      this.data.attendancePercentage > 100
    ) {
      throw new Error("Attendance percentage must be between 0 and 100");
    }

    if (
      this.data.completionPercentage < 0 ||
      this.data.completionPercentage > 100
    ) {
      throw new Error("Completion percentage must be between 0 and 100");
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Getters
  public getId(): string {
    return this.data.id;
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

  public getActivityId(): string {
    return this.data.activityId;
  }

  public getActivityName(): string {
    return this.data.activityName;
  }

  public getActivityType(): ParticipationType {
    return this.data.activityType;
  }

  public getRegistrationDate(): Date {
    return this.data.registrationDate;
  }

  public getAttendanceDate(): Date | undefined {
    return this.data.attendanceDate;
  }

  public getCompletionDate(): Date | undefined {
    return this.data.completionDate;
  }

  public getStatus(): ParticipationStatus {
    return this.data.status;
  }

  public getAttendancePercentage(): number {
    return this.data.attendancePercentage;
  }

  public getCompletionPercentage(): number {
    return this.data.completionPercentage;
  }

  public isCertificateGenerated(): boolean {
    return this.data.certificateGenerated;
  }

  public getCertificateId(): string | undefined {
    return this.data.certificateId;
  }

  public getCertificateDate(): Date | undefined {
    return this.data.certificateDate;
  }

  public getRegisteredBy(): string {
    return this.data.registeredBy;
  }

  public getNotes(): string | undefined {
    return this.data.notes;
  }

  public getCreatedAt(): Date {
    return this.data.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.data.updatedAt;
  }

  // Business Methods
  public isEvent(): boolean {
    return this.data.activityType === "EVENT";
  }

  public isCourse(): boolean {
    return this.data.activityType === "COURSE";
  }

  public isRegistered(): boolean {
    return this.data.status === "REGISTERED";
  }

  public hasAttended(): boolean {
    return ["ATTENDED", "COMPLETED"].includes(this.data.status);
  }

  public isCompleted(): boolean {
    return this.data.status === "COMPLETED";
  }

  public isCancelled(): boolean {
    return this.data.status === "CANCELLED";
  }

  public isNoShow(): boolean {
    return this.data.status === "NO_SHOW";
  }

  public canMarkAttendance(): boolean {
    return ["REGISTERED", "ATTENDED"].includes(this.data.status);
  }

  public canMarkCompletion(): boolean {
    return (
      this.data.status === "ATTENDED" ||
      (this.data.status === "COMPLETED" && this.isCourse())
    );
  }

  public canGenerateCertificate(): boolean {
    if (this.data.certificateGenerated) return false;

    if (this.isEvent()) {
      return this.data.status === "ATTENDED";
    }

    if (this.isCourse()) {
      return (
        this.data.status === "COMPLETED" && this.data.completionPercentage >= 80
      );
    }

    return false;
  }

  public getProgressStatus():
    | "NOT_STARTED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED" {
    switch (this.data.status) {
      case "COMPLETED":
        return "COMPLETED";
      case "CANCELLED":
      case "NO_SHOW":
        return "CANCELLED";
      case "ATTENDED":
        return this.isCourse() ? "IN_PROGRESS" : "COMPLETED";
      default:
        return "NOT_STARTED";
    }
  }

  // Actions
  public markAttendance(
    attendancePercentage: number = 100
  ): ParticipationRegistration {
    if (!this.canMarkAttendance()) {
      throw new Error("Cannot mark attendance for current status");
    }

    if (attendancePercentage < 0 || attendancePercentage > 100) {
      throw new Error("Attendance percentage must be between 0 and 100");
    }

    const updatedData = {
      ...this.data,
      status: "ATTENDED" as ParticipationStatus,
      attendanceDate: new Date(),
      attendancePercentage,
      updatedAt: new Date(),
    };

    return new ParticipationRegistration(updatedData);
  }

  public markCompletion(
    completionPercentage: number = 100
  ): ParticipationRegistration {
    if (!this.canMarkCompletion()) {
      throw new Error("Cannot mark completion for current status");
    }

    if (completionPercentage < 0 || completionPercentage > 100) {
      throw new Error("Completion percentage must be between 0 and 100");
    }

    const updatedData = {
      ...this.data,
      status: "COMPLETED" as ParticipationStatus,
      completionDate: new Date(),
      completionPercentage,
      updatedAt: new Date(),
    };

    return new ParticipationRegistration(updatedData);
  }

  public markNoShow(): ParticipationRegistration {
    if (this.data.status === "COMPLETED") {
      throw new Error("Cannot mark no-show for completed participation");
    }

    const updatedData = {
      ...this.data,
      status: "NO_SHOW" as ParticipationStatus,
      updatedAt: new Date(),
    };

    return new ParticipationRegistration(updatedData);
  }

  public cancel(reason?: string): ParticipationRegistration {
    if (this.data.status === "COMPLETED") {
      throw new Error("Cannot cancel completed participation");
    }

    const notes = reason
      ? `${this.data.notes || ""}\nCancelled: ${reason}`.trim()
      : this.data.notes;

    const updatedData = {
      ...this.data,
      status: "CANCELLED" as ParticipationStatus,
      notes,
      updatedAt: new Date(),
    };

    return new ParticipationRegistration(updatedData);
  }

  public generateCertificate(certificateId: string): ParticipationRegistration {
    if (!this.canGenerateCertificate()) {
      throw new Error(
        "Cannot generate certificate for current participation status"
      );
    }

    const updatedData = {
      ...this.data,
      certificateGenerated: true,
      certificateId,
      certificateDate: new Date(),
      updatedAt: new Date(),
    };

    return new ParticipationRegistration(updatedData);
  }

  public updateProgress(
    attendancePercentage?: number,
    completionPercentage?: number
  ): ParticipationRegistration {
    const updates: Partial<ParticipationData> = {
      updatedAt: new Date(),
    };

    if (attendancePercentage !== undefined) {
      if (attendancePercentage < 0 || attendancePercentage > 100) {
        throw new Error("Attendance percentage must be between 0 and 100");
      }
      updates.attendancePercentage = attendancePercentage;
    }

    if (completionPercentage !== undefined) {
      if (completionPercentage < 0 || completionPercentage > 100) {
        throw new Error("Completion percentage must be between 0 and 100");
      }
      updates.completionPercentage = completionPercentage;

      // Auto-update status based on completion
      if (completionPercentage >= 100 && this.isCourse()) {
        updates.status = "COMPLETED";
        updates.completionDate = new Date();
      }
    }

    const updatedData = { ...this.data, ...updates };
    return new ParticipationRegistration(updatedData);
  }

  public addNote(note: string): ParticipationRegistration {
    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] ${note}`;
    const updatedNotes = this.data.notes
      ? `${this.data.notes}\n${newNote}`
      : newNote;

    const updatedData = {
      ...this.data,
      notes: updatedNotes,
      updatedAt: new Date(),
    };

    return new ParticipationRegistration(updatedData);
  }

  // Analytics Methods
  public getDurationInActivity(): number {
    if (!this.data.attendanceDate) return 0;

    const endDate = this.data.completionDate || new Date();
    const startDate = this.data.attendanceDate;

    return Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ); // days
  }

  public getOverallProgress(): number {
    if (this.isEvent()) {
      return this.hasAttended() ? 100 : 0;
    }

    if (this.isCourse()) {
      return Math.max(
        this.data.attendancePercentage,
        this.data.completionPercentage
      );
    }

    return 0;
  }

  public isEligibleForCertificate(): boolean {
    if (this.data.certificateGenerated) return true;

    return this.canGenerateCertificate();
  }

  // Serialization
  public toPlainObject(): ParticipationData {
    return { ...this.data };
  }

  public toJSON(): ParticipationData {
    return this.toPlainObject();
  }

  // Summary for reporting
  public getSummary(): {
    participant: string;
    activity: string;
    type: ParticipationType;
    status: ParticipationStatus;
    progress: number;
    certificateReady: boolean;
  } {
    return {
      participant: this.data.participantName,
      activity: this.data.activityName,
      type: this.data.activityType,
      status: this.data.status,
      progress: this.getOverallProgress(),
      certificateReady: this.isEligibleForCertificate(),
    };
  }
}
