"use strict";
/**
 * Participation Use Cases - Index
 *
 * Exports all use cases for the Participation domain
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateError = exports.GradingError = exports.AttendanceError = exports.EnrollmentError = exports.ParticipationError = exports.ParticipationValidation = exports.ParticipationUseCaseFactory = exports.ParticipationTracking = exports.EnrollmentManagement = void 0;
// Enrollment Management Use Case
const EnrollmentManagement_1 = require("./EnrollmentManagement");
const ParticipationTracking_1 = require("./ParticipationTracking");
var EnrollmentManagement_2 = require("./EnrollmentManagement");
Object.defineProperty(exports, "EnrollmentManagement", { enumerable: true, get: function () { return EnrollmentManagement_2.EnrollmentManagement; } });
// Participation Tracking Use Case
var ParticipationTracking_2 = require("./ParticipationTracking");
Object.defineProperty(exports, "ParticipationTracking", { enumerable: true, get: function () { return ParticipationTracking_2.ParticipationTracking; } });
class ParticipationUseCaseFactory {
    constructor(dependencies) {
        this.dependencies = dependencies;
    }
    createEnrollmentManagement() {
        return new EnrollmentManagement_1.EnrollmentManagement(this.dependencies.enrollmentRepository, this.dependencies.activityService, this.dependencies.userService, this.dependencies.notificationService, this.dependencies.paymentService);
    }
    createParticipationTracking() {
        return new ParticipationTracking_1.ParticipationTracking(this.dependencies.participationRepository, this.dependencies.enrollmentRepository, this.dependencies.certificateService, this.dependencies.notificationService);
    }
}
exports.ParticipationUseCaseFactory = ParticipationUseCaseFactory;
// Validation utilities
class ParticipationValidation {
    static validateAttendanceInput(input) {
        const errors = [];
        if (!input.participationId?.trim()) {
            errors.push("Participation ID is required");
        }
        if (!input.sessionDate) {
            errors.push("Session date is required");
        }
        if (input.sessionDate && input.sessionDate > new Date()) {
            errors.push("Session date cannot be in the future");
        }
        if (input.checkInTime &&
            input.checkOutTime &&
            input.checkInTime > input.checkOutTime) {
            errors.push("Check-in time cannot be after check-out time");
        }
        return errors;
    }
    static validateGradeInput(input) {
        const errors = [];
        if (!input.participationId?.trim()) {
            errors.push("Participation ID is required");
        }
        if (input.finalGrade < 0 || input.finalGrade > 10) {
            errors.push("Final grade must be between 0 and 10");
        }
        if (!input.evaluatedBy?.trim()) {
            errors.push("Evaluator is required");
        }
        return errors;
    }
    static validateEnrollmentInput(input) {
        const errors = [];
        if (!input.participantId?.trim()) {
            errors.push("Participant ID is required");
        }
        if (!input.activityId?.trim()) {
            errors.push("Activity ID is required");
        }
        if (input.priority !== undefined && input.priority < 0) {
            errors.push("Priority cannot be negative");
        }
        return errors;
    }
}
exports.ParticipationValidation = ParticipationValidation;
// Error types specific to participation domain
class ParticipationError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "ParticipationError";
    }
}
exports.ParticipationError = ParticipationError;
class EnrollmentError extends ParticipationError {
    constructor(message, code, details) {
        super(message, code, details);
        this.name = "EnrollmentError";
    }
}
exports.EnrollmentError = EnrollmentError;
class AttendanceError extends ParticipationError {
    constructor(message, code, details) {
        super(message, code, details);
        this.name = "AttendanceError";
    }
}
exports.AttendanceError = AttendanceError;
class GradingError extends ParticipationError {
    constructor(message, code, details) {
        super(message, code, details);
        this.name = "GradingError";
    }
}
exports.GradingError = GradingError;
class CertificateError extends ParticipationError {
    constructor(message, code, details) {
        super(message, code, details);
        this.name = "CertificateError";
    }
}
exports.CertificateError = CertificateError;
//# sourceMappingURL=index.js.map