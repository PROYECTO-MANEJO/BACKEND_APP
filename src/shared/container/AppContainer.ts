import { Container, DependencyConfig } from "@shared/interfaces/Container";

/**
 * Contenedor de Inyección de Dependencias - SOLID Implementation
 * Principios aplicados:
 * - DIP: Inversión de dependencias - las clases dependen de abstracciones
 * - SRP: Solo se encarga de resolver dependencias
 * - OCP: Abierto para extensión (nuevas dependencias), cerrado para modificación
 * - ISP: Interface específica para contenedor
 */
export class AppContainer implements Container {
  private dependencies = new Map<string, DependencyConfig<any>>();
  private singletons = new Map<string, any>();

  /**
   * SRP: Solo registra dependencias
   */
  register<T>(name: string, factory: () => T, singleton = true): void {
    this.dependencies.set(name, { factory, singleton });
  }

  /**
   * SRP: Solo resuelve dependencias
   * DIP: Retorna abstracciones, no implementaciones concretas
   */
  resolve<T>(name: string): T {
    const dependency = this.dependencies.get(name);

    if (!dependency) {
      throw new Error(
        `Dependency '${name}' not found. Available dependencies: ${this.getRegisteredDependencies().join(
          ", "
        )}`
      );
    }

    // Singleton pattern implementation
    if (dependency.singleton) {
      if (!this.singletons.has(name)) {
        try {
          const instance = dependency.factory();
          this.singletons.set(name, instance);
          return instance;
        } catch (error) {
          throw new Error(
            `Failed to create singleton instance of '${name}': ${error}`
          );
        }
      }
      return this.singletons.get(name);
    }

    // Create new instance
    try {
      return dependency.factory();
    } catch (error) {
      throw new Error(`Failed to create instance of '${name}': ${error}`);
    }
  }

  /**
   * SRP: Solo verifica si existe una dependencia
   */
  has(name: string): boolean {
    return this.dependencies.has(name);
  }

  /**
   * SRP: Solo limpia el contenedor
   */
  clear(): void {
    this.dependencies.clear();
    this.singletons.clear();
  }

  /**
   * SRP: Solo lista las dependencias registradas
   */
  getRegisteredDependencies(): string[] {
    return Array.from(this.dependencies.keys());
  }

  /**
   * Utility: Registrar múltiples dependencias de una vez
   * OCP: Extensible para diferentes tipos de registros masivos
   */
  registerBatch(
    registrations: Array<{
      name: string;
      factory: () => any;
      singleton?: boolean;
    }>
  ): void {
    registrations.forEach(({ name, factory, singleton }) => {
      this.register(name, factory, singleton);
    });
  }

  /**
   * Debug: Información del estado del contenedor
   */
  getDebugInfo(): {
    totalDependencies: number;
    singletonInstances: number;
    dependencies: string[];
    singletons: string[];
  } {
    return {
      totalDependencies: this.dependencies.size,
      singletonInstances: this.singletons.size,
      dependencies: this.getRegisteredDependencies(),
      singletons: Array.from(this.singletons.keys()),
    };
  }
}

/**
 * Factory function para crear el contenedor configurado
 * SRP: Solo se encarga de configurar el contenedor inicial
 */
export function createAppContainer(): AppContainer {
  const container = new AppContainer();

  // Por ahora solo creamos el contenedor vacío
  // Las dependencias se registrarán en cada fase específica

  console.log("📦 Dependency container initialized");

  return container;
}
