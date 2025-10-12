// Exportar todos los controladores

export { BaseController } from "./BaseController";
export { UserController } from "./UserController";
export { AuthController } from "./AuthController";
export { CourseController } from "./CourseController";
export { EventController } from "./EventController";
export { CertificateController } from "./CertificateController";

// Exportar tipos de DTOs
export * from "../dto/UserDTO";
export * from "../dto/CourseDTO";
export type {
  CreateEventRequestDTO,
  UpdateEventRequestDTO,
  EventResponseDTO,
  EventListResponseDTO,
  EnrollEventRequestDTO,
  EventEnrollmentResponseDTO,
} from "../dto/EventDTO";
export * from "../dto/CertificateDTO";
