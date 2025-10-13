/**
 * Category Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Operaciones de negocio para categorías
 * Separado del controlador para cumplir Single Responsibility Principle
 */

import { DIContainer } from "../../infrastructure/DIContainer";
import { CategoryValidator } from "../../domain/validators/CategoryValidator";

export interface CreateCategoryRequest {
  nom_cat: string;
  des_cat: string;
  tipo_categoria: string;
}

export interface UpdateCategoryRequest {
  nom_cat?: string;
  des_cat?: string;
  tipo_categoria?: string;
  estado?: string;
}

export class CategoryService {
  private container: DIContainer;

  constructor(container: DIContainer) {
    this.container = container;
  }

  /**
   * ✅ SRP: Crear nueva categoría
   */
  async createCategory(categoryRequest: CreateCategoryRequest): Promise<any> {
    // ✅ SRP: Delegar validación al CategoryValidator
    CategoryValidator.validate({
      nom_cat: categoryRequest.nom_cat,
      des_cat: categoryRequest.des_cat,
      tipo_categoria: categoryRequest.tipo_categoria,
    });

    // ✅ SRP: Validar nombre único por tipo (simulado)
    const existingCategories: Array<{
      nom_cat: string;
      tipo_categoria: string;
    }> = []; // Simulado
    CategoryValidator.validateUniqueNameByType(
      categoryRequest.nom_cat,
      categoryRequest.tipo_categoria,
      existingCategories
    );

    // ✅ SRP: Lógica de creación de categoría
    // NOTA: Este es un archivo de demostración - no conectado al sistema real
    console.log("CategoryService.createCategory - Archivo de demostración SRP");

    return {
      message: "Category creation logic would go here",
      data: categoryRequest,
    };
  }

  /**
   * ✅ SRP: Obtener todas las categorías
   */
  async getAllCategories(): Promise<any[]> {
    // ✅ SRP: Lógica de obtención de categorías
    console.log(
      "CategoryService.getAllCategories - Archivo de demostración SRP"
    );

    return [{ message: "Category fetching logic would go here" }];
  }

  /**
   * ✅ SRP: Obtener categorías por tipo
   */
  async getCategoriesByType(type: string): Promise<any[]> {
    // ✅ SRP: Lógica de obtención por tipo
    console.log(
      "CategoryService.getCategoriesByType - Archivo de demostración SRP",
      type
    );

    return [
      { message: "Categories by type fetching logic would go here", type },
    ];
  }

  /**
   * ✅ SRP: Obtener categoría por ID
   */
  async getCategoryById(id: string): Promise<any | null> {
    // ✅ SRP: Lógica de obtención por ID
    console.log(
      "CategoryService.getCategoryById - Archivo de demostración SRP",
      id
    );

    return {
      message: "Category by ID fetching logic would go here",
      id,
    };
  }

  /**
   * ✅ SRP: Actualizar categoría
   */
  async updateCategory(
    id: string,
    updateRequest: UpdateCategoryRequest
  ): Promise<any> {
    // ✅ SRP: Delegar validación al CategoryValidator
    CategoryValidator.validateUpdate(updateRequest);

    // ✅ SRP: Lógica de actualización
    console.log(
      "CategoryService.updateCategory - Archivo de demostración SRP",
      id,
      updateRequest
    );

    return {
      message: "Category update logic would go here",
      id,
      data: updateRequest,
    };
  }

  /**
   * ✅ SRP: Eliminar categoría
   */
  async deleteCategory(id: string): Promise<void> {
    // ✅ SRP: Lógica de eliminación
    console.log(
      "CategoryService.deleteCategory - Archivo de demostración SRP",
      id
    );
  }
}
