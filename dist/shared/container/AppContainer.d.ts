import { Container } from "@shared/interfaces/Container";
/**
 * Contenedor de Inyección de Dependencias - SOLID Implementation
 * Principios aplicados:
 * - DIP: Inversión de dependencias - las clases dependen de abstracciones
 * - SRP: Solo se encarga de resolver dependencias
 * - OCP: Abierto para extensión (nuevas dependencias), cerrado para modificación
 * - ISP: Interface específica para contenedor
 */
export declare class AppContainer implements Container {
    private dependencies;
    private singletons;
    /**
     * SRP: Solo registra dependencias
     */
    register<T>(name: string, factory: () => T, singleton?: boolean): void;
    /**
     * SRP: Solo resuelve dependencias
     * DIP: Retorna abstracciones, no implementaciones concretas
     */
    resolve<T>(name: string): T;
    /**
     * SRP: Solo verifica si existe una dependencia
     */
    has(name: string): boolean;
    /**
     * SRP: Solo limpia el contenedor
     */
    clear(): void;
    /**
     * SRP: Solo lista las dependencias registradas
     */
    getRegisteredDependencies(): string[];
    /**
     * Utility: Registrar múltiples dependencias de una vez
     * OCP: Extensible para diferentes tipos de registros masivos
     */
    registerBatch(registrations: Array<{
        name: string;
        factory: () => any;
        singleton?: boolean;
    }>): void;
    /**
     * Debug: Información del estado del contenedor
     */
    getDebugInfo(): {
        totalDependencies: number;
        singletonInstances: number;
        dependencies: string[];
        singletons: string[];
    };
}
/**
 * Factory function para crear el contenedor configurado
 * SRP: Solo se encarga de configurar el contenedor inicial
 */
export declare function createAppContainer(): AppContainer;
//# sourceMappingURL=AppContainer.d.ts.map