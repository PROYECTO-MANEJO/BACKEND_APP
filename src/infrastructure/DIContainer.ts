/**
 * DIContainer ultra-simplificado
 * Solo para hacer funcionar los controladores con mock data
 */
export class DIContainer {
  private static instance: DIContainer;

  private constructor() {
    // Nada que inicializar
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }
}
