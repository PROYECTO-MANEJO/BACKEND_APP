/**
 * Auth Validator - Domain Layer
 *
 * ✅ SRP: Responsabilidad única - Validaciones de autenticación
 * Separado de AuthService para cumplir Single Responsibility Principle
 */

export interface LoginValidationData {
  email: string;
  password: string;
}

export interface RegisterValidationData {
  email: string;
  password: string;
  nombre: string;
  nombre2?: string;
  apellido: string;
  apellido2?: string;
  ced_usu: string;
  fec_nac_usu?: Date;
  carrera?: string;
}

export interface CreateAdminValidationData {
  ced_usu: string;
  nom_usu1: string;
  nom_usu2?: string;
  ape_usu1: string;
  ape_usu2?: string;
  cor_cue: string;
  pas_usu: string;
  fec_nac_usu?: Date;
  num_tel_usu?: string;
}

export class AuthValidator {
  /**
   * ✅ SRP: Solo validación de login
   */
  public static validateLogin(data: LoginValidationData): void {
    if (!data.email || data.email.trim().length === 0) {
      throw new Error("Email es requerido");
    }

    if (!this.isValidEmail(data.email)) {
      throw new Error("Formato de email inválido");
    }

    if (!data.password || data.password.length < 6) {
      throw new Error("Password debe tener al menos 6 caracteres");
    }
  }

  /**
   * ✅ SRP: Solo validación de registro
   */
  public static validateRegister(data: RegisterValidationData): void {
    if (!data.ced_usu || data.ced_usu.length < 7) {
      throw new Error("Cédula es requerida y debe tener al menos 7 caracteres");
    }

    if (!data.nombre || data.nombre.trim().length === 0) {
      throw new Error("Primer nombre es requerido");
    }

    if (!data.apellido || data.apellido.trim().length === 0) {
      throw new Error("Primer apellido es requerido");
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error("Email válido es requerido");
    }

    if (!data.password || !this.isValidPassword(data.password)) {
      throw new Error(
        "La contraseña debe tener al menos 6 caracteres, una mayúscula, un número y un carácter especial (@$!%*?&)"
      );
    }

    // Validar carrera para estudiantes UTA
    if (data.email.endsWith("@uta.edu.ec") && !data.carrera) {
      throw new Error("La carrera es requerida para estudiantes UTA");
    }
  }

  /**
   * ✅ SRP: Solo validación de creación de admin
   */
  public static validateCreateAdmin(data: CreateAdminValidationData): void {
    if (!data.ced_usu || data.ced_usu.trim().length === 0) {
      throw new Error("Cédula es requerida");
    }

    if (!data.nom_usu1 || data.nom_usu1.trim().length === 0) {
      throw new Error("Primer nombre es requerido");
    }

    if (!data.ape_usu1 || data.ape_usu1.trim().length === 0) {
      throw new Error("Primer apellido es requerido");
    }

    if (!data.cor_cue || !this.isValidEmail(data.cor_cue)) {
      throw new Error("Email válido es requerido");
    }

    if (!data.pas_usu || !this.isValidPassword(data.pas_usu)) {
      throw new Error(
        "La contraseña debe tener al menos 6 caracteres, una mayúscula, un número y un carácter especial (@$!%*?&)"
      );
    }

    if (
      data.fec_nac_usu &&
      (data.fec_nac_usu > new Date() || isNaN(data.fec_nac_usu.getTime()))
    ) {
      throw new Error("Fecha de nacimiento inválida");
    }
  }

  /**
   * ✅ SRP: Solo validación de fortaleza de contraseña
   */
  private static isValidPassword(password: string): boolean {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
  }

  /**
   * ✅ SRP: Solo validación de token
   */
  public static validateToken(token: string): void {
    if (!token || token.trim().length === 0) {
      throw new Error("Token es requerido");
    }

    if (!token.includes(".")) {
      throw new Error("Formato de token inválido");
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
   * ✅ SRP: Solo validación de password reset
   */
  public static validatePasswordReset(data: { email: string }): void {
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error("Email válido es requerido para resetear password");
    }
  }
}
