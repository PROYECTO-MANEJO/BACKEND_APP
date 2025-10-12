import { Developer } from "@domain/entities/Developer";
export interface DeveloperFilters {
    available?: boolean;
    hasGithubIntegration?: boolean;
    skill?: string;
    maxWorkload?: number;
}
export interface DeveloperRepository {
    /**
     * Crear un nuevo desarrollador
     */
    create(developer: Developer): Promise<Developer>;
    /**
     * Obtener desarrollador por ID
     */
    findById(id: string): Promise<Developer | null>;
    /**
     * Obtener desarrollador por User ID
     */
    findByUserId(userId: string): Promise<Developer | null>;
    /**
     * Obtener todos los desarrolladores con filtros
     */
    findAll(filters?: DeveloperFilters): Promise<Developer[]>;
    /**
     * Obtener desarrolladores disponibles para asignación
     */
    findAvailable(): Promise<Developer[]>;
    /**
     * Obtener desarrolladores por habilidad específica
     */
    findBySkill(skill: string): Promise<Developer[]>;
    /**
     * Actualizar desarrollador
     */
    update(developer: Developer): Promise<Developer>;
    /**
     * Eliminar desarrollador
     */
    delete(id: string): Promise<void>;
    /**
     * Obtener estadísticas de desarrolladores
     */
    getStatistics(): Promise<{
        totalDevelopers: number;
        availableDevelopers: number;
        averageWorkload: number;
        developersWithGithub: number;
        topSkills: Array<{
            skill: string;
            count: number;
        }>;
    }>;
    /**
     * Verificar si el desarrollador existe por GitHub username
     */
    existsByGithubUsername(username: string): Promise<boolean>;
    /**
     * Obtener desarrollador con menos carga de trabajo
     */
    findWithMinimumWorkload(): Promise<Developer | null>;
    /**
     * Obtener desarrolladores recomendados para una solicitud específica
     */
    findRecommendedForRequest(requestType: string, skills?: string[]): Promise<Developer[]>;
}
//# sourceMappingURL=IDeveloperRepository.d.ts.map