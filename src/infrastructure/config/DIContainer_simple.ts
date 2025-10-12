/**
 * DIContainer simplificado para el servidor refactorizado
 * Solo incluye las dependencias mínimas necesarias
 */
export class DIContainer {
  private static instance: DIContainer;

  private constructor() {
    // Inicialización básica
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // Métodos básicos requeridos por los controladores
  // En el futuro estos se conectarán con los use cases reales
}
