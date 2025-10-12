"use strict";
/**
 * Participation Registration Entity - Domain Layer
 *
 * Representa el registro de participación de usuarios en eventos y cursos
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipationRegistration = void 0;
class ParticipationRegistration {
    constructor(data) {
        this.data = data;
        this.validateData();
    }
    static create(participantId, participantName, participantEmail, participantCedula, activityId, activityName, activityType, registeredBy, notes) {
        const now = new Date();
        const participationData = {
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
    static fromPrismaData(participationData, activityType) {
        // Map based on activity type (event participation vs course participation)
        const isEvent = activityType === "EVENT";
        const data = {
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
            updatedAt: new Date(participationData.fec_act_par || participationData.fec_cre_par),
        };
        return new ParticipationRegistration(data);
    }
    static mapStatus(status) {
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
    validateData() {
        if (!this.data.participantId ||
            this.data.participantId.trim().length === 0) {
            throw new Error("Participant ID is required");
        }
        if (!this.data.participantName ||
            this.data.participantName.trim().length === 0) {
            throw new Error("Participant name is required");
        }
        if (!this.data.activityId || this.data.activityId.trim().length === 0) {
            throw new Error("Activity ID is required");
        }
        if (!this.data.participantEmail ||
            !this.isValidEmail(this.data.participantEmail)) {
            throw new Error("Valid participant email is required");
        }
        if (this.data.attendancePercentage < 0 ||
            this.data.attendancePercentage > 100) {
            throw new Error("Attendance percentage must be between 0 and 100");
        }
        if (this.data.completionPercentage < 0 ||
            this.data.completionPercentage > 100) {
            throw new Error("Completion percentage must be between 0 and 100");
        }
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    // Getters
    getId() {
        return this.data.id;
    }
    getParticipantId() {
        return this.data.participantId;
    }
    getParticipantName() {
        return this.data.participantName;
    }
    getParticipantEmail() {
        return this.data.participantEmail;
    }
    getParticipantCedula() {
        return this.data.participantCedula;
    }
    getActivityId() {
        return this.data.activityId;
    }
    getActivityName() {
        return this.data.activityName;
    }
    getActivityType() {
        return this.data.activityType;
    }
    getRegistrationDate() {
        return this.data.registrationDate;
    }
    getAttendanceDate() {
        return this.data.attendanceDate;
    }
    getCompletionDate() {
        return this.data.completionDate;
    }
    getStatus() {
        return this.data.status;
    }
    getAttendancePercentage() {
        return this.data.attendancePercentage;
    }
    getCompletionPercentage() {
        return this.data.completionPercentage;
    }
    isCertificateGenerated() {
        return this.data.certificateGenerated;
    }
    getCertificateId() {
        return this.data.certificateId;
    }
    getCertificateDate() {
        return this.data.certificateDate;
    }
    getRegisteredBy() {
        return this.data.registeredBy;
    }
    getNotes() {
        return this.data.notes;
    }
    getCreatedAt() {
        return this.data.createdAt;
    }
    getUpdatedAt() {
        return this.data.updatedAt;
    }
    // Business Methods
    isEvent() {
        return this.data.activityType === "EVENT";
    }
    isCourse() {
        return this.data.activityType === "COURSE";
    }
    isRegistered() {
        return this.data.status === "REGISTERED";
    }
    hasAttended() {
        return ["ATTENDED", "COMPLETED"].includes(this.data.status);
    }
    isCompleted() {
        return this.data.status === "COMPLETED";
    }
    isCancelled() {
        return this.data.status === "CANCELLED";
    }
    isNoShow() {
        return this.data.status === "NO_SHOW";
    }
    canMarkAttendance() {
        return ["REGISTERED", "ATTENDED"].includes(this.data.status);
    }
    canMarkCompletion() {
        return (this.data.status === "ATTENDED" ||
            (this.data.status === "COMPLETED" && this.isCourse()));
    }
    canGenerateCertificate() {
        if (this.data.certificateGenerated)
            return false;
        if (this.isEvent()) {
            return this.data.status === "ATTENDED";
        }
        if (this.isCourse()) {
            return (this.data.status === "COMPLETED" && this.data.completionPercentage >= 80);
        }
        return false;
    }
    getProgressStatus() {
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
    markAttendance(attendancePercentage = 100) {
        if (!this.canMarkAttendance()) {
            throw new Error("Cannot mark attendance for current status");
        }
        if (attendancePercentage < 0 || attendancePercentage > 100) {
            throw new Error("Attendance percentage must be between 0 and 100");
        }
        const updatedData = {
            ...this.data,
            status: "ATTENDED",
            attendanceDate: new Date(),
            attendancePercentage,
            updatedAt: new Date(),
        };
        return new ParticipationRegistration(updatedData);
    }
    markCompletion(completionPercentage = 100) {
        if (!this.canMarkCompletion()) {
            throw new Error("Cannot mark completion for current status");
        }
        if (completionPercentage < 0 || completionPercentage > 100) {
            throw new Error("Completion percentage must be between 0 and 100");
        }
        const updatedData = {
            ...this.data,
            status: "COMPLETED",
            completionDate: new Date(),
            completionPercentage,
            updatedAt: new Date(),
        };
        return new ParticipationRegistration(updatedData);
    }
    markNoShow() {
        if (this.data.status === "COMPLETED") {
            throw new Error("Cannot mark no-show for completed participation");
        }
        const updatedData = {
            ...this.data,
            status: "NO_SHOW",
            updatedAt: new Date(),
        };
        return new ParticipationRegistration(updatedData);
    }
    cancel(reason) {
        if (this.data.status === "COMPLETED") {
            throw new Error("Cannot cancel completed participation");
        }
        const notes = reason
            ? `${this.data.notes || ""}\nCancelled: ${reason}`.trim()
            : this.data.notes;
        const updatedData = {
            ...this.data,
            status: "CANCELLED",
            notes,
            updatedAt: new Date(),
        };
        return new ParticipationRegistration(updatedData);
    }
    generateCertificate(certificateId) {
        if (!this.canGenerateCertificate()) {
            throw new Error("Cannot generate certificate for current participation status");
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
    updateProgress(attendancePercentage, completionPercentage) {
        const updates = {
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
    addNote(note) {
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
    getDurationInActivity() {
        if (!this.data.attendanceDate)
            return 0;
        const endDate = this.data.completionDate || new Date();
        const startDate = this.data.attendanceDate;
        return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)); // days
    }
    getOverallProgress() {
        if (this.isEvent()) {
            return this.hasAttended() ? 100 : 0;
        }
        if (this.isCourse()) {
            return Math.max(this.data.attendancePercentage, this.data.completionPercentage);
        }
        return 0;
    }
    isEligibleForCertificate() {
        if (this.data.certificateGenerated)
            return true;
        return this.canGenerateCertificate();
    }
    // Serialization
    toPlainObject() {
        return { ...this.data };
    }
    toJSON() {
        return this.toPlainObject();
    }
    // Summary for reporting
    getSummary() {
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
exports.ParticipationRegistration = ParticipationRegistration;
//# sourceMappingURL=ParticipationRegistration.js.map