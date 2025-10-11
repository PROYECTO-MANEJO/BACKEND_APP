/**
 * Participation Use Cases - Index
 *
 * Exports all use cases for the Participation domain
 */

// Enrollment Management Use Case
import { EnrollmentManagement } from "./EnrollmentManagement";
import { ParticipationTracking } from "./ParticipationTracking";

export {
  EnrollmentManagement,
  type EnrollmentRepository as EnrollmentManagementRepository,
  type ActivityService as EnrollmentActivityService,
  type UserService as EnrollmentUserService,
  type NotificationService as EnrollmentNotificationService,
  type PaymentService,
  type EnrollmentManagementInput,
  type BulkEnrollmentInput,
  type ApprovalInput,
  type PaymentUpdateInput,
} from "./EnrollmentManagement";

// Participation Tracking Use Case
export {
  ParticipationTracking,
  type ParticipationRepository,
  type EnrollmentRepository as ParticipationEnrollmentRepository,
  type CertificateService,
  type NotificationService as ParticipationNotificationService,
  type AttendanceInput,
  type GradeInput,
  type AttendanceUpdateInput,
  type BulkAttendanceInput,
  type BulkGradeInput,
} from "./ParticipationTracking";

// Common interfaces for participation use cases
export interface ParticipationUseCaseResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface ParticipationReportFilters {
  activityType?: "EVENT" | "COURSE";
  startDate?: Date;
  endDate?: Date;
  status?: string;
  participantId?: string;
  activityId?: string;
  instructorId?: string;
  location?: string;
  includeWithdrawn?: boolean;
  certificatesOnly?: boolean;
}

export interface ParticipationDashboardData {
  summary: {
    totalEnrollments: number;
    activeParticipations: number;
    completedParticipations: number;
    certificatesGenerated: number;
    averageCompletionRate: number;
  };

  recentActivity: Array<{
    type: "ENROLLMENT" | "ATTENDANCE" | "GRADE" | "CERTIFICATE" | "WITHDRAWAL";
    participantName: string;
    activityName: string;
    timestamp: Date;
    details: string;
  }>;

  upcomingDeadlines: Array<{
    activityName: string;
    participantCount: number;
    deadline: Date;
    type: "START" | "END" | "EVALUATION";
  }>;

  performanceMetrics: {
    attendanceByMonth: Array<{
      month: string;
      averageAttendance: number;
    }>;

    gradeDistribution: Array<{
      gradeRange: string;
      count: number;
      percentage: number;
    }>;

    completionTrends: Array<{
      month: string;
      enrolled: number;
      completed: number;
      completionRate: number;
    }>;
  };

  alerts: Array<{
    type:
      | "LOW_ATTENDANCE"
      | "MISSING_GRADES"
      | "PENDING_CERTIFICATES"
      | "CAPACITY_FULL";
    message: string;
    count: number;
    priority: "HIGH" | "MEDIUM" | "LOW";
    activityId?: string;
  }>;
}

// Factory functions for creating use case instances
export interface ParticipationUseCaseDependencies {
  enrollmentRepository: any;
  participationRepository: any;
  activityService: any;
  userService: any;
  certificateService: any;
  notificationService: any;
  paymentService: any;
}

export class ParticipationUseCaseFactory {
  constructor(private dependencies: ParticipationUseCaseDependencies) {}

  createEnrollmentManagement() {
    return new EnrollmentManagement(
      this.dependencies.enrollmentRepository,
      this.dependencies.activityService,
      this.dependencies.userService,
      this.dependencies.notificationService,
      this.dependencies.paymentService
    );
  }

  createParticipationTracking() {
    return new ParticipationTracking(
      this.dependencies.participationRepository,
      this.dependencies.enrollmentRepository,
      this.dependencies.certificateService,
      this.dependencies.notificationService
    );
  }
}

// Validation utilities
export class ParticipationValidation {
  static validateAttendanceInput(input: any): string[] {
    const errors: string[] = [];

    if (!input.participationId?.trim()) {
      errors.push("Participation ID is required");
    }

    if (!input.sessionDate) {
      errors.push("Session date is required");
    }

    if (input.sessionDate && input.sessionDate > new Date()) {
      errors.push("Session date cannot be in the future");
    }

    if (
      input.checkInTime &&
      input.checkOutTime &&
      input.checkInTime > input.checkOutTime
    ) {
      errors.push("Check-in time cannot be after check-out time");
    }

    return errors;
  }

  static validateGradeInput(input: any): string[] {
    const errors: string[] = [];

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

  static validateEnrollmentInput(input: any): string[] {
    const errors: string[] = [];

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

// Event types for domain events
export type ParticipationDomainEvent =
  | {
      type: "ENROLLMENT_CREATED";
      enrollmentId: string;
      participantId: string;
      activityId: string;
      timestamp: Date;
    }
  | {
      type: "ENROLLMENT_CONFIRMED";
      enrollmentId: string;
      participantId: string;
      activityId: string;
      timestamp: Date;
    }
  | {
      type: "ATTENDANCE_RECORDED";
      participationId: string;
      sessionDate: Date;
      present: boolean;
      timestamp: Date;
    }
  | {
      type: "GRADE_UPDATED";
      participationId: string;
      finalGrade: number;
      evaluatedBy: string;
      timestamp: Date;
    }
  | {
      type: "CERTIFICATE_GENERATED";
      participationId: string;
      certificateId: string;
      timestamp: Date;
    }
  | {
      type: "PARTICIPATION_COMPLETED";
      participationId: string;
      participantId: string;
      activityId: string;
      timestamp: Date;
    }
  | {
      type: "PARTICIPANT_WITHDRAWN";
      participationId: string;
      reason: string;
      timestamp: Date;
    };

// Error types specific to participation domain
export class ParticipationError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = "ParticipationError";
  }
}

export class EnrollmentError extends ParticipationError {
  constructor(message: string, code: string, details?: any) {
    super(message, code, details);
    this.name = "EnrollmentError";
  }
}

export class AttendanceError extends ParticipationError {
  constructor(message: string, code: string, details?: any) {
    super(message, code, details);
    this.name = "AttendanceError";
  }
}

export class GradingError extends ParticipationError {
  constructor(message: string, code: string, details?: any) {
    super(message, code, details);
    this.name = "GradingError";
  }
}

export class CertificateError extends ParticipationError {
  constructor(message: string, code: string, details?: any) {
    super(message, code, details);
    this.name = "CertificateError";
  }
}
