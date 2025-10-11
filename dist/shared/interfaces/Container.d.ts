/**
 * Interface para el Contenedor de Dependencias
 * Principios aplicados:
 * - ISP: Interface pequeña y específica
 * - DIP: Abstracción para inversión de dependencias
 */
export interface Container {
    /**
     * Registra una dependencia en el contenedor
     */
    register<T>(name: string, factory: () => T, singleton?: boolean): void;
    /**
     * Resuelve una dependencia del contenedor
     */
    resolve<T>(name: string): T;
    /**
     * Verifica si existe una dependencia registrada
     */
    has(name: string): boolean;
    /**
     * Limpia todas las dependencias registradas
     */
    clear(): void;
    /**
     * Obtiene la lista de dependencias registradas
     */
    getRegisteredDependencies(): string[];
}
/**
 * Configuración para registro de dependencias
 */
export interface DependencyConfig<T> {
    factory: () => T;
    singleton: boolean;
}
//# sourceMappingURL=Container.d.ts.map