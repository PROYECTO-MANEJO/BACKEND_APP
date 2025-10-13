import { Enrollment } from "../entities/Enrollment";

export interface IEnrollmentRepository {
  // Métodos básicos para compatibilidad
  [key: string]: any;
}

export interface EnrollmentFilters {
  userId?: number;
  courseId?: string;
  eventId?: string;
  status?: string;
  paymentMethod?: string;
}
