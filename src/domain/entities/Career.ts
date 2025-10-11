import { BaseEntity } from "@shared/interfaces/BaseInterfaces";

/**
 * Entidad Career del dominio
 * Principio SRP: Solo representa la información de una carrera
 */
export interface Career extends BaseEntity {
  name: string;
  code: string;
  faculty: string;
  isActive: boolean;
}

/**
 * Clase Career con métodos de dominio
 */
export class CareerEntity implements Career {
  public readonly id: number;
  public readonly name: string;
  public readonly code: string;
  public readonly faculty: string;
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: Career) {
    this.id = data.id;
    this.name = data.name;
    this.code = data.code;
    this.faculty = data.faculty;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Valida si la carrera está activa
   */
  public canAcceptStudents(): boolean {
    return this.isActive;
  }

  /**
   * Obtiene nombre completo de la carrera
   */
  public getFullName(): string {
    return `${this.name} - ${this.faculty}`;
  }

  /**
   * Valida si el código de carrera es válido
   */
  public static isValidCode(code: string): boolean {
    return Boolean(code && code.length >= 2 && code.length <= 10);
  }
}