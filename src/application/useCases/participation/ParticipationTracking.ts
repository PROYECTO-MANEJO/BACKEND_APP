/**
 * Participation Tracking Use Case - Application Layer
 *
 * Handles attendance tracking, grade management, and participation evaluation
 */

import { 
  Participation, 
  ParticipationType, 
  ParticipationStatus,
  AttendanceRecord,
  ParticipationFilters,
  CertificateEligibilityCheck,
  ParticipationAnalytics
} from '../../../domain/entities/participation';

export interface ParticipationRepository {
  // Basic CRUD operations
  save(participation: Participation): Promise<void>;
  findById(id: string): Promise<Participation | null>;
  findAll(filters?: ParticipationFilters): Promise<Participation[]>;
  update(participation: Participation): Promise<void>;
  delete(id: string): Promise<void>;
  
  // Participation-specific queries
  findByParticipantId(participantId: string): Promise<Participation[]>;
  findByActivityId(activityId: string): Promise<Participation[]>;
  findByEnrollmentId(enrollmentId: string): Promise<Participation | null>;
  findByStatus(status: ParticipationStatus): Promise<Participation[]>;
  findPendingEvaluations(): Promise<Participation[]>;
  findEligibleForCertificates(): Promise<Participation[]>;
  
  // Analytics queries
  getParticipationAnalytics(participantId: string): Promise<ParticipationAnalytics>;
  getActivityStatistics(activityId: string): Promise<{
    totalParticipants: number;
    averageAttendance: number;
    averageGrade?: number;
    completionRate: number;
  }>;
  getAttendanceByDateRange(activityId: string, startDate: Date, endDate: Date): Promise<AttendanceRecord[]>;
}

export interface EnrollmentRepository {
  findById(id: string): Promise<any>;
  findByActivityId(activityId: string): Promise<any[]>;
}

export interface CertificateService {
  generateCertificate(participationId: string, participantName: string, activityName: string, completionDate: Date): Promise<{
    success: boolean;
    certificateId?: string;
    certificateUrl?: string;
    errorMessage?: string;
  }>;
}

export interface NotificationService {
  sendGradeNotification(participation: Participation): Promise<void>;
  sendAttendanceAlert(participation: Participation): Promise<void>;
  sendCertificateNotification(participation: Participation, certificateUrl: string): Promise<void>;
  sendCompletionNotification(participation: Participation): Promise<void>;
}

export interface AttendanceInput {
  participationId: string;
  sessionDate: Date;
  present: boolean;
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
  recordedBy?: string;
}

export interface GradeInput {
  participationId: string;
  finalGrade: number;
  evaluatedBy: string;
  comments?: string;
}

export interface AttendanceUpdateInput {
  participationId: string;
  attendancePercentage: number;
  evaluatedBy: string;
}

export interface BulkAttendanceInput {
  activityId: string;
  sessionDate: Date;
  attendance: Array<{
    participationId: string;
    present: boolean;
    checkInTime?: Date;
    checkOutTime?: Date;
    notes?: string;
  }>;
  recordedBy: string;
}

export interface BulkGradeInput {
  activityId: string;
  grades: Array<{
    participationId: string;
    finalGrade: number;
    comments?: string;
  }>;
  evaluatedBy: string;
}

export class ParticipationTracking {
  constructor(
    private participationRepository: ParticipationRepository,
    private enrollmentRepository: EnrollmentRepository,
    private certificateService: CertificateService,
    private notificationService: NotificationService
  ) {}

