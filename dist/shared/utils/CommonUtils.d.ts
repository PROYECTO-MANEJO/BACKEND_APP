/**
 * Utilidades compartidas de la aplicación
 * SRP: Cada función tiene una responsabilidad específica
 */
import { ValidationResult, ValidationError } from "@shared/interfaces/BaseInterfaces";
/**
 * Utilidades para validación
 */
export declare class ValidationUtils {
    /**
     * SRP: Solo valida emails
     */
    static validateEmail(email: string): ValidationError | null;
    /**
     * SRP: Solo valida passwords
     */
    static validatePassword(password: string): ValidationError | null;
    /**
     * SRP: Solo valida cédulas ecuatorianas
     */
    static validateCedula(cedula: string): ValidationError | null;
    /**
     * SRP: Solo combina resultados de validación
     */
    static combineValidationResults(...errors: (ValidationError | null)[]): ValidationResult;
}
/**
 * Utilidades para manejo de fechas
 */
export declare class DateUtils {
    /**
     * SRP: Solo formatea fechas para la base de datos
     */
    static toISOString(date: Date): string;
    /**
     * SRP: Solo parsea fechas desde string
     */
    static fromISOString(dateString: string): Date;
    /**
     * SRP: Solo calcula diferencias de tiempo
     */
    static getDateDifferenceInDays(date1: Date, date2: Date): number;
    /**
     * SRP: Solo verifica si una fecha está en el pasado
     */
    static isInPast(date: Date): boolean;
}
/**
 * Utilidades para strings
 */
export declare class StringUtils {
    /**
     * SRP: Solo limpia strings
     */
    static sanitize(str: string): string;
    /**
     * SRP: Solo capitaliza strings
     */
    static capitalize(str: string): string;
    /**
     * SRP: Solo genera slugs
     */
    static toSlug(str: string): string;
}
//# sourceMappingURL=CommonUtils.d.ts.map