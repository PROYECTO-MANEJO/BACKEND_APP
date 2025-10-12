"use strict";
/**
 * Course Management Use Case - Application Layer
 *
 * Handles all course-related operations including CRUD, lifecycle management,
 * enrollment processing, and prerequisite validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseManagement = void 0;
const courses_1 = require("../../../domain/entities/courses");
class CourseManagement {
    constructor(courseRepository, userService, categoryService, notificationService, enrollmentService, validationService) {
        this.courseRepository = courseRepository;
        this.userService = userService;
        this.categoryService = categoryService;
        this.notificationService = notificationService;
        this.enrollmentService = enrollmentService;
        this.validationService = validationService;
    }
    /**
     * Create a new course
     */
    async createCourse(input) {
        try {
            const warnings = [];
            // Validate organizer exists
            if (input.organizerId) {
                const organizerExists = await this.userService.validateUserExists(input.organizerId);
                if (!organizerExists) {
                    return {
                        success: false,
                        message: "Organizer not found",
                    };
                }
            }
            // Validate category exists and get settings
            const categoryExists = await this.categoryService.validateCategoryExists(input.categoryId);
            if (!categoryExists) {
                return {
                    success: false,
                    message: "Course category not found",
                };
            }
            // Validate course name
            const nameValidation = await this.validationService.validateCourseName(input.name, input.categoryId);
            if (!nameValidation.isValid) {
                return {
                    success: false,
                    message: nameValidation.message || "Invalid course name",
                };
            }
            // Validate scheduling
            if (input.organizerId) {
                const scheduleValidation = await this.validationService.validateScheduling(input.startDate, input.endDate, input.organizerId);
                if (!scheduleValidation.isValid) {
                    if (scheduleValidation.conflicts &&
                        scheduleValidation.conflicts.length > 0) {
                        warnings.push("Schedule conflicts detected with existing courses");
                    }
                    else {
                        return {
                            success: false,
                            message: "Invalid course schedule",
                        };
                    }
                }
            }
            // Validate capacity
            const capacityValidation = await this.validationService.validateCapacity(input.maxCapacity, input.categoryId);
            if (!capacityValidation.isValid) {
                return {
                    success: false,
                    message: capacityValidation.message || "Invalid course capacity",
                };
            }
            // Validate prerequisites if provided
            if (input.prerequisites?.requiredCourses &&
                input.prerequisites.requiredCourses.length > 0) {
                const prereqValidation = await this.validationService.validatePrerequisites(input.prerequisites.requiredCourses);
                if (!prereqValidation.isValid) {
                    return {
                        success: false,
                        message: prereqValidation.message || "Invalid prerequisites",
                    };
                }
            }
            // Create course domain entity
            const course = courses_1.Course.create(input.name, input.description, input.duration, input.startDate, input.endDate, input.categoryId, input.organizerId, input.maxCapacity, input.audienceType, input.createdBy);
            // Apply additional settings
            let updatedCourse = course;
            if (input.requiresDocumentVerification !== undefined ||
                input.requiresMotivationLetter !== undefined) {
                updatedCourse = updatedCourse.updateRequirements(input.requiresDocumentVerification, input.requiresMotivationLetter, input.createdBy);
            }
            if (input.isFree !== undefined || input.price !== undefined) {
                updatedCourse = updatedCourse.updatePricing(input.isFree ?? true, input.price, input.createdBy);
            }
            if (input.attendancePercentageForApproval !== undefined ||
                input.minimumGradeForApproval !== undefined) {
                updatedCourse = updatedCourse.updateApprovalCriteria(input.attendancePercentageForApproval, input.minimumGradeForApproval, input.createdBy);
            }
            // Add career associations
            if (input.associatedCareers && input.associatedCareers.length > 0) {
                for (const careerId of input.associatedCareers) {
                    try {
                        updatedCourse = updatedCourse.addCareerAssociation(careerId, input.createdBy);
                    }
                    catch (error) {
                        warnings.push(`Could not associate career ${careerId}: ${error instanceof Error ? error.message : "Unknown error"}`);
                    }
                }
            }
            // Add prerequisites
            if (input.prerequisites?.requiredCourses &&
                input.prerequisites.requiredCourses.length > 0) {
                for (const prerequisiteId of input.prerequisites.requiredCourses) {
                    try {
                        updatedCourse = updatedCourse.addPrerequisiteCourse(prerequisiteId, input.createdBy);
                    }
                    catch (error) {
                        warnings.push(`Could not add prerequisite ${prerequisiteId}: ${error instanceof Error ? error.message : "Unknown error"}`);
                    }
                }
            }
            if (input.prerequisites?.requiredSkills &&
                input.prerequisites.requiredSkills.length > 0) {
                updatedCourse = updatedCourse.updateRequiredSkills(input.prerequisites.requiredSkills, input.createdBy);
            }
            // Save to repository
            await this.courseRepository.save(updatedCourse);
            // Send notifications
            if (input.organizerId) {
                try {
                    await this.notificationService.notifyCourseCreated(updatedCourse, [
                        input.organizerId,
                    ]);
                }
                catch (error) {
                    warnings.push("Course created but notification failed");
                }
            }
            return {
                success: true,
                courseId: updatedCourse.getId(),
                message: "Course created successfully",
                warnings: warnings.length > 0 ? warnings : undefined,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to create course",
            };
        }
    }
    /**
     * Update an existing course
     */
    async updateCourse(input) {
        try {
            const warnings = [];
            // Find existing course
            const course = await this.courseRepository.findById(input.courseId);
            if (!course) {
                return {
                    success: false,
                    message: "Course not found",
                };
            }
            // Check if course can be updated
            if (course.getStatus() === "IN_PROGRESS" ||
                course.getStatus() === "COMPLETED") {
                return {
                    success: false,
                    message: "Cannot update course that is in progress or completed",
                };
            }
            let updatedCourse = course;
            // Update basic information
            if (input.name !== undefined ||
                input.description !== undefined ||
                input.duration !== undefined) {
                updatedCourse = updatedCourse.updateBasicInfo(input.name, input.description, input.duration, input.updatedBy);
                // Validate new name if provided
                if (input.name !== undefined) {
                    const nameValidation = await this.validationService.validateCourseName(input.name, course.getCategoryId());
                    if (!nameValidation.isValid) {
                        warnings.push(nameValidation.message || "Course name validation warning");
                    }
                }
            }
            // Update dates
            if (input.startDate !== undefined || input.endDate !== undefined) {
                try {
                    updatedCourse = updatedCourse.updateDates(input.startDate, input.endDate, input.updatedBy);
                    // Validate new schedule
                    const scheduleValidation = await this.validationService.validateScheduling(updatedCourse.getStartDate(), updatedCourse.getEndDate(), updatedCourse.getOrganizerId());
                    if (!scheduleValidation.isValid) {
                        warnings.push("Schedule validation warning - conflicts may exist");
                    }
                }
                catch (error) {
                    return {
                        success: false,
                        message: error instanceof Error ? error.message : "Invalid date update",
                    };
                }
            }
            // Update capacity
            if (input.maxCapacity !== undefined) {
                try {
                    updatedCourse = updatedCourse.updateCapacity(input.maxCapacity, input.updatedBy);
                }
                catch (error) {
                    return {
                        success: false,
                        message: error instanceof Error
                            ? error.message
                            : "Invalid capacity update",
                    };
                }
            }
            // Update pricing
            if (input.isFree !== undefined || input.price !== undefined) {
                try {
                    updatedCourse = updatedCourse.updatePricing(input.isFree ?? updatedCourse.isFree(), input.price, input.updatedBy);
                }
                catch (error) {
                    return {
                        success: false,
                        message: error instanceof Error ? error.message : "Invalid pricing update",
                    };
                }
            }
            // Update approval criteria
            if (input.attendancePercentageForApproval !== undefined ||
                input.minimumGradeForApproval !== undefined) {
                try {
                    updatedCourse = updatedCourse.updateApprovalCriteria(input.attendancePercentageForApproval, input.minimumGradeForApproval, input.updatedBy);
                }
                catch (error) {
                    return {
                        success: false,
                        message: error instanceof Error
                            ? error.message
                            : "Invalid approval criteria update",
                    };
                }
            }
            // Update requirements
            if (input.requiresDocumentVerification !== undefined ||
                input.requiresMotivationLetter !== undefined) {
                updatedCourse = updatedCourse.updateRequirements(input.requiresDocumentVerification, input.requiresMotivationLetter, input.updatedBy);
            }
            // Save updated course
            await this.courseRepository.update(updatedCourse);
            // Send notification about changes
            try {
                const changes = this.buildChangesList(course, updatedCourse);
                await this.notificationService.notifyCourseUpdated(updatedCourse, changes, [updatedCourse.getOrganizerId()]);
            }
            catch (error) {
                warnings.push("Course updated but notification failed");
            }
            return {
                success: true,
                message: "Course updated successfully",
                warnings: warnings.length > 0 ? warnings : undefined,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to update course",
            };
        }
    }
    /**
     * Delete/Cancel a course
     */
    async deleteCourse(courseId, reason, deletedBy) {
        try {
            // Find course
            const course = await this.courseRepository.findById(courseId);
            if (!course) {
                return {
                    success: false,
                    message: "Course not found",
                };
            }
            // Check if course can be cancelled
            if (course.getStatus() === "COMPLETED" ||
                course.getStatus() === "ARCHIVED") {
                return {
                    success: false,
                    message: "Cannot cancel completed or archived course",
                };
            }
            // Get enrollments before cancelling
            const enrollments = await this.enrollmentService.getEnrollments(courseId);
            const enrolledUserIds = enrollments.map((enrollment) => enrollment.userId || enrollment.user_id);
            // Cancel course
            const cancelledCourse = course.cancel(reason, deletedBy);
            // Update in repository
            await this.courseRepository.update(cancelledCourse);
            // Notify affected users
            if (enrolledUserIds.length > 0) {
                try {
                    await this.notificationService.notifyCourseCancelled(cancelledCourse, reason, enrolledUserIds);
                }
                catch (error) {
                    // Continue even if notification fails
                }
            }
            return {
                success: true,
                message: "Course cancelled successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to cancel course",
            };
        }
    }
    /**
     * Get course by ID
     */
    async getCourse(courseId) {
        try {
            const course = await this.courseRepository.findById(courseId);
            if (!course) {
                return {
                    success: false,
                    message: "Course not found",
                };
            }
            return {
                success: true,
                course,
                message: "Course retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to retrieve course",
            };
        }
    }
    /**
     * Get courses with filters
     */
    async getCourses(filters) {
        try {
            const courseFilters = {
                categoryId: filters?.categoryId,
                organizerId: filters?.organizerId,
                audienceType: filters?.audienceType,
                isFree: filters?.isFree,
                startDateFrom: filters?.startDateFrom,
                startDateTo: filters?.startDateTo,
                hasAvailableSpots: filters?.hasAvailableSpots,
            };
            const courses = await this.courseRepository.findAll(courseFilters);
            // Apply additional filters
            let filteredCourses = courses;
            if (filters?.status && filters.status.length > 0) {
                filteredCourses = filteredCourses.filter((course) => filters.status.includes(course.getStatus()));
            }
            if (filters?.careerIds && filters.careerIds.length > 0) {
                filteredCourses = filteredCourses.filter((course) => course
                    .getAssociatedCareers()
                    .some((careerId) => filters.careerIds.includes(careerId)));
            }
            // Apply pagination
            const page = filters?.page || 1;
            const limit = filters?.limit || 20;
            const startIndex = (page - 1) * limit;
            const paginatedCourses = filteredCourses.slice(startIndex, startIndex + limit);
            return {
                success: true,
                courses: paginatedCourses,
                totalCount: filteredCourses.length,
                message: "Courses retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to retrieve courses",
            };
        }
    }
    /**
     * Publish a course (make it active for enrollment)
     */
    async publishCourse(courseId, publishedBy) {
        try {
            const course = await this.courseRepository.findById(courseId);
            if (!course) {
                return {
                    success: false,
                    message: "Course not found",
                };
            }
            // Publish course
            const publishedCourse = course.publish(publishedBy);
            // Update in repository
            await this.courseRepository.update(publishedCourse);
            // Notify about course being available
            try {
                await this.notificationService.notifyCoursePublished(publishedCourse, [
                    publishedCourse.getOrganizerId(),
                ]);
                if (publishedCourse.getAudienceType() !== "PUBLICO_GENERAL") {
                    await this.notificationService.notifyEnrollmentOpened(publishedCourse, [] // Will be handled by notification service based on audience type
                    );
                }
            }
            catch (error) {
                // Continue even if notification fails
            }
            return {
                success: true,
                message: "Course published successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to publish course",
            };
        }
    }
    /**
     * Start a course (transition to in-progress)
     */
    async startCourse(courseId, startedBy) {
        try {
            const course = await this.courseRepository.findById(courseId);
            if (!course) {
                return {
                    success: false,
                    message: "Course not found",
                };
            }
            // Start course
            const startedCourse = course.start(startedBy);
            // Update in repository
            await this.courseRepository.update(startedCourse);
            return {
                success: true,
                message: "Course started successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to start course",
            };
        }
    }
    /**
     * Complete a course
     */
    async completeCourse(courseId, completedBy) {
        try {
            const course = await this.courseRepository.findById(courseId);
            if (!course) {
                return {
                    success: false,
                    message: "Course not found",
                };
            }
            // Complete course
            const completedCourse = course.complete(completedBy);
            // Update in repository
            await this.courseRepository.update(completedCourse);
            return {
                success: true,
                message: "Course completed successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to complete course",
            };
        }
    }
    /**
     * Check if user is eligible for course enrollment
     */
    async checkEnrollmentEligibility(courseId, userId) {
        try {
            const course = await this.courseRepository.findById(courseId);
            if (!course) {
                return {
                    eligible: false,
                    reasons: ["Course not found"],
                };
            }
            const reasons = [];
            // Check if course is available for enrollment
            if (!course.isInEnrollmentPeriod()) {
                reasons.push("Course enrollment period has ended or not yet started");
            }
            // Check capacity
            if (!course.hasAvailableSpots()) {
                reasons.push("Course is at maximum capacity");
            }
            // Check user exists
            const userExists = await this.userService.validateUserExists(userId);
            if (!userExists) {
                reasons.push("User not found");
                return { eligible: false, reasons };
            }
            // Check if already enrolled
            const alreadyEnrolled = await this.enrollmentService.checkUserEnrollment(courseId, userId);
            if (alreadyEnrolled) {
                reasons.push("User is already enrolled in this course");
            }
            // Check career eligibility
            const userCareers = await this.userService.getUserCareers(userId);
            if (!course.isEligibleForCareer(userCareers)) {
                reasons.push("User's career is not eligible for this course");
            }
            // Check prerequisites
            const userCompletedCourses = await this.userService.getUserCompletedCourses(userId);
            const userSkills = await this.userService.getUserSkills(userId);
            const prerequisiteCheck = course.meetsPrerequisites(userCompletedCourses, userSkills);
            if (!prerequisiteCheck.meets) {
                if (prerequisiteCheck.missing.courses.length > 0) {
                    reasons.push(`Missing required courses: ${prerequisiteCheck.missing.courses.join(", ")}`);
                }
                if (prerequisiteCheck.missing.skills.length > 0) {
                    reasons.push(`Missing required skills: ${prerequisiteCheck.missing.skills.join(", ")}`);
                }
            }
            return {
                eligible: reasons.length === 0,
                reasons,
                course,
            };
        }
        catch (error) {
            return {
                eligible: false,
                reasons: [
                    error instanceof Error
                        ? error.message
                        : "Failed to check eligibility",
                ],
            };
        }
    }
    /**
     * Get course statistics
     */
    async getCourseStatistics(courseId) {
        try {
            const statistics = await this.courseRepository.getCourseStatistics(courseId);
            return {
                success: true,
                statistics,
                message: "Statistics retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Failed to retrieve statistics",
            };
        }
    }
    /**
     * Find courses by organizer
     */
    async getCoursesByOrganizer(organizerId) {
        try {
            const courses = await this.courseRepository.findByOrganizer(organizerId);
            return {
                success: true,
                courses,
                message: "Courses retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to retrieve courses",
            };
        }
    }
    /**
     * Get upcoming courses
     */
    async getUpcomingCourses(days) {
        try {
            const courses = await this.courseRepository.findUpcoming(days);
            return {
                success: true,
                courses,
                message: "Upcoming courses retrieved successfully",
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Failed to retrieve upcoming courses",
            };
        }
    }
    /**
     * Private helper methods
     */
    buildChangesList(originalCourse, updatedCourse) {
        const changes = [];
        if (originalCourse.getName() !== updatedCourse.getName()) {
            changes.push(`Name changed from "${originalCourse.getName()}" to "${updatedCourse.getName()}"`);
        }
        if (originalCourse.getDescription() !== updatedCourse.getDescription()) {
            changes.push("Description updated");
        }
        if (originalCourse.getDuration() !== updatedCourse.getDuration()) {
            changes.push(`Duration changed from ${originalCourse.getDuration()} to ${updatedCourse.getDuration()} hours`);
        }
        if (originalCourse.getStartDate().getTime() !==
            updatedCourse.getStartDate().getTime()) {
            changes.push("Start date updated");
        }
        if (originalCourse.getEndDate().getTime() !==
            updatedCourse.getEndDate().getTime()) {
            changes.push("End date updated");
        }
        if (originalCourse.getMaxCapacity() !== updatedCourse.getMaxCapacity()) {
            changes.push(`Capacity changed from ${originalCourse.getMaxCapacity()} to ${updatedCourse.getMaxCapacity()}`);
        }
        if (originalCourse.isFree() !== updatedCourse.isFree()) {
            changes.push(`Pricing changed to ${updatedCourse.isFree() ? "free" : "paid"}`);
        }
        return changes;
    }
}
exports.CourseManagement = CourseManagement;
//# sourceMappingURL=CourseManagement.js.map