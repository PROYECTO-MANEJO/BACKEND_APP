/**
 * Admin Validator - Domain Layer
 *
 * ✅ SRP: Responsabilidad única - Validaciones de datos de administración
 * Separado de AdminService para cumplir Single Responsibility Principle
 */

export interface AdminValidationData {
  ced_usu?: string;
  nom_usu1?: string;
  nom_usu2?: string;
  ape_usu1?: string;
  ape_usu2?: string;
  email?: string;
  password?: string;
  rol?: string;
}

export class AdminValidator {
  /**
   * ✅ SRP: Solo validación de datos de administrador
   */
  public static validate(data: AdminValidationData): void {
    // Validaciones básicas de administrador
    if (!data.ced_usu || data.ced_usu.length < 7) {
      throw new Error(
        "La cédula del administrador es requerida y debe tener al menos 7 caracteres"
      );
    }

    if (!data.nom_usu1 || data.nom_usu1.trim().length === 0) {
      throw new Error("El primer nombre es requerido");
    }

    if (!data.ape_usu1 || data.ape_usu1.trim().length === 0) {
      throw new Error("El primer apellido es requerido");
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error("Email válido es requerido");
    }

    if (data.rol && !["ADMIN", "SUPER_ADMIN"].includes(data.rol)) {
      throw new Error("Rol de administrador inválido");
    }
  }

  /**
   * ✅ SRP: Solo validación de email
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * ✅ SRP: Solo validación de actualización
   */
  public static validateUpdate(data: Partial<AdminValidationData>): void {
    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error("Formato de email inválido");
    }

    if (data.nom_usu1 && data.nom_usu1.trim().length === 0) {
      throw new Error("El nombre no puede estar vacío");
    }

    if (data.ape_usu1 && data.ape_usu1.trim().length === 0) {
      throw new Error("El apellido no puede estar vacío");
    }
  }
}