  /**
   * Record attendance for a single session
   */
  async recordAttendance(input: AttendanceInput): Promise<{
    success: boolean;
    message: string;
    updatedParticipation?: any;
  }> {
    try {
      const participation = await this.participationRepository.findById(input.participationId);
      if (!participation) {
        return {
          success: false,
          message: "Participation not found"
        };
      }

      if (!participation.canBeEvaluated()) {
        return {
          success: false,
          message: "Participation cannot be evaluated in current status"
        };
      }

      const updatedParticipation = participation.recordAttendance(
        input.sessionDate,
        input.present,
        input.checkInTime,
        input.checkOutTime,
        input.notes,
        input.recordedBy
      );

      await this.participationRepository.update(updatedParticipation);

      // Check if attendance is low and send alert
      const attendancePercentage = updatedParticipation.getAttendancePercentage();
      const minimumRequired = updatedParticipation.getMinimumAttendancePercentage();
      
      if (attendancePercentage < minimumRequired && attendancePercentage > 0) {
        await this.notificationService.sendAttendanceAlert(updatedParticipation);
      }

      return {
        success: true,
        message: "Attendance recorded successfully",
        updatedParticipation: updatedParticipation.getParticipationSummary()
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to record attendance: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Record attendance for multiple participants in a session
   */
  async recordBulkAttendance(input: BulkAttendanceInput): Promise<{
    success: boolean;
    message: string;
    results: Array<{
      participationId: string;
      success: boolean;
      message: string;
    }>;
  }> {
    const results: Array<{
      participationId: string;
      success: boolean;
      message: string;
    }> = [];

    let successCount = 0;

    for (const attendanceRecord of input.attendance) {
      try {
        const result = await this.recordAttendance({
          participationId: attendanceRecord.participationId,
          sessionDate: input.sessionDate,
          present: attendanceRecord.present,
          checkInTime: attendanceRecord.checkInTime,
          checkOutTime: attendanceRecord.checkOutTime,
          notes: attendanceRecord.notes,
          recordedBy: input.recordedBy
        });

        results.push({
          participationId: attendanceRecord.participationId,
          success: result.success,
          message: result.message
        });

        if (result.success) {
          successCount++;
        }

      } catch (error) {
        results.push({
          participationId: attendanceRecord.participationId,
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      success: successCount > 0,
      message: `Processed ${input.attendance.length} attendance records. ${successCount} successful, ${input.attendance.length - successCount} failed.`,
      results
    };
  }

  /**
   * Update final grade for a course participation
   */
  async updateGrade(input: GradeInput): Promise<{
    success: boolean;
    message: string;
    updatedParticipation?: any;
  }> {
    try {
      const participation = await this.participationRepository.findById(input.participationId);
      if (!participation) {
        return {
          success: false,
          message: "Participation not found"
        };
      }

      if (participation.getActivityType() !== 'COURSE') {
        return {
          success: false,
          message: "Grades can only be assigned to course participations"
        };
      }

      if (!participation.canBeEvaluated()) {
        return {
          success: false,
          message: "Participation cannot be evaluated in current status"
        };
      }

      const updatedParticipation = participation.updateGrade(
        input.finalGrade,
        input.evaluatedBy,
        input.comments
      );

      await this.participationRepository.update(updatedParticipation);

      // Send grade notification
      await this.notificationService.sendGradeNotification(updatedParticipation);

      // Check if participation is now completed and eligible for certificate
      if (updatedParticipation.isCompleted() && updatedParticipation.canGenerateCertificate()) {
        await this.generateCertificate(updatedParticipation.getId());
      }

      return {
        success: true,
        message: "Grade updated successfully",
        updatedParticipation: updatedParticipation.getParticipationSummary()
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to update grade: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Update grades for multiple course participations
   */
  async updateBulkGrades(input: BulkGradeInput): Promise<{
    success: boolean;
    message: string;
    results: Array<{
      participationId: string;
      success: boolean;
      message: string;
    }>;
  }> {
    const results: Array<{
      participationId: string;
      success: boolean;
      message: string;
    }> = [];

    let successCount = 0;

    for (const gradeRecord of input.grades) {
      try {
        const result = await this.updateGrade({
          participationId: gradeRecord.participationId,
          finalGrade: gradeRecord.finalGrade,
          evaluatedBy: input.evaluatedBy,
          comments: gradeRecord.comments
        });

        results.push({
          participationId: gradeRecord.participationId,
          success: result.success,
          message: result.message
        });

        if (result.success) {
          successCount++;
        }

      } catch (error) {
        results.push({
          participationId: gradeRecord.participationId,
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      success: successCount > 0,
      message: `Processed ${input.grades.length} grade records. ${successCount} successful, ${input.grades.length - successCount} failed.`,
      results
    };
  }

  /**
   * Update attendance percentage directly (for events or manual corrections)
   */
  async updateAttendancePercentage(input: AttendanceUpdateInput): Promise<{
    success: boolean;
    message: string;
    updatedParticipation?: any;
  }> {
    try {
      const participation = await this.participationRepository.findById(input.participationId);
      if (!participation) {
        return {
          success: false,
          message: "Participation not found"
        };
      }

      if (!participation.canBeEvaluated()) {
        return {
          success: false,
          message: "Participation cannot be evaluated in current status"
        };
      }

      const updatedParticipation = participation.updateAttendancePercentage(
        input.attendancePercentage,
        input.evaluatedBy
      );

      await this.participationRepository.update(updatedParticipation);

      // Check if participation is now completed and eligible for certificate
      if (updatedParticipation.isCompleted() && updatedParticipation.canGenerateCertificate()) {
        await this.generateCertificate(updatedParticipation.getId());
      }

      return {
        success: true,
        message: "Attendance percentage updated successfully",
        updatedParticipation: updatedParticipation.getParticipationSummary()
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to update attendance percentage: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Generate certificate for eligible participation
   */
  async generateCertificate(participationId: string): Promise<{
    success: boolean;
    message: string;
    certificateId?: string;
    certificateUrl?: string;
  }> {
    try {
      const participation = await this.participationRepository.findById(participationId);
      if (!participation) {
        return {
          success: false,
          message: "Participation not found"
        };
      }

      if (!participation.canGenerateCertificate()) {
        return {
          success: false,
          message: "Participation is not eligible for certificate generation"
        };
      }

      const certificateResult = await this.certificateService.generateCertificate(
        participation.getId(),
        participation.getParticipantName(),
        participation.getActivityName(),
        new Date()
      );

      if (!certificateResult.success) {
        return {
          success: false,
          message: certificateResult.errorMessage || "Failed to generate certificate"
        };
      }

      const updatedParticipation = participation.generateCertificate(certificateResult.certificateId!);
      await this.participationRepository.update(updatedParticipation);

      // Send certificate notification
      if (certificateResult.certificateUrl) {
        await this.notificationService.sendCertificateNotification(
          updatedParticipation,
          certificateResult.certificateUrl
        );
      }

      return {
        success: true,
        message: "Certificate generated successfully",
        certificateId: certificateResult.certificateId,
        certificateUrl: certificateResult.certificateUrl
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to generate certificate: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Check certificate eligibility for a participation
   */
  async checkCertificateEligibility(participationId: string): Promise<{
    success: boolean;
    eligibility?: CertificateEligibilityCheck;
    message: string;
  }> {
    try {
      const participation = await this.participationRepository.findById(participationId);
      if (!participation) {
        return {
          success: false,
          message: "Participation not found"
        };
      }

      const isEligible = participation.isEligibleForCertificate();
      const grading = participation.getGrading();
      const minimumAttendance = participation.getMinimumAttendancePercentage();
      const minimumGrade = participation.getMinimumGradeRequired();

      const eligibility: CertificateEligibilityCheck = {
        participationId: participation.getId(),
        isEligible,
        requirements: {
          minimumAttendance: {
            required: minimumAttendance,
            actual: grading.attendancePercentage,
            met: grading.attendancePercentage >= minimumAttendance
          },
          minimumGrade: minimumGrade !== undefined ? {
            required: minimumGrade,
            actual: grading.finalGrade || 0,
            met: (grading.finalGrade || 0) >= minimumGrade
          } : undefined,
          paymentApproved: true, // Would check enrollment payment status
          activityCompleted: participation.isCompleted()
        },
        eligibilityDate: isEligible ? new Date() : undefined,
        certificateGenerated: grading.certificateGenerated
      };

      return {
        success: true,
        eligibility,
        message: "Certificate eligibility checked successfully"
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to check certificate eligibility: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Withdraw a participant from an activity
   */
  async withdrawParticipant(
    participationId: string,
    reason: string,
    withdrawnBy?: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const participation = await this.participationRepository.findById(participationId);
      if (!participation) {
        return {
          success: false,
          message: "Participation not found"
        };
      }

      const withdrawnParticipation = participation.withdraw(reason, withdrawnBy);
      await this.participationRepository.update(withdrawnParticipation);

      return {
        success: true,
        message: "Participant withdrawn successfully"
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to withdraw participant: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get participation details
   */
  async getParticipation(participationId: string): Promise<{
    success: boolean;
    participation?: any;
    message: string;
  }> {
    try {
      const participation = await this.participationRepository.findById(participationId);
      if (!participation) {
        return {
          success: false,
          message: "Participation not found"
        };
      }

      return {
        success: true,
        participation: participation.getDetailedReport(),
        message: "Participation retrieved successfully"
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve participation: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get participations by filters
   */
  async getParticipations(filters?: ParticipationFilters): Promise<{
    success: boolean;
    participations?: any[];
    message: string;
  }> {
    try {
      const participations = await this.participationRepository.findAll(filters);
      const participationSummaries = participations.map(participation => 
        participation.getParticipationSummary()
      );

      return {
        success: true,
        participations: participationSummaries,
        message: `Retrieved ${participations.length} participations`
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve participations: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get participant analytics
   */
  async getParticipantAnalytics(participantId: string): Promise<{
    success: boolean;
    analytics?: ParticipationAnalytics;
    message: string;
  }> {
    try {
      const analytics = await this.participationRepository.getParticipationAnalytics(participantId);

      return {
        success: true,
        analytics,
        message: "Participant analytics retrieved successfully"
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve participant analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get activity statistics
   */
  async getActivityStatistics(activityId: string): Promise<{
    success: boolean;
    statistics?: any;
    message: string;
  }> {
    try {
      const statistics = await this.participationRepository.getActivityStatistics(activityId);

      return {
        success: true,
        statistics,
        message: "Activity statistics retrieved successfully"
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve activity statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Process pending evaluations (batch job)
   */
  async processPendingEvaluations(): Promise<{
    success: boolean;
    processed: number;
    message: string;
  }> {
    try {
      const pendingParticipations = await this.participationRepository.findPendingEvaluations();
      let processedCount = 0;

      for (const participation of pendingParticipations) {
        try {
          // Auto-evaluate based on attendance if minimum requirements are met
          if (participation.getAttendancePercentage() >= participation.getMinimumAttendancePercentage()) {
            let updatedParticipation: Participation;
            
            if (participation.getActivityType() === 'EVENT') {
              // For events, just update attendance percentage to complete
              updatedParticipation = participation.updateAttendancePercentage(
                participation.getAttendancePercentage(),
                'system'
              );
            } else {
              // For courses, only auto-complete if there's a grade
              const grading = participation.getGrading();
              if (grading.finalGrade !== undefined && 
                  grading.finalGrade >= (participation.getMinimumGradeRequired() || 0)) {
                updatedParticipation = participation.updateGrade(
                  grading.finalGrade,
                  'system',
                  'Auto-evaluated based on requirements'
                );
              } else {
                continue; // Skip if no grade or grade insufficient
              }
            }

            await this.participationRepository.update(updatedParticipation);
            
            // Generate certificate if eligible
            if (updatedParticipation.canGenerateCertificate()) {
              await this.generateCertificate(updatedParticipation.getId());
            }
            
            processedCount++;
          }
        } catch (error) {
          // Log error but continue processing others
          console.error(`Failed to process participation ${participation.getId()}:`, error);
        }
      }

      return {
        success: true,
        processed: processedCount,
        message: `Processed ${processedCount} pending evaluations out of ${pendingParticipations.length}`
      };

    } catch (error) {
      return {
        success: false,
        processed: 0,
        message: `Failed to process pending evaluations: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Generate certificates for all eligible participations (batch job)
   */
  async generateEligibleCertificates(): Promise<{
    success: boolean;
    generated: number;
    message: string;
  }> {
    try {
      const eligibleParticipations = await this.participationRepository.findEligibleForCertificates();
      let generatedCount = 0;

      for (const participation of eligibleParticipations) {
        try {
          const result = await this.generateCertificate(participation.getId());
          if (result.success) {
            generatedCount++;
          }
        } catch (error) {
          // Log error but continue processing others
          console.error(`Failed to generate certificate for participation ${participation.getId()}:`, error);
        }
      }

      return {
        success: true,
        generated: generatedCount,
        message: `Generated ${generatedCount} certificates out of ${eligibleParticipations.length} eligible participations`
      };

    } catch (error) {
      return {
        success: false,
        generated: 0,
        message: `Failed to generate eligible certificates: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}