/**
 * Participation Domain Entities - Index
 *
 * Exports all entities and types for the Participation domain
 */

// Participation Entity
export {
  Participation,
  type ParticipationType,
  type ParticipationStatus,
  type ParticipationGrading,
  type AttendanceRecord,
  type ParticipationData
} from './Participation';

// Enrollment Entity
export {
  Enrollment,
  type EnrollmentType,
  type PaymentStatus,
  type EnrollmentStatus,
  type PaymentDetails,
  type EnrollmentData
} from './Enrollment';

// Common types for participation domain
export interface ParticipationFilters {
  activityType?: 'EVENT' | 'COURSE';
  participationStatus?: 'ENROLLED' | 'ATTENDING' | 'COMPLETED' | 'FAILED' | 'WITHDRAWN' | 'PENDING_EVALUATION';
  paymentStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  enrollmentStatus?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  participantId?: string;
  activityId?: string;
  enrollmentDateFrom?: Date;
  enrollmentDateTo?: Date;
  startDateFrom?: Date;
  startDateTo?: Date;
  isApproved?: boolean;
  hasCertificate?: boolean;
  minimumAttendance?: number;
  minimumGrade?: number;
  instructorId?: string;
  location?: string;
  isOnWaitingList?: boolean;
}

export interface ParticipationStatistics {
  totalEnrollments: number;
  confirmedEnrollments: number;
  completedParticipations: number;
  averageAttendance: number;
  averageGrade?: number;
  certificatesGenerated: number;
  enrollmentsByStatus: Record<'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED', number>;
  participationsByStatus: Record<'ENROLLED' | 'ATTENDING' | 'COMPLETED' | 'FAILED' | 'WITHDRAWN' | 'PENDING_EVALUATION', number>;
  paymentStatusBreakdown: Record<'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED', number>;
  monthlyEnrollments: Array<{
    month: string;
    count: number;
  }>;
  topActivities: Array<{
    activityId: string;
    activityName: string;
    enrollmentCount: number;
    completionRate: number;
  }>;
}

export interface ActivityCapacity {
  activityId: string;
  maxCapacity: number;
  currentEnrollments: number;
  confirmedEnrollments: number;
  waitingListCount: number;
  availableSpots: number;
  isFullyBooked: boolean;
  hasWaitingList: boolean;
}

export interface ParticipationAnalytics {
  participant: {
    id: string;
    name: string;
    email: string;
    cedula: string;
  };
  
  totalActivities: number;
  completedActivities: number;
  inProgressActivities: number;
  failedActivities: number;
  
  averageAttendance: number;
  averageGrade?: number;
  
  certificatesEarned: number;
  totalInvestment: number;
  
  enrollmentHistory: Array<{
    activityName: string;
    activityType: 'EVENT' | 'COURSE';
    enrollmentDate: Date;
    completionDate?: Date;
    status: 'ENROLLED' | 'ATTENDING' | 'COMPLETED' | 'FAILED' | 'WITHDRAWN' | 'PENDING_EVALUATION';
    grade?: number;
    attendance: number;
    certified: boolean;
  }>;
  
  performanceTrends: {
    attendanceByMonth: Array<{
      month: string;
      average: number;
    }>;
    gradesByActivity?: Array<{
      activityName: string;
      grade: number;
    }>;
  };
}

export interface BulkEnrollmentResult {
  successful: Array<{
    enrollmentId: string;
    participantEmail: string;
  }>;
  
  failed: Array<{
    participantEmail: string;
    reason: string;
    details?: any;
  }>;
  
  summary: {
    total: number;
    successful: number;
    failed: number;
    processingTime: number;
  };
}

export interface CertificateEligibilityCheck {
  participationId: string;
  isEligible: boolean;
  requirements: {
    minimumAttendance: {
      required: number;
      actual: number;
      met: boolean;
    };
    minimumGrade?: {
      required: number;
      actual: number;
      met: boolean;
    };
    paymentApproved: boolean;
    activityCompleted: boolean;
  };
  eligibilityDate?: Date;
  certificateGenerated: boolean;
}

export interface WaitingListManagement {
  activityId: string;
  waitingList: Array<{
    enrollmentId: string;
    participantName: string;
    participantEmail: string;
    position: number;
    priorityScore: number;
    enrollmentDate: Date;
    daysWaiting: number;
  }>;
  
  availableSpots: number;
  estimatedWaitTime?: number;
  
  operations: {
    promote: (enrollmentId: string) => void;
    reorder: (enrollmentId: string, newPosition: number) => void;
    notify: (position?: number) => void;
    cleanup: () => void;
  };
}