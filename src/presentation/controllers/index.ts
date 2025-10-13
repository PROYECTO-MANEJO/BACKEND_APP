// Exportar todos los controladores

export { BaseController } from "./BaseController";
export { UserController } from "./UserController";
export { AuthController } from "./AuthController";
export { CourseController } from "./CourseController";
export { EventController } from "./EventController";
export { CertificateController } from "./CertificateController";
export { AdminController } from "./AdminController";

// Exportar tipos de DTOs desde nueva estructura
export * from "../dto/user/UserDTO";
export * from "../dto/CourseDTO";

export * from "../dto/admin/CertificateDTO";
