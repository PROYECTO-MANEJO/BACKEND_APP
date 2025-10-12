"use strict";
/**
 * Course Administration Entity - Domain Layer
 *
 * Representa la administración de cursos con estadísticas e inscripciones
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseAdministration = void 0;
class CourseAdministration {
    constructor(data) {
        this.data = data;
        this.validateData();
    }
    static create(courseId, courseName, startDate, endDate, maxCapacity, categoryId, categoryName, organizerId, organizerName, duration, modalidad, courseCost = 0, courseDescription) {
        const now = new Date();
        const adminData = {
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
                capacityUtilization: 0,
            },
            inscriptions: [],
            courseCost,
            totalRevenue: 0,
            pendingRevenue: 0,
            createdAt: now,
            updatedAt: now,
        };
        return new CourseAdministration(adminData);
    }
    static fromPrismaData(courseData) {
        const inscriptions = courseData.inscripcionesCurso?.map((ins) => ({
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
            completionPercentage: ins.porcentaje_completado || 0,
        })) || [];
        const statistics = this.calculateStatistics(inscriptions, courseData.capacidad_max_cur);
        const adminData = {
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
            updatedAt: new Date(),
        };
        return new CourseAdministration(adminData);
    }
    static mapPaymentStatus(status) {
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
    static mapCompletionStatus(status) {
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
    static mapModalidad(modalidad) {
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
    static formatOrganizerName(organizer) {
        if (!organizer)
            return "Unknown Organizer";
        const parts = [
            organizer.nom_org1,
            organizer.nom_org2,
            organizer.ape_org1,
            organizer.ape_org2,
        ].filter(Boolean);
        return parts.join(" ").trim() || "Unknown Organizer";
    }
    static calculateStatistics(inscriptions, maxCapacity) {
        const totalInscriptions = inscriptions.length;
        const approvedInscriptions = inscriptions.filter((ins) => ins.paymentStatus === "APPROVED").length;
        const pendingInscriptions = inscriptions.filter((ins) => ins.paymentStatus === "PENDING").length;
        const rejectedInscriptions = inscriptions.filter((ins) => ins.paymentStatus === "REJECTED").length;
        const availableSlots = Math.max(0, maxCapacity - totalInscriptions);
        const capacityUtilization = maxCapacity > 0 ? (totalInscriptions / maxCapacity) * 100 : 0;
        return {
            totalInscriptions,
            approvedInscriptions,
            pendingInscriptions,
            rejectedInscriptions,
            availableSlots,
            capacityUtilization,
        };
    }
    validateData() {
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
    getId() {
        return this.data.id;
    }
    getCourseId() {
        return this.data.courseId;
    }
    getCourseName() {
        return this.data.courseName;
    }
    getCourseDescription() {
        return this.data.courseDescription;
    }
    getStartDate() {
        return this.data.startDate;
    }
    getEndDate() {
        return this.data.endDate;
    }
    getMaxCapacity() {
        return this.data.maxCapacity;
    }
    getDuration() {
        return this.data.duration;
    }
    getModalidad() {
        return this.data.modalidad;
    }
    getCategoryName() {
        return this.data.categoryName;
    }
    getOrganizerName() {
        return this.data.organizerName;
    }
    getStatistics() {
        return { ...this.data.statistics };
    }
    getInscriptions() {
        return [...this.data.inscriptions];
    }
    getCourseCost() {
        return this.data.courseCost;
    }
    getTotalRevenue() {
        return this.data.totalRevenue;
    }
    getPendingRevenue() {
        return this.data.pendingRevenue;
    }
    // Business Methods
    isActive() {
        return this.data.isActive;
    }
    isAdministrable() {
        return this.data.isAdministrable;
    }
    canRegisterParticipation() {
        return (this.data.canRegisterParticipation && new Date() >= this.data.startDate);
    }
    hasAvailableSlots() {
        return this.data.statistics.availableSlots > 0;
    }
    isFullyBooked() {
        return this.data.statistics.availableSlots === 0;
    }
    isVirtual() {
        return this.data.modalidad === "VIRTUAL";
    }
    isHybrid() {
        return this.data.modalidad === "HIBRIDA";
    }
    getCapacityUtilization() {
        return this.data.statistics.capacityUtilization;
    }
    hasInscriptions() {
        return this.data.statistics.totalInscriptions > 0;
    }
    hasPendingInscriptions() {
        return this.data.statistics.pendingInscriptions > 0;
    }
    getInscriptionById(inscriptionId) {
        return this.data.inscriptions.find((ins) => ins.id === inscriptionId);
    }
    getInscriptionsByStatus(status) {
        return this.data.inscriptions.filter((ins) => ins.paymentStatus === status);
    }
    getInscriptionsByCompletion(status) {
        return this.data.inscriptions.filter((ins) => ins.completionStatus === status);
    }
    // Actions
    approveInscription(inscriptionId) {
        const inscription = this.getInscriptionById(inscriptionId);
        if (!inscription) {
            throw new Error(`Inscription ${inscriptionId} not found`);
        }
        if (inscription.paymentStatus === "APPROVED") {
            throw new Error("Inscription is already approved");
        }
        const updatedInscriptions = this.data.inscriptions.map((ins) => ins.id === inscriptionId
            ? { ...ins, paymentStatus: "APPROVED" }
            : ins);
        const updatedStatistics = CourseAdministration.calculateStatistics(updatedInscriptions, this.data.maxCapacity);
        const updatedData = {
            ...this.data,
            inscriptions: updatedInscriptions,
            statistics: updatedStatistics,
            totalRevenue: updatedStatistics.approvedInscriptions * this.data.courseCost,
            pendingRevenue: updatedStatistics.pendingInscriptions * this.data.courseCost,
            updatedAt: new Date(),
        };
        return new CourseAdministration(updatedData);
    }
    rejectInscription(inscriptionId) {
        const inscription = this.getInscriptionById(inscriptionId);
        if (!inscription) {
            throw new Error(`Inscription ${inscriptionId} not found`);
        }
        if (inscription.paymentStatus === "REJECTED") {
            throw new Error("Inscription is already rejected");
        }
        const updatedInscriptions = this.data.inscriptions.map((ins) => ins.id === inscriptionId
            ? { ...ins, paymentStatus: "REJECTED" }
            : ins);
        const updatedStatistics = CourseAdministration.calculateStatistics(updatedInscriptions, this.data.maxCapacity);
        const updatedData = {
            ...this.data,
            inscriptions: updatedInscriptions,
            statistics: updatedStatistics,
            totalRevenue: updatedStatistics.approvedInscriptions * this.data.courseCost,
            pendingRevenue: updatedStatistics.pendingInscriptions * this.data.courseCost,
            updatedAt: new Date(),
        };
        return new CourseAdministration(updatedData);
    }
    markParticipationRegistered(inscriptionId) {
        const inscription = this.getInscriptionById(inscriptionId);
        if (!inscription) {
            throw new Error(`Inscription ${inscriptionId} not found`);
        }
        if (inscription.paymentStatus !== "APPROVED") {
            throw new Error("Cannot register participation for non-approved inscription");
        }
        const updatedInscriptions = this.data.inscriptions.map((ins) => ins.id === inscriptionId ? { ...ins, participationRegistered: true } : ins);
        const updatedData = {
            ...this.data,
            inscriptions: updatedInscriptions,
            updatedAt: new Date(),
        };
        return new CourseAdministration(updatedData);
    }
    updateCompletionStatus(inscriptionId, status, percentage = 0) {
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
        const updatedInscriptions = this.data.inscriptions.map((ins) => ins.id === inscriptionId
            ? {
                ...ins,
                completionStatus: status,
                completionPercentage: percentage,
            }
            : ins);
        const updatedData = {
            ...this.data,
            inscriptions: updatedInscriptions,
            updatedAt: new Date(),
        };
        return new CourseAdministration(updatedData);
    }
    // Reporting Methods
    getCompletionSummary() {
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
            dropoutRate,
        };
    }
    getFinancialSummary() {
        const potentialRevenue = this.data.maxCapacity * this.data.courseCost;
        const revenuePercentage = potentialRevenue > 0
            ? (this.data.totalRevenue / potentialRevenue) * 100
            : 0;
        return {
            totalRevenue: this.data.totalRevenue,
            pendingRevenue: this.data.pendingRevenue,
            potentialRevenue,
            revenuePercentage,
        };
    }
    getAverageCompletionPercentage() {
        const approvedInscriptions = this.getInscriptionsByStatus("APPROVED");
        if (approvedInscriptions.length === 0)
            return 0;
        const totalPercentage = approvedInscriptions.reduce((sum, ins) => sum + ins.completionPercentage, 0);
        return totalPercentage / approvedInscriptions.length;
    }
    // Serialization
    toPlainObject() {
        return { ...this.data };
    }
    toJSON() {
        return this.toPlainObject();
    }
}
exports.CourseAdministration = CourseAdministration;
//# sourceMappingURL=CourseAdministration.js.map