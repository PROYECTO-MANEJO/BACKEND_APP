import { Certificate } from "../entities/Certificate";

export interface ICertificateRepository {
  // Métodos básicos para compatibilidad
  [key: string]: any;
}

export interface CertificateFilters {
  userId?: number;
  courseId?: string;
  eventId?: string;
  type?: string;
  status?: string;
}
