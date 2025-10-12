"use strict";
/**
 * Course Domain Entity - Clean Architecture Domain Layer
 *
 * Represents a course in the educational system with comprehensive business logic
 * for course management, enrollment, prerequisites, and career associations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Course = void 0;
class Course {
    constructor(courseData) {
        this.data = { ...courseData };
        this.validateData();
    }
    /**
     * Create a new course with validation
     */
    static create(name, description, duration, startDate, endDate, categoryId, organizerId, maxCapacity, audienceType = "PUBLICO_GENERAL", createdBy) {
        const now = new Date();
        const courseData = {
            id: `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: name.trim(),
            description: description.trim(),
            duration,
            startDate,
            endDate,
            categoryId,
            organizerId,
            maxCapacity,
            currentEnrollments: 0,
            audienceType,
            requiresDocumentVerification: true,
            requiresMotivationLetter: false,
            isFree: true,
            attendancePercentageForApproval: 80,
            minimumGradeForApproval: 7.0,
            status: "DRAFT",
            associatedCareers: [],
            prerequisites: {
                requiredCourses: [],
                requiredSkills: [],
            },
            materials: {
                resources: [],
            },
            schedule: {
                sessions: [],
                totalSessions: 0,
                sessionDuration: 60,
            },
            evaluation: {
                hasExam: false,
                hasProject: false,
                certificationType: "PARTICIPATION",
            },
            createdAt: now,
            updatedAt: now,
            createdBy,
        };
        return new Course(courseData);
    }
    /**
     * Create Course from existing data (e.g., from database)
     */
    static fromData(courseData) {
        const mappedData = {
            id: courseData.id_cur,
            name: courseData.nom_cur,
            description: courseData.des_cur,
            duration: courseData.dur_cur,
            startDate: new Date(courseData.fec_ini_cur),
            endDate: new Date(courseData.fec_fin_cur),
            categoryId: courseData.id_cat_cur,
            organizerId: courseData.ced_org_cur,
            maxCapacity: courseData.capacidad_max_cur,
            currentEnrollments: courseData._count?.inscripcionesCurso || 0,
            audienceType: courseData.tipo_audiencia_cur,
            requiresDocumentVerification: courseData.requiere_verificacion_docs,
            requiresMotivationLetter: courseData.requiere_carta_motivacion,
            isFree: courseData.es_gratuito,
            price: courseData.precio ? parseFloat(courseData.precio) : undefined,
            attendancePercentageForApproval: courseData.porcentaje_asistencia_aprobacion,
            minimumGradeForApproval: parseFloat(courseData.nota_minima_aprobacion),
            status: courseData.estado,
            associatedCareers: courseData.cursosPorCarrera?.map((cpc) => cpc.id_car_per) || [],
            prerequisites: {
                requiredCourses: [],
                requiredSkills: [],
            },
            materials: {
                resources: [],
            },
            schedule: {
                sessions: [],
                totalSessions: 0,
                sessionDuration: 60,
            },
            evaluation: {
                hasExam: false,
                hasProject: false,
                certificationType: "PARTICIPATION",
            },
            createdAt: courseData.createdAt || new Date(),
            updatedAt: courseData.updatedAt || new Date(),
        };
        return new Course(mappedData);
    }
    /**
     * Validate course data integrity
     */
    validateData() {
        if (!this.data.name || this.data.name.trim().length === 0) {
            throw new Error("Course name is required");
        }
        if (!this.data.description || this.data.description.trim().length === 0) {
            throw new Error("Course description is required");
        }
        if (this.data.duration <= 0) {
            throw new Error("Course duration must be positive");
        }
        if (this.data.startDate >= this.data.endDate) {
            throw new Error("Start date must be before end date");
        }
        if (this.data.maxCapacity <= 0) {
            throw new Error("Max capacity must be positive");
        }
        if (this.data.currentEnrollments < 0) {
            throw new Error("Current enrollments cannot be negative");
        }
        if (this.data.currentEnrollments > this.data.maxCapacity) {
            throw new Error("Current enrollments cannot exceed max capacity");
        }
        if (this.data.attendancePercentageForApproval < 0 ||
            this.data.attendancePercentageForApproval > 100) {
            throw new Error("Attendance percentage must be between 0 and 100");
        }
        if (this.data.minimumGradeForApproval < 0 ||
            this.data.minimumGradeForApproval > 10) {
            throw new Error("Minimum grade must be between 0 and 10");
        }
        if (!this.data.isFree && (!this.data.price || this.data.price <= 0)) {
            throw new Error("Paid courses must have a positive price");
        }
        if (this.data.isFree && this.data.price) {
            throw new Error("Free courses cannot have a price");
        }
    }
    // Getter methods
    getId() {
        return this.data.id;
    }
    getName() {
        return this.data.name;
    }
    getDescription() {
        return this.data.description;
    }
    getDuration() {
        return this.data.duration;
    }
    getStartDate() {
        return new Date(this.data.startDate);
    }
    getEndDate() {
        return new Date(this.data.endDate);
    }
    getCategoryId() {
        return this.data.categoryId;
    }
    getOrganizerId() {
        return this.data.organizerId;
    }
    getMaxCapacity() {
        return this.data.maxCapacity;
    }
    getCurrentEnrollments() {
        return this.data.currentEnrollments;
    }
    getAudienceType() {
        return this.data.audienceType;
    }
    getStatus() {
        return this.data.status;
    }
    isFree() {
        return this.data.isFree;
    }
    getPrice() {
        return this.data.price;
    }
    getAssociatedCareers() {
        return [...this.data.associatedCareers];
    }
    getAttendanceRequirement() {
        return this.data.attendancePercentageForApproval;
    }
    getMinimumGrade() {
        return this.data.minimumGradeForApproval;
    }
    requiresDocumentVerification() {
        return this.data.requiresDocumentVerification;
    }
    requiresMotivationLetter() {
        return this.data.requiresMotivationLetter;
    }
    getPrerequisites() {
        return { ...this.data.prerequisites };
    }
    /**
     * Check if course has available spots
     */
    hasAvailableSpots() {
        return this.data.currentEnrollments < this.data.maxCapacity;
    }
    /**
     * Get available spots count
     */
    getAvailableSpots() {
        return Math.max(0, this.data.maxCapacity - this.data.currentEnrollments);
    }
    /**
     * Check if course is in enrollment period
     */
    isInEnrollmentPeriod() {
        const now = new Date();
        return now < this.data.startDate && this.data.status === "ACTIVE";
    }
    /**
     * Check if course has started
     */
    hasStarted() {
        const now = new Date();
        return now >= this.data.startDate;
    }
    /**
     * Check if course has ended
     */
    hasEnded() {
        const now = new Date();
        return now > this.data.endDate;
    }
    /**
     * Check if user meets prerequisites
     */
    meetsPrerequisites(userCompletedCourses, userSkills) {
        const missingCourses = this.data.prerequisites.requiredCourses.filter((courseId) => !userCompletedCourses.includes(courseId));
        const missingSkills = this.data.prerequisites.requiredSkills.filter((skill) => !userSkills.includes(skill));
        return {
            meets: missingCourses.length === 0 && missingSkills.length === 0,
            missing: {
                courses: missingCourses,
                skills: missingSkills,
            },
        };
    }
    /**
     * Check if user is eligible for enrollment based on career
     */
    isEligibleForCareer(userCareerIds) {
        switch (this.data.audienceType) {
            case "PUBLICO_GENERAL":
                return true;
            case "TODAS_CARRERAS":
                return userCareerIds.length > 0;
            case "CARRERA_ESPECIFICA":
                return this.data.associatedCareers.some((careerId) => userCareerIds.includes(careerId));
            default:
                return false;
        }
    }
    /**
     * Update course basic information
     */
    updateBasicInfo(name, description, duration, updatedBy) {
        const updatedData = {
            ...this.data,
            name: name !== undefined ? name.trim() : this.data.name,
            description: description !== undefined ? description.trim() : this.data.description,
            duration: duration !== undefined ? duration : this.data.duration,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Course(updatedData);
    }
    /**
     * Update course dates
     */
    updateDates(startDate, endDate, updatedBy) {
        if (this.data.status === "IN_PROGRESS" ||
            this.data.status === "COMPLETED") {
            throw new Error("Cannot update dates for courses in progress or completed");
        }
        const newStartDate = startDate || this.data.startDate;
        const newEndDate = endDate || this.data.endDate;
        if (newStartDate >= newEndDate) {
            throw new Error("Start date must be before end date");
        }
        const updatedData = {
            ...this.data,
            startDate: newStartDate,
            endDate: newEndDate,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Course(updatedData);
    }
    /**
     * Update course capacity
     */
    updateCapacity(newCapacity, updatedBy) {
        if (newCapacity <= 0) {
            throw new Error("Capacity must be positive");
        }
        if (newCapacity < this.data.currentEnrollments) {
            throw new Error("New capacity cannot be less than current enrollments");
        }
        const updatedData = {
            ...this.data,
            maxCapacity: newCapacity,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Course(updatedData);
    }
    /**
     * Update pricing information
     */
    updatePricing(isFree, price, updatedBy) {
        if (!isFree && (!price || price <= 0)) {
            throw new Error("Paid courses must have a positive price");
        }
        if (isFree && price) {
            throw new Error("Free courses cannot have a price");
        }
        const updatedData = {
            ...this.data,
            isFree,
            price: isFree ? undefined : price,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Course(updatedData);
    }
    /**
     * Update approval criteria
     */
    updateApprovalCriteria(attendancePercentage, minimumGrade, updatedBy) {
        if (attendancePercentage !== undefined &&
            (attendancePercentage < 0 || attendancePercentage > 100)) {
            throw new Error("Attendance percentage must be between 0 and 100");
        }
        if (minimumGrade !== undefined && (minimumGrade < 0 || minimumGrade > 10)) {
            throw new Error("Minimum grade must be between 0 and 10");
        }
        const updatedData = {
            ...this.data,
            attendancePercentageForApproval: attendancePercentage !== undefined
                ? attendancePercentage
                : this.data.attendancePercentageForApproval,
            minimumGradeForApproval: minimumGrade !== undefined
                ? minimumGrade
                : this.data.minimumGradeForApproval,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Course(updatedData);
    }
    /**
     * Update course requirements
     */
    updateRequirements(requiresDocumentVerification, requiresMotivationLetter, updatedBy) {
        const updatedData = {
            ...this.data,
            requiresDocumentVerification: requiresDocumentVerification !== undefined
                ? requiresDocumentVerification
                : this.data.requiresDocumentVerification,
            requiresMotivationLetter: requiresMotivationLetter !== undefined
                ? requiresMotivationLetter
                : this.data.requiresMotivationLetter,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Course(updatedData);
    }
    /**
     * Add career association
     */
    addCareerAssociation(careerId, updatedBy) {
        if (this.data.audienceType !== "CARRERA_ESPECIFICA") {
            throw new Error("Can only associate careers with CARRERA_ESPECIFICA audience type");
        }
        if (this.data.associatedCareers.includes(careerId)) {
            throw new Error("Career is already associated with this course");
        }
        const updatedData = {
            ...this.data,
            associatedCareers: [...this.data.associatedCareers, careerId],
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Course(updatedData);
    }
    /**
     * Remove career association
     */
    removeCareerAssociation(careerId, updatedBy) {
        const updatedData = {
            ...this.data,
            associatedCareers: this.data.associatedCareers.filter((id) => id !== careerId),
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Course(updatedData);
    }
    /**
     * Update audience type
     */
    updateAudienceType(audienceType, updatedBy) {
        let updatedCareers = this.data.associatedCareers;
        // Clear career associations if changing to non-specific audience
        if (audienceType !== "CARRERA_ESPECIFICA") {
            updatedCareers = [];
        }
        const updatedData = {
            ...this.data,
            audienceType,
            associatedCareers: updatedCareers,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Course(updatedData);
    }
    /**
     * Add prerequisite course
     */
    addPrerequisiteCourse(courseId, updatedBy) {
        if (courseId === this.data.id) {
            throw new Error("Course cannot be a prerequisite of itself");
        }
        if (this.data.prerequisites.requiredCourses.includes(courseId)) {
            throw new Error("Course is already a prerequisite");
        }
        const updatedPrerequisites = {
            ...this.data.prerequisites,
            requiredCourses: [...this.data.prerequisites.requiredCourses, courseId],
        };
        const updatedData = {
            ...this.data,
            prerequisites: updatedPrerequisites,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Course(updatedData);
    }
    /**
     * Remove prerequisite course
     */
    removePrerequisiteCourse(courseId, updatedBy) {
        const updatedPrerequisites = {
            ...this.data.prerequisites,
            requiredCourses: this.data.prerequisites.requiredCourses.filter((id) => id !== courseId),
        };
        const updatedData = {
            ...this.data,
            prerequisites: updatedPrerequisites,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Course(updatedData);
    }
    /**
     * Update required skills
     */
    updateRequiredSkills(skills, updatedBy) {
        const updatedPrerequisites = {
            ...this.data.prerequisites,
            requiredSkills: [...skills],
        };
        const updatedData = {
            ...this.data,
            prerequisites: updatedPrerequisites,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Course(updatedData);
    }
    /**
     * Publish course (make it active)
     */
    publish(publishedBy) {
        if (this.data.status === "COMPLETED" || this.data.status === "CANCELLED") {
            throw new Error("Cannot publish completed or cancelled course");
        }
        // Validate that course is ready to be published
        if (!this.data.name || !this.data.description) {
            throw new Error("Course must have name and description to be published");
        }
        if (this.data.startDate <= new Date()) {
            throw new Error("Course start date must be in the future");
        }
        const updatedData = {
            ...this.data,
            status: "ACTIVE",
            updatedAt: new Date(),
            lastModifiedBy: publishedBy,
        };
        return new Course(updatedData);
    }
    /**
     * Start course
     */
    start(startedBy) {
        if (this.data.status !== "ACTIVE" && this.data.status !== "FULL") {
            throw new Error("Only active or full courses can be started");
        }
        const now = new Date();
        if (now < this.data.startDate) {
            throw new Error("Cannot start course before scheduled start date");
        }
        const updatedData = {
            ...this.data,
            status: "IN_PROGRESS",
            updatedAt: new Date(),
            lastModifiedBy: startedBy,
        };
        return new Course(updatedData);
    }
    /**
     * Complete course
     */
    complete(completedBy) {
        if (this.data.status !== "IN_PROGRESS") {
            throw new Error("Only courses in progress can be completed");
        }
        const updatedData = {
            ...this.data,
            status: "COMPLETED",
            updatedAt: new Date(),
            lastModifiedBy: completedBy,
        };
        return new Course(updatedData);
    }
    /**
     * Cancel course
     */
    cancel(reason, cancelledBy) {
        if (this.data.status === "COMPLETED" || this.data.status === "CANCELLED") {
            throw new Error("Cannot cancel completed or already cancelled course");
        }
        const updatedData = {
            ...this.data,
            status: "CANCELLED",
            updatedAt: new Date(),
            lastModifiedBy: cancelledBy,
        };
        return new Course(updatedData);
    }
    /**
     * Archive course
     */
    archive(archivedBy) {
        if (this.data.status !== "COMPLETED" && this.data.status !== "CANCELLED") {
            throw new Error("Only completed or cancelled courses can be archived");
        }
        const updatedData = {
            ...this.data,
            status: "ARCHIVED",
            updatedAt: new Date(),
            lastModifiedBy: archivedBy,
        };
        return new Course(updatedData);
    }
    /**
     * Increment enrollment count
     */
    incrementEnrollments(updatedBy) {
        if (this.data.currentEnrollments >= this.data.maxCapacity) {
            throw new Error("Course is at maximum capacity");
        }
        const newEnrollmentCount = this.data.currentEnrollments + 1;
        const newStatus = newEnrollmentCount >= this.data.maxCapacity ? "FULL" : this.data.status;
        const updatedData = {
            ...this.data,
            currentEnrollments: newEnrollmentCount,
            status: newStatus,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Course(updatedData);
    }
    /**
     * Decrement enrollment count
     */
    decrementEnrollments(updatedBy) {
        if (this.data.currentEnrollments <= 0) {
            throw new Error("Course has no enrollments to remove");
        }
        const newEnrollmentCount = this.data.currentEnrollments - 1;
        const newStatus = this.data.status === "FULL" ? "ACTIVE" : this.data.status;
        const updatedData = {
            ...this.data,
            currentEnrollments: newEnrollmentCount,
            status: newStatus,
            updatedAt: new Date(),
            lastModifiedBy: updatedBy,
        };
        return new Course(updatedData);
    }
    /**
     * Calculate course progress percentage
     */
    calculateProgress() {
        const now = new Date();
        if (now < this.data.startDate) {
            return 0;
        }
        if (now > this.data.endDate) {
            return 100;
        }
        const totalDuration = this.data.endDate.getTime() - this.data.startDate.getTime();
        const elapsed = now.getTime() - this.data.startDate.getTime();
        return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    }
    /**
     * Get course enrollment rate
     */
    getEnrollmentRate() {
        return this.data.maxCapacity > 0
            ? (this.data.currentEnrollments / this.data.maxCapacity) * 100
            : 0;
    }
    /**
     * Check if student passes the course based on criteria
     */
    checkPassingCriteria(attendancePercentage, finalGrade) {
        const attendanceMet = attendancePercentage >= this.data.attendancePercentageForApproval;
        const gradeMet = finalGrade >= this.data.minimumGradeForApproval;
        return {
            passes: attendanceMet && gradeMet,
            attendanceMet,
            gradeMet,
        };
    }
    /**
     * Generate course summary for reports
     */
    generateSummary() {
        return {
            id: this.data.id,
            name: this.data.name,
            description: this.data.description,
            duration: this.data.duration,
            schedule: {
                startDate: this.data.startDate,
                endDate: this.data.endDate,
            },
            capacity: {
                max: this.data.maxCapacity,
                current: this.data.currentEnrollments,
                available: this.getAvailableSpots(),
                enrollmentRate: this.getEnrollmentRate(),
            },
            requirements: {
                documentVerification: this.data.requiresDocumentVerification,
                motivationLetter: this.data.requiresMotivationLetter,
                prerequisites: this.data.prerequisites.requiredCourses.length,
            },
            approval: {
                attendanceRequired: this.data.attendancePercentageForApproval,
                minimumGrade: this.data.minimumGradeForApproval,
            },
            pricing: {
                isFree: this.data.isFree,
                price: this.data.price,
            },
            status: this.data.status,
            audienceType: this.data.audienceType,
            associatedCareers: this.data.associatedCareers.length,
            progress: this.calculateProgress(),
        };
    }
    /**
     * Convert to database format
     */
    toDatabaseFormat() {
        return {
            id_cur: this.data.id,
            nom_cur: this.data.name,
            des_cur: this.data.description,
            dur_cur: this.data.duration,
            fec_ini_cur: this.data.startDate,
            fec_fin_cur: this.data.endDate,
            id_cat_cur: this.data.categoryId,
            ced_org_cur: this.data.organizerId,
            capacidad_max_cur: this.data.maxCapacity,
            tipo_audiencia_cur: this.data.audienceType,
            requiere_verificacion_docs: this.data.requiresDocumentVerification,
            requiere_carta_motivacion: this.data.requiresMotivationLetter,
            es_gratuito: this.data.isFree,
            precio: this.data.price,
            porcentaje_asistencia_aprobacion: this.data.attendancePercentageForApproval,
            nota_minima_aprobacion: this.data.minimumGradeForApproval,
            estado: this.data.status,
            createdAt: this.data.createdAt,
            updatedAt: this.data.updatedAt,
        };
    }
}
exports.Course = Course;
//# sourceMappingURL=Course.js.map