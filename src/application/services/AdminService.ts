/**
 * Admin Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Operaciones de negocio para administración
 * Separado del controlador para cumplir Single Responsibility Principle
 */

import { DIContainer } from "../../infrastructure/DIContainer";
import { AdminValidator } from "../../domain/validators/AdminValidator";

export interface CreateAdminRequest {
  ced_usu: string;
  nom_usu1: string;
  nom_usu2?: string;
  ape_usu1: string;
  ape_usu2?: string;
  email: string;
  password: string;
  rol: string;
}

export interface UpdateAdminRequest {
  nom_usu1?: string;
  nom_usu2?: string;
  ape_usu1?: string;
  ape_usu2?: string;
  email?: string;
  rol?: string;
}

export class AdminService {
  private container: DIContainer;

  constructor(container: DIContainer) {
    this.container = container;
  }

  /**
   * ✅ SRP: Crear nuevo administrador
   */
  async createAdmin(adminRequest: CreateAdminRequest): Promise<any> {
    // ✅ SRP: Delegar validación al AdminValidator
    AdminValidator.validate({
      ced_usu: adminRequest.ced_usu,
      nom_usu1: adminRequest.nom_usu1,
      nom_usu2: adminRequest.nom_usu2,
      ape_usu1: adminRequest.ape_usu1,
      ape_usu2: adminRequest.ape_usu2,
      email: adminRequest.email,
      password: adminRequest.password,
      rol: adminRequest.rol,
    });

    // ✅ SRP: Lógica de creación de administrador
    // NOTA: Este es un archivo de demostración - no conectado al sistema real
    console.log("AdminService.createAdmin - Archivo de demostración SRP");

    return {
      message: "Admin creation logic would go here",
      data: adminRequest,
    };
  }

  /**
   * ✅ SRP: Obtener todos los administradores
   */
  async getAllAdmins(): Promise<any[]> {
    // ✅ SRP: Lógica de obtención de administradores
    console.log("AdminService.getAllAdmins - Archivo de demostración SRP");

    return [{ message: "Admin fetching logic would go here" }];
  }

  /**
   * ✅ SRP: Obtener administrador por ID
   */
  async getAdminById(id: string): Promise<any | null> {
    // ✅ SRP: Lógica de obtención por ID
    console.log("AdminService.getAdminById - Archivo de demostración SRP", id);

    return {
      message: "Admin by ID fetching logic would go here",
      id,
    };
  }

  /**
   * ✅ SRP: Actualizar administrador
   */
  async updateAdmin(
    id: string,
    updateRequest: UpdateAdminRequest
  ): Promise<any> {
    // ✅ SRP: Delegar validación al AdminValidator
    AdminValidator.validateUpdate(updateRequest);

    // ✅ SRP: Lógica de actualización
    console.log(
      "AdminService.updateAdmin - Archivo de demostración SRP",
      id,
      updateRequest
    );

    return {
      message: "Admin update logic would go here",
      id,
      data: updateRequest,
    };
  }

  /**
   * ✅ SRP: Eliminar administrador
   */
  async deleteAdmin(id: string): Promise<void> {
    // ✅ SRP: Lógica de eliminación
    console.log("AdminService.deleteAdmin - Archivo de demostración SRP", id);
  }
}
