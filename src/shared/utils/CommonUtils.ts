/**
 * Utilidades compartidas de la aplicación
 * SRP: Cada función tiene una responsabilidad específica
 */

import {
  ValidationResult,
  ValidationError,
} from "@shared/interfaces/BaseInterfaces";
import { VALIDATION_RULES } from "@shared/constants/AppConstants";

/**
 * Utilidades para validación
 */
export class ValidationUtils {
  /**
   * SRP: Solo valida emails
   */
  static validateEmail(email: string): ValidationError | null {
    if (!email) {
      return { field: "email", message: "Email is required" };
    }

    if (email.length < VALIDATION_RULES.EMAIL.MIN_LENGTH) {
      return {
        field: "email",
        message: `Email must be at least ${VALIDATION_RULES.EMAIL.MIN_LENGTH} characters`,
      };
    }

    if (email.length > VALIDATION_RULES.EMAIL.MAX_LENGTH) {
      return {
        field: "email",
        message: `Email must not exceed ${VALIDATION_RULES.EMAIL.MAX_LENGTH} characters`,
      };
    }

    if (!VALIDATION_RULES.EMAIL.REGEX.test(email)) {
      return { field: "email", message: "Invalid email format" };
    }

    return null;
  }

  /**
   * SRP: Solo valida passwords
   */
  static validatePassword(password: string): ValidationError | null {
    if (!password) {
      return { field: "password", message: "Password is required" };
    }

    if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
      return {
        field: "password",
        message: `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`,
      };
    }

    if (password.length > VALIDATION_RULES.PASSWORD.MAX_LENGTH) {
      return {
        field: "password",
        message: `Password must not exceed ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters`,
      };
    }

    if (
      VALIDATION_RULES.PASSWORD.REQUIRE_UPPERCASE &&
      !/[A-Z]/.test(password)
    ) {
      return {
        field: "password",
        message: "Password must contain at least one uppercase letter",
      };
    }

    if (
      VALIDATION_RULES.PASSWORD.REQUIRE_LOWERCASE &&
      !/[a-z]/.test(password)
    ) {
      return {
        field: "password",
        message: "Password must contain at least one lowercase letter",
      };
    }

    if (VALIDATION_RULES.PASSWORD.REQUIRE_NUMBER && !/\d/.test(password)) {
      return {
        field: "password",
        message: "Password must contain at least one number",
      };
    }

    return null;
  }

  /**
   * SRP: Solo valida cédulas ecuatorianas
   */
  static validateCedula(cedula: string): ValidationError | null {
    if (!cedula) {
      return { field: "cedula", message: "Cedula is required" };
    }

    if (!VALIDATION_RULES.CEDULA.REGEX.test(cedula)) {
      return { field: "cedula", message: "Cedula must be exactly 10 digits" };
    }

    // Validación específica del algoritmo de cédula ecuatoriana
    const digits = cedula.split("").map(Number);
    const provinceCode = parseInt(cedula.substring(0, 2));

    if (provinceCode < 1 || provinceCode > 24) {
      return { field: "cedula", message: "Invalid province code in cedula" };
    }

    // Algoritmo de validación de cédula
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;

    for (let i = 0; i < coefficients.length; i++) {
      const digit = digits[i];
      const coefficient = coefficients[i];

      if (digit === undefined || coefficient === undefined) {
        return { field: "cedula", message: "Invalid cedula format" };
      }

      let value = digit * coefficient;
      if (value > 9) value -= 9;
      sum += value;
    }

    const verifier = sum % 10 === 0 ? 0 : 10 - (sum % 10);
    const lastDigit = digits[9];

    if (lastDigit === undefined || verifier !== lastDigit) {
      return { field: "cedula", message: "Invalid cedula checksum" };
    }

    return null;
  }

  /**
   * SRP: Solo combina resultados de validación
   */
  static combineValidationResults(
    ...errors: (ValidationError | null)[]
  ): ValidationResult {
    const validErrors = errors.filter(
      (error) => error !== null
    ) as ValidationError[];

    return {
      isValid: validErrors.length === 0,
      errors: validErrors,
    };
  }
}

/**
 * Utilidades para manejo de fechas
 */
export class DateUtils {
  /**
   * SRP: Solo formatea fechas para la base de datos
   */
  static toISOString(date: Date): string {
    return date.toISOString();
  }

  /**
   * SRP: Solo parsea fechas desde string
   */
  static fromISOString(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * SRP: Solo calcula diferencias de tiempo
   */
  static getDateDifferenceInDays(date1: Date, date2: Date): number {
    const timeDifference = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDifference / (1000 * 3600 * 24));
  }

  /**
   * SRP: Solo verifica si una fecha está en el pasado
   */
  static isInPast(date: Date): boolean {
    return date.getTime() < new Date().getTime();
  }
}

/**
 * Utilidades para strings
 */
export class StringUtils {
  /**
   * SRP: Solo limpia strings
   */
  static sanitize(str: string): string {
    return str.trim().replace(/\s+/g, " ");
  }

  /**
   * SRP: Solo capitaliza strings
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * SRP: Solo genera slugs
   */
  static toSlug(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remover caracteres especiales
      .replace(/\s+/g, "-") // Espacios a guiones
      .replace(/-+/g, "-") // Múltiples guiones a uno solo
      .trim();
  }
}
