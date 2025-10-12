"use strict";
/**
 * Participation Entity - Domain Layer
 *
 * Representa la participación de un usuario en eventos o cursos
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Participation = void 0;
class Participation {
    constructor(data) {
        this.data = data;
        this.validateData();
    }
    static create(activityId, activityName, activityType, participantId, participantName, participantEmail, participantCedula, enrollmentId, minimumAttendancePercentage, totalSessions, minimumGradeRequired, createdBy) {
        const now = new Date();
        const participationData = {
            id: `participation-${activityType.toLowerCase()}-${Date.now()}`,
            activityId,
            activityName: activityName.trim(),
            activityType,
            participantId,
            participantName: participantName.trim(),
            participantEmail: participantEmail.trim().toLowerCase(),
            participantCedula: participantCedula.trim(),
            enrollmentId,
            enrollmentDate: now,
            paymentStatus: "PENDING",
            status: "ENROLLED",
            grading: {
                attendancePercentage: 0,
                isApproved: false,
                certificateGenerated: false,
            },
            attendanceRecords: [],
            minimumAttendancePercentage,
            minimumGradeRequired,
            totalSessions,
            sessionsAttended: 0,
            createdAt: now,
            updatedAt: now,
            createdBy,
            notificationsEnabled: true,
            remindersSent: 0,
        };
        return new Participation(participationData);
    }
    static fromPrismaData(participationData, activityType) {
        // Map from database structure based on activity type
        if (activityType === "EVENT") {
            return Participation.fromEventParticipation(participationData);
        }
        else {
            return Participation.fromCourseParticipation(participationData);
        }
    }
    static fromEventParticipation(eventParticipation) {
        const inscription = eventParticipation.inscripcion || eventParticipation;
        const evento = inscription.evento || eventParticipation.evento;
        const usuario = inscription.usuario || eventParticipation.usuario;
        const participationData = {
            id: eventParticipation.id_par?.toString() ||
                `event-participation-${inscription.id_ins}`,
            activityId: evento.id_eve.toString(),
            activityName: evento.nom_eve,
            activityType: "EVENT",
            participantId: usuario.id_usu.toString(),
            participantName: `${usuario.nom_usu1} ${usuario.nom_usu2 || ""} ${usuario.ape_usu1} ${usuario.ape_usu2 || ""}`.trim(),
            participantEmail: usuario.email_usu || "",
            participantCedula: usuario.ced_usu,
            enrollmentId: inscription.id_ins.toString(),
            enrollmentDate: new Date(inscription.fec_ins),
            paymentStatus: inscription.estado_pago,
            status: Participation.mapParticipationStatus(eventParticipation.asi_par, evento.porcentaje_asistencia_aprobacion),
            grading: {
                attendancePercentage: eventParticipation.asi_par || 0,
                evaluationDate: eventParticipation.fec_evaluacion
                    ? new Date(eventParticipation.fec_evaluacion)
                    : undefined,
                isApproved: eventParticipation.aprobado || false,
                certificateGenerated: false, // Would need to check certificate table
            },
            attendanceRecords: [],
            minimumAttendancePercentage: evento.porcentaje_asistencia_aprobacion || 80,
            totalSessions: 1, // Events typically have 1 session
            sessionsAttended: eventParticipation.asi_par >= 80 ? 1 : 0,
            createdAt: new Date(inscription.fec_ins),
            updatedAt: eventParticipation.fec_evaluacion
                ? new Date(eventParticipation.fec_evaluacion)
                : new Date(inscription.fec_ins),
            notificationsEnabled: true,
            remindersSent: 0,
        };
        return new Participation(participationData);
    }
    static fromCourseParticipation(courseParticipation) {
        const inscripcionCurso = courseParticipation.inscripcionCurso || courseParticipation;
        const curso = inscripcionCurso.curso || courseParticipation.curso;
        const usuario = inscripcionCurso.usuario || courseParticipation.usuario;
        const participationData = {
            id: courseParticipation.id_par_cur?.toString() ||
                `course-participation-${inscripcionCurso.id_ins_cur}`,
            activityId: curso.id_cur.toString(),
            activityName: curso.nom_cur,
            activityType: "COURSE",
            participantId: usuario.id_usu.toString(),
            participantName: `${usuario.nom_usu1} ${usuario.nom_usu2 || ""} ${usuario.ape_usu1} ${usuario.ape_usu2 || ""}`.trim(),
            participantEmail: usuario.email_usu || "",
            participantCedula: usuario.ced_usu,
            enrollmentId: inscripcionCurso.id_ins_cur.toString(),
            enrollmentDate: new Date(inscripcionCurso.fec_ins_cur),
            paymentStatus: inscripcionCurso.estado_pago_cur,
            status: Participation.mapCourseStatus(courseParticipation.nota_final, courseParticipation.asistencia_porcentaje, curso),
            grading: {
                finalGrade: courseParticipation.nota_final,
                attendancePercentage: courseParticipation.asistencia_porcentaje || 0,
                evaluationDate: courseParticipation.fecha_evaluacion
                    ? new Date(courseParticipation.fecha_evaluacion)
                    : undefined,
                isApproved: courseParticipation.aprobado || false,
                certificateGenerated: false, // Would need to check certificate table
            },
            attendanceRecords: [],
            minimumAttendancePercentage: curso.porcentaje_asistencia_aprobacion || 70,
            minimumGradeRequired: curso.nota_minima_aprobacion || 7.0,
            totalSessions: curso.dur_cur || 1, // Use duration as session count estimate
            sessionsAttended: Math.floor(((courseParticipation.asistencia_porcentaje || 0) / 100) *
                (curso.dur_cur || 1)),
            createdAt: new Date(inscripcionCurso.fec_ins_cur),
            updatedAt: courseParticipation.fecha_evaluacion
                ? new Date(courseParticipation.fecha_evaluacion)
                : new Date(inscripcionCurso.fec_ins_cur),
            notificationsEnabled: true,
            remindersSent: 0,
        };
        return new Participation(participationData);
    }
    static mapParticipationStatus(attendancePercentage, minimumRequired) {
        if (attendancePercentage === undefined || attendancePercentage === null) {
            return "ENROLLED";
        }
        if (attendancePercentage > 0 && attendancePercentage < 100) {
            return "ATTENDING";
        }
        if (attendancePercentage >= (minimumRequired || 80)) {
            return "COMPLETED";
        }
        return "FAILED";
    }
    static mapCourseStatus(finalGrade, attendancePercentage, curso) {
        if (finalGrade === undefined ||
            finalGrade === null ||
            attendancePercentage === undefined ||
            attendancePercentage === null) {
            return "ENROLLED";
        }
        const minGrade = curso.nota_minima_aprobacion || 7.0;
        const minAttendance = curso.porcentaje_asistencia_aprobacion || 70;
        if (attendancePercentage > 0 && (finalGrade === 0 || finalGrade === null)) {
            return "ATTENDING";
        }
        if (finalGrade >= minGrade && attendancePercentage >= minAttendance) {
            return "COMPLETED";
        }
        if (finalGrade > 0 || attendancePercentage > 0) {
            return "PENDING_EVALUATION";
        }
        return "FAILED";
    }
    validateData() {
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
        if (!this.data.enrollmentId?.trim()) {
            throw new Error("Enrollment ID is required");
        }
        if (this.data.minimumAttendancePercentage < 0 ||
            this.data.minimumAttendancePercentage > 100) {
            throw new Error("Minimum attendance percentage must be between 0 and 100");
        }
        if (this.data.grading.attendancePercentage < 0 ||
            this.data.grading.attendancePercentage > 100) {
            throw new Error("Attendance percentage must be between 0 and 100");
        }
        if (this.data.grading.finalGrade !== undefined &&
            (this.data.grading.finalGrade < 0 || this.data.grading.finalGrade > 10)) {
            throw new Error("Final grade must be between 0 and 10");
        }
        if (this.data.totalSessions < 1) {
            throw new Error("Total sessions must be at least 1");
        }
        if (this.data.sessionsAttended < 0 ||
            this.data.sessionsAttended > this.data.totalSessions) {
            throw new Error("Sessions attended cannot be negative or exceed total sessions");
        }
    }
    // Getters
    getId() {
        return this.data.id;
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
    getEnrollmentId() {
        return this.data.enrollmentId;
    }
    getEnrollmentDate() {
        return this.data.enrollmentDate;
    }
    getPaymentStatus() {
        return this.data.paymentStatus;
    }
    getStatus() {
        return this.data.status;
    }
    getGrading() {
        return { ...this.data.grading };
    }
    getAttendanceRecords() {
        return [...this.data.attendanceRecords];
    }
    getAttendancePercentage() {
        return this.data.grading.attendancePercentage;
    }
    getFinalGrade() {
        return this.data.grading.finalGrade;
    }
    getSessionsAttended() {
        return this.data.sessionsAttended;
    }
    getTotalSessions() {
        return this.data.totalSessions;
    }
    getMinimumAttendancePercentage() {
        return this.data.minimumAttendancePercentage;
    }
    getMinimumGradeRequired() {
        return this.data.minimumGradeRequired;
    }
    getCreatedAt() {
        return this.data.createdAt;
    }
    getUpdatedAt() {
        return this.data.updatedAt;
    }
    getLastEvaluatedBy() {
        return this.data.lastEvaluatedBy;
    }
    // Status checks
    isEnrolled() {
        return this.data.status === "ENROLLED";
    }
    isAttending() {
        return this.data.status === "ATTENDING";
    }
    isCompleted() {
        return this.data.status === "COMPLETED";
    }
    isFailed() {
        return this.data.status === "FAILED";
    }
    isWithdrawn() {
        return this.data.status === "WITHDRAWN";
    }
    isPendingEvaluation() {
        return this.data.status === "PENDING_EVALUATION";
    }
    isApproved() {
        return this.data.grading.isApproved;
    }
    hasCertificate() {
        return this.data.grading.certificateGenerated;
    }
    canBeEvaluated() {
        return (["ATTENDING", "PENDING_EVALUATION"].includes(this.data.status) &&
            this.data.paymentStatus === "APPROVED");
    }
    canGenerateCertificate() {
        return (this.data.grading.isApproved && !this.data.grading.certificateGenerated);
    }
    isEligibleForCertificate() {
        const meetsAttendance = this.data.grading.attendancePercentage >=
            this.data.minimumAttendancePercentage;
        const meetsGrade = this.data.activityType === "EVENT" ||
            (this.data.grading.finalGrade !== undefined &&
                this.data.grading.finalGrade >= (this.data.minimumGradeRequired || 0));
        return (meetsAttendance && meetsGrade && this.data.paymentStatus === "APPROVED");
    }
    // Actions
    recordAttendance(sessionDate, present, checkInTime, checkOutTime, notes, recordedBy) {
        if (!this.canBeEvaluated()) {
            throw new Error("Cannot record attendance for this participation status");
        }
        const attendanceRecord = {
            id: `attendance-${Date.now()}`,
            date: sessionDate,
            present,
            checkInTime,
            checkOutTime,
            notes,
            recordedBy: recordedBy || "system",
        };
        const updatedAttendanceRecords = [
            ...this.data.attendanceRecords,
            attendanceRecord,
        ];
        const sessionsAttended = present
            ? this.data.sessionsAttended + 1
            : this.data.sessionsAttended;
        const attendancePercentage = (sessionsAttended / this.data.totalSessions) * 100;
        // Update status based on progress
        let newStatus = this.data.status;
        if (this.data.status === "ENROLLED" && sessionsAttended > 0) {
            newStatus = "ATTENDING";
        }
        const updatedGrading = {
            ...this.data.grading,
            attendancePercentage,
            isApproved: this.calculateApprovalStatus(this.data.grading.finalGrade, attendancePercentage),
        };
        const updatedData = {
            ...this.data,
            status: newStatus,
            grading: updatedGrading,
            attendanceRecords: updatedAttendanceRecords,
            sessionsAttended,
            updatedAt: new Date(),
            lastEvaluatedBy: recordedBy,
        };
        return new Participation(updatedData);
    }
    updateGrade(finalGrade, evaluatedBy, comments) {
        if (this.data.activityType !== "COURSE") {
            throw new Error("Grades can only be assigned to course participations");
        }
        if (!this.canBeEvaluated()) {
            throw new Error("Cannot update grade for this participation status");
        }
        if (finalGrade < 0 || finalGrade > 10) {
            throw new Error("Final grade must be between 0 and 10");
        }
        const isApproved = this.calculateApprovalStatus(finalGrade, this.data.grading.attendancePercentage);
        const updatedGrading = {
            ...this.data.grading,
            finalGrade,
            evaluationDate: new Date(),
            evaluatedBy,
            comments,
            isApproved,
        };
        // Update status based on completion
        let newStatus = this.data.status;
        if (isApproved) {
            newStatus = "COMPLETED";
        }
        else if (finalGrade > 0) {
            newStatus = "FAILED";
        }
        const updatedData = {
            ...this.data,
            status: newStatus,
            grading: updatedGrading,
            updatedAt: new Date(),
            lastEvaluatedBy: evaluatedBy,
        };
        return new Participation(updatedData);
    }
    updateAttendancePercentage(attendancePercentage, evaluatedBy) {
        if (!this.canBeEvaluated()) {
            throw new Error("Cannot update attendance for this participation status");
        }
        if (attendancePercentage < 0 || attendancePercentage > 100) {
            throw new Error("Attendance percentage must be between 0 and 100");
        }
        const isApproved = this.calculateApprovalStatus(this.data.grading.finalGrade, attendancePercentage);
        const sessionsAttended = Math.floor((attendancePercentage / 100) * this.data.totalSessions);
        const updatedGrading = {
            ...this.data.grading,
            attendancePercentage,
            evaluationDate: new Date(),
            evaluatedBy,
            isApproved,
        };
        // Update status based on progress
        let newStatus = this.data.status;
        if (this.data.status === "ENROLLED" && attendancePercentage > 0) {
            newStatus = "ATTENDING";
        }
        else if (isApproved) {
            newStatus = "COMPLETED";
        }
        else if (attendancePercentage >= 50) {
            newStatus = "PENDING_EVALUATION";
        }
        const updatedData = {
            ...this.data,
            status: newStatus,
            grading: updatedGrading,
            sessionsAttended,
            updatedAt: new Date(),
            lastEvaluatedBy: evaluatedBy,
        };
        return new Participation(updatedData);
    }
    generateCertificate(certificateId) {
        if (!this.canGenerateCertificate()) {
            throw new Error("Cannot generate certificate for this participation");
        }
        const updatedGrading = {
            ...this.data.grading,
            certificateGenerated: true,
            certificateId,
        };
        const updatedData = {
            ...this.data,
            grading: updatedGrading,
            updatedAt: new Date(),
        };
        return new Participation(updatedData);
    }
    withdraw(reason, withdrawnBy) {
        if (this.data.status === "COMPLETED" || this.data.status === "WITHDRAWN") {
            throw new Error("Cannot withdraw from completed or already withdrawn participation");
        }
        const updatedData = {
            ...this.data,
            status: "WITHDRAWN",
            withdrawalDate: new Date(),
            withdrawalReason: reason,
            updatedAt: new Date(),
            lastEvaluatedBy: withdrawnBy,
        };
        return new Participation(updatedData);
    }
    updatePaymentStatus(paymentStatus) {
        const updatedData = {
            ...this.data,
            paymentStatus,
            updatedAt: new Date(),
        };
        return new Participation(updatedData);
    }
    calculateApprovalStatus(finalGrade, attendancePercentage) {
        const meetsAttendance = (attendancePercentage || 0) >= this.data.minimumAttendancePercentage;
        if (this.data.activityType === "EVENT") {
            return meetsAttendance;
        }
        else {
            const meetsGrade = (finalGrade || 0) >= (this.data.minimumGradeRequired || 0);
            return meetsAttendance && meetsGrade;
        }
    }
    // Statistics and analysis
    getProgressPercentage() {
        if (this.data.activityType === "EVENT") {
            return this.data.grading.attendancePercentage;
        }
        else {
            // For courses, consider both attendance and grade progress
            const attendanceProgress = this.data.grading.attendancePercentage;
            const gradeProgress = this.data.grading.finalGrade
                ? (this.data.grading.finalGrade / 10) * 100
                : 0;
            return Math.max(attendanceProgress, gradeProgress);
        }
    }
    getParticipationSummary() {
        return {
            participantName: this.data.participantName,
            activityName: this.data.activityName,
            activityType: this.data.activityType,
            status: this.data.status,
            attendancePercentage: this.data.grading.attendancePercentage,
            finalGrade: this.data.grading.finalGrade,
            isApproved: this.data.grading.isApproved,
            certificateGenerated: this.data.grading.certificateGenerated,
            enrollmentDate: this.data.enrollmentDate,
            completionDate: this.data.completionDate,
            progressPercentage: this.getProgressPercentage(),
            paymentStatus: this.data.paymentStatus,
        };
    }
    getDetailedReport() {
        return {
            ...this.getParticipationSummary(),
            participantId: this.data.participantId,
            participantEmail: this.data.participantEmail,
            participantCedula: this.data.participantCedula,
            enrollmentId: this.data.enrollmentId,
            sessionsAttended: this.data.sessionsAttended,
            totalSessions: this.data.totalSessions,
            minimumAttendanceRequired: this.data.minimumAttendancePercentage,
            minimumGradeRequired: this.data.minimumGradeRequired,
            attendanceRecords: this.data.attendanceRecords,
            evaluationDate: this.data.grading.evaluationDate,
            evaluatedBy: this.data.grading.evaluatedBy,
            comments: this.data.grading.comments,
            withdrawalReason: this.data.withdrawalReason,
            createdAt: this.data.createdAt,
            updatedAt: this.data.updatedAt,
        };
    }
}
exports.Participation = Participation;
//# sourceMappingURL=Participation.js.map