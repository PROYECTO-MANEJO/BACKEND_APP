"use strict";
/**
 * Enrollment Entity - Domain Layer
 *
 * Representa la inscripción de un usuario a eventos o cursos
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enrollment = void 0;
class Enrollment {
    constructor(data) {
        this.data = data;
        this.validateData();
    }
    static create(activityId, activityName, activityType, participantId, participantName, participantEmail, participantCedula, paymentAmount, paymentCurrency = "CRC", participantPhone, startDate, endDate, location, instructor, requiresApproval = false, requiredDocuments = [], source = "WEB", createdBy) {
        const now = new Date();
        const enrollmentData = {
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
            status: requiresApproval ? "PENDING" : "CONFIRMED",
            paymentStatus: "PENDING",
            paymentDetails: {
                amount: paymentAmount,
                currency: paymentCurrency,
            },
            startDate,
            endDate,
            location: location?.trim(),
            instructor: instructor?.trim(),
            hasWaitingList: false,
            priorityScore: 0,
            requiresApproval,
            approvalStatus: requiresApproval ? "PENDING" : "APPROVED",
            requiredDocuments,
            submittedDocuments: [],
            documentationComplete: requiredDocuments.length === 0,
            confirmationSent: false,
            remindersSent: 0,
            notificationsEnabled: true,
            createdAt: now,
            updatedAt: now,
            createdBy,
            source,
        };
        return new Enrollment(enrollmentData);
    }
    static fromPrismaData(enrollmentData, activityType) {
        // Map from database structure based on activity type
        if (activityType === "EVENT") {
            return Enrollment.fromEventInscription(enrollmentData);
        }
        else {
            return Enrollment.fromCourseInscription(enrollmentData);
        }
    }
    static fromEventInscription(inscription) {
        const evento = inscription.evento;
        const usuario = inscription.usuario;
        const enrollmentData = {
            id: inscription.id_ins.toString(),
            activityId: evento.id_eve.toString(),
            activityName: evento.nom_eve,
            activityType: "EVENT",
            participantId: usuario.id_usu.toString(),
            participantName: `${usuario.nom_usu1} ${usuario.nom_usu2 || ""} ${usuario.ape_usu1} ${usuario.ape_usu2 || ""}`.trim(),
            participantEmail: usuario.email_usu || "",
            participantCedula: usuario.ced_usu,
            participantPhone: usuario.tel_usu,
            enrollmentDate: new Date(inscription.fec_ins),
            status: Enrollment.mapEnrollmentStatus(inscription.estado_pago),
            paymentStatus: inscription.estado_pago,
            paymentDetails: {
                amount: evento.precio_eve || 0,
                currency: "CRC",
                paymentMethod: inscription.metodo_pago,
                transactionId: inscription.transaction_id,
                paymentDate: inscription.fecha_pago
                    ? new Date(inscription.fecha_pago)
                    : undefined,
                paymentNotes: inscription.notas_pago,
            },
            startDate: evento.fec_ini_eve ? new Date(evento.fec_ini_eve) : undefined,
            endDate: evento.fec_fin_eve ? new Date(evento.fec_fin_eve) : undefined,
            location: evento.ubicacion_eve,
            instructor: evento.instructor || evento.organizador,
            hasWaitingList: false,
            priorityScore: 0,
            requiresApproval: evento.requiere_aprobacion || false,
            approvalStatus: inscription.aprobacion_estado || "APPROVED",
            approvedBy: inscription.aprobado_por,
            approvalDate: inscription.fecha_aprobacion
                ? new Date(inscription.fecha_aprobacion)
                : undefined,
            requiredDocuments: [],
            submittedDocuments: [],
            documentationComplete: true,
            confirmationSent: inscription.confirmacion_enviada || false,
            remindersSent: inscription.recordatorios_enviados || 0,
            notificationsEnabled: true,
            createdAt: new Date(inscription.fec_ins),
            updatedAt: inscription.fecha_actualizacion
                ? new Date(inscription.fecha_actualizacion)
                : new Date(inscription.fec_ins),
            source: "WEB",
        };
        return new Enrollment(enrollmentData);
    }
    static fromCourseInscription(inscripcionCurso) {
        const curso = inscripcionCurso.curso;
        const usuario = inscripcionCurso.usuario;
        const enrollmentData = {
            id: inscripcionCurso.id_ins_cur.toString(),
            activityId: curso.id_cur.toString(),
            activityName: curso.nom_cur,
            activityType: "COURSE",
            participantId: usuario.id_usu.toString(),
            participantName: `${usuario.nom_usu1} ${usuario.nom_usu2 || ""} ${usuario.ape_usu1} ${usuario.ape_usu2 || ""}`.trim(),
            participantEmail: usuario.email_usu || "",
            participantCedula: usuario.ced_usu,
            participantPhone: usuario.tel_usu,
            enrollmentDate: new Date(inscripcionCurso.fec_ins_cur),
            status: Enrollment.mapEnrollmentStatus(inscripcionCurso.estado_pago_cur),
            paymentStatus: inscripcionCurso.estado_pago_cur,
            paymentDetails: {
                amount: curso.precio_cur || 0,
                currency: "CRC",
                paymentMethod: inscripcionCurso.metodo_pago_cur,
                transactionId: inscripcionCurso.transaction_id_cur,
                paymentDate: inscripcionCurso.fecha_pago_cur
                    ? new Date(inscripcionCurso.fecha_pago_cur)
                    : undefined,
                paymentNotes: inscripcionCurso.notas_pago_cur,
            },
            startDate: curso.fec_ini_cur ? new Date(curso.fec_ini_cur) : undefined,
            endDate: curso.fec_fin_cur ? new Date(curso.fec_fin_cur) : undefined,
            location: curso.ubicacion_cur,
            instructor: curso.instructor_cur,
            hasWaitingList: false,
            priorityScore: 0,
            requiresApproval: curso.requiere_aprobacion_cur || false,
            approvalStatus: inscripcionCurso.aprobacion_estado_cur || "APPROVED",
            approvedBy: inscripcionCurso.aprobado_por_cur,
            approvalDate: inscripcionCurso.fecha_aprobacion_cur
                ? new Date(inscripcionCurso.fecha_aprobacion_cur)
                : undefined,
            requiredDocuments: [],
            submittedDocuments: [],
            documentationComplete: true,
            confirmationSent: inscripcionCurso.confirmacion_enviada_cur || false,
            remindersSent: inscripcionCurso.recordatorios_enviados_cur || 0,
            notificationsEnabled: true,
            createdAt: new Date(inscripcionCurso.fec_ins_cur),
            updatedAt: inscripcionCurso.fecha_actualizacion_cur
                ? new Date(inscripcionCurso.fecha_actualizacion_cur)
                : new Date(inscripcionCurso.fec_ins_cur),
            source: "WEB",
        };
        return new Enrollment(enrollmentData);
    }
    static mapEnrollmentStatus(paymentStatus) {
        switch (paymentStatus) {
            case "APPROVED":
                return "CONFIRMED";
            case "REJECTED":
            case "REFUNDED":
                return "CANCELLED";
            case "PENDING":
            default:
                return "PENDING";
        }
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
    getParticipantPhone() {
        return this.data.participantPhone;
    }
    getEnrollmentDate() {
        return this.data.enrollmentDate;
    }
    getConfirmationDate() {
        return this.data.confirmationDate;
    }
    getStatus() {
        return this.data.status;
    }
    getPaymentStatus() {
        return this.data.paymentStatus;
    }
    getPaymentDetails() {
        return { ...this.data.paymentDetails };
    }
    getStartDate() {
        return this.data.startDate;
    }
    getEndDate() {
        return this.data.endDate;
    }
    getLocation() {
        return this.data.location;
    }
    getInstructor() {
        return this.data.instructor;
    }
    getWaitingListPosition() {
        return this.data.waitingListPosition;
    }
    getPriorityScore() {
        return this.data.priorityScore;
    }
    getRequiredDocuments() {
        return [...this.data.requiredDocuments];
    }
    getSubmittedDocuments() {
        return [...this.data.submittedDocuments];
    }
    getCreatedAt() {
        return this.data.createdAt;
    }
    getUpdatedAt() {
        return this.data.updatedAt;
    }
    getSource() {
        return this.data.source;
    }
    // Status checks
    isPending() {
        return this.data.status === "PENDING";
    }
    isConfirmed() {
        return this.data.status === "CONFIRMED";
    }
    isCancelled() {
        return this.data.status === "CANCELLED";
    }
    isCompleted() {
        return this.data.status === "COMPLETED";
    }
    isPaymentPending() {
        return this.data.paymentStatus === "PENDING";
    }
    isPaymentApproved() {
        return this.data.paymentStatus === "APPROVED";
    }
    isPaymentRejected() {
        return this.data.paymentStatus === "REJECTED";
    }
    isPaymentRefunded() {
        return this.data.paymentStatus === "REFUNDED";
    }
    isOnWaitingList() {
        return (this.data.hasWaitingList && this.data.waitingListPosition !== undefined);
    }
    requiresApproval() {
        return this.data.requiresApproval;
    }
    isApprovalPending() {
        return this.data.requiresApproval && this.data.approvalStatus === "PENDING";
    }
    isApproved() {
        return (!this.data.requiresApproval || this.data.approvalStatus === "APPROVED");
    }
    isApprovalRejected() {
        return (this.data.requiresApproval && this.data.approvalStatus === "REJECTED");
    }
    isDocumentationComplete() {
        return this.data.documentationComplete;
    }
    isConfirmationSent() {
        return this.data.confirmationSent;
    }
    canBeConfirmed() {
        return (this.data.status === "PENDING" &&
            this.isApproved() &&
            (this.data.paymentStatus === "APPROVED" ||
                this.data.paymentDetails.amount === 0) &&
            this.isDocumentationComplete());
    }
    canBeCancelled() {
        return this.data.status !== "CANCELLED" && this.data.status !== "COMPLETED";
    }
    canProcessPayment() {
        return (this.data.paymentStatus === "PENDING" && this.data.status !== "CANCELLED");
    }
    // Actions
    confirm(confirmedBy) {
        if (!this.canBeConfirmed()) {
            throw new Error("Cannot confirm enrollment: requirements not met");
        }
        const updatedData = {
            ...this.data,
            status: "CONFIRMED",
            confirmationDate: new Date(),
            updatedAt: new Date(),
            lastModifiedBy: confirmedBy,
        };
        return new Enrollment(updatedData);
    }
    cancel(reason, cancelledBy) {
        if (!this.canBeCancelled()) {
            throw new Error("Cannot cancel enrollment: invalid status");
        }
        const updatedData = {
            ...this.data,
            status: "CANCELLED",
            cancellationDate: new Date(),
            cancellationReason: reason,
            updatedAt: new Date(),
            lastModifiedBy: cancelledBy,
        };
        return new Enrollment(updatedData);
    }
    updatePaymentStatus(paymentStatus, transactionId, paymentMethod, paymentNotes, processedBy) {
        if (!this.canProcessPayment() && paymentStatus !== "REFUNDED") {
            throw new Error("Cannot update payment status");
        }
        const updatedPaymentDetails = {
            ...this.data.paymentDetails,
            paymentMethod: paymentMethod || this.data.paymentDetails.paymentMethod,
            transactionId: transactionId || this.data.paymentDetails.transactionId,
            paymentDate: paymentStatus === "APPROVED"
                ? new Date()
                : this.data.paymentDetails.paymentDate,
            paymentNotes: paymentNotes || this.data.paymentDetails.paymentNotes,
            processedBy: processedBy || this.data.paymentDetails.processedBy,
        };
        // Update enrollment status based on payment status
        let newStatus = this.data.status;
        if (paymentStatus === "APPROVED" &&
            this.data.status === "PENDING" &&
            this.isApproved() &&
            this.isDocumentationComplete()) {
            newStatus = "CONFIRMED";
        }
        else if (paymentStatus === "REJECTED" || paymentStatus === "REFUNDED") {
            newStatus = "CANCELLED";
        }
        const updatedData = {
            ...this.data,
            status: newStatus,
            paymentStatus,
            paymentDetails: updatedPaymentDetails,
            confirmationDate: newStatus === "CONFIRMED" ? new Date() : this.data.confirmationDate,
            updatedAt: new Date(),
            lastModifiedBy: processedBy,
        };
        return new Enrollment(updatedData);
    }
    updateApprovalStatus(approvalStatus, approvedBy, approvalNotes) {
        if (!this.data.requiresApproval) {
            throw new Error("This enrollment does not require approval");
        }
        if (this.data.approvalStatus !== "PENDING") {
            throw new Error("Approval has already been processed");
        }
        // Update enrollment status based on approval
        let newStatus = this.data.status;
        if (approvalStatus === "APPROVED" &&
            this.data.status === "PENDING" &&
            this.isPaymentApproved() &&
            this.isDocumentationComplete()) {
            newStatus = "CONFIRMED";
        }
        else if (approvalStatus === "REJECTED") {
            newStatus = "CANCELLED";
        }
        const updatedData = {
            ...this.data,
            status: newStatus,
            approvalStatus,
            approvedBy,
            approvalDate: new Date(),
            approvalNotes,
            confirmationDate: newStatus === "CONFIRMED" ? new Date() : this.data.confirmationDate,
            updatedAt: new Date(),
            lastModifiedBy: approvedBy,
        };
        return new Enrollment(updatedData);
    }
    addToWaitingList(position, priorityScore) {
        if (this.data.status !== "PENDING") {
            throw new Error("Only pending enrollments can be added to waiting list");
        }
        const updatedData = {
            ...this.data,
            hasWaitingList: true,
            waitingListPosition: position,
            priorityScore: priorityScore || this.data.priorityScore,
            updatedAt: new Date(),
        };
        return new Enrollment(updatedData);
    }
    removeFromWaitingList() {
        if (!this.data.hasWaitingList) {
            throw new Error("Enrollment is not on waiting list");
        }
        const updatedData = {
            ...this.data,
            hasWaitingList: false,
            waitingListPosition: undefined,
            updatedAt: new Date(),
        };
        return new Enrollment(updatedData);
    }
    submitDocument(document, submittedBy) {
        if (this.data.submittedDocuments.includes(document)) {
            throw new Error("Document already submitted");
        }
        if (!this.data.requiredDocuments.includes(document)) {
            throw new Error("Document is not required");
        }
        const updatedSubmittedDocuments = [
            ...this.data.submittedDocuments,
            document,
        ];
        const documentationComplete = this.data.requiredDocuments.every((doc) => updatedSubmittedDocuments.includes(doc));
        // Update enrollment status if all requirements are now met
        let newStatus = this.data.status;
        if (documentationComplete &&
            this.data.status === "PENDING" &&
            this.isApproved() &&
            this.isPaymentApproved()) {
            newStatus = "CONFIRMED";
        }
        const updatedData = {
            ...this.data,
            status: newStatus,
            submittedDocuments: updatedSubmittedDocuments,
            documentationComplete,
            confirmationDate: newStatus === "CONFIRMED" ? new Date() : this.data.confirmationDate,
            updatedAt: new Date(),
            lastModifiedBy: submittedBy,
        };
        return new Enrollment(updatedData);
    }
    sendConfirmation() {
        if (!this.isConfirmed()) {
            throw new Error("Cannot send confirmation for unconfirmed enrollment");
        }
        const updatedData = {
            ...this.data,
            confirmationSent: true,
            updatedAt: new Date(),
        };
        return new Enrollment(updatedData);
    }
    sendReminder() {
        const updatedData = {
            ...this.data,
            remindersSent: this.data.remindersSent + 1,
            updatedAt: new Date(),
        };
        return new Enrollment(updatedData);
    }
    updatePriorityScore(priorityScore) {
        if (priorityScore < 0) {
            throw new Error("Priority score cannot be negative");
        }
        const updatedData = {
            ...this.data,
            priorityScore,
            updatedAt: new Date(),
        };
        return new Enrollment(updatedData);
    }
    updateContactInfo(email, phone, updatedBy) {
        const updates = {
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
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
            ...updates,
        };
        return new Enrollment(updatedData);
    }
    // Statistics and analysis
    getDaysUntilStart() {
        if (!this.data.startDate)
            return null;
        const today = new Date();
        const diffTime = this.data.startDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    getDaysEnrolled() {
        const today = new Date();
        const diffTime = today.getTime() - this.data.enrollmentDate.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
    getRequiredDocumentsStatus() {
        return {
            total: this.data.requiredDocuments.length,
            submitted: this.data.submittedDocuments.length,
            pending: this.data.requiredDocuments.filter((doc) => !this.data.submittedDocuments.includes(doc)),
            complete: this.data.documentationComplete,
        };
    }
    getEnrollmentSummary() {
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
            daysEnrolled: this.getDaysEnrolled(),
        };
    }
    getDetailedReport() {
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
            source: this.data.source,
        };
    }
}
exports.Enrollment = Enrollment;
//# sourceMappingURL=Enrollment.js.map