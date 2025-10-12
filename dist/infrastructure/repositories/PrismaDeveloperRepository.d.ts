import { PrismaClient } from "@prisma/client";
import { Developer } from "@domain/entities/Developer";
import { DeveloperRepository, DeveloperFilters } from "@domain/repositories/IDeveloperRepository";
export declare class PrismaDeveloperRepository implements DeveloperRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    findById(id: string): Promise<Developer | null>;
    findByUserId(userId: string): Promise<Developer | null>;
    findByEmail(email: string): Promise<Developer | null>;
    findAll(filters?: DeveloperFilters): Promise<Developer[]>;
    findAvailable(): Promise<Developer[]>;
    findBySkill(skill: string): Promise<Developer[]>;
    getDeveloperWorkloadStats(): Promise<Array<{
        developerId: string;
        developerName: string;
        totalAssigned: number;
        inDevelopment: number;
        inTesting: number;
        averageCompletionTime: number;
    }>>;
    create(developer: Developer): Promise<Developer>;
    update(developer: Developer): Promise<Developer>;
    delete(id: string): Promise<void>;
    findByGitHubUsername(githubUsername: string): Promise<Developer | null>;
    private mapFromDatabase;
    getMaxWorkload(developerId: string): Promise<number>;
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
    existsByGithubUsername(githubUsername: string): Promise<boolean>;
    findWithMinimumWorkload(): Promise<Developer | null>;
    findRecommendedForRequest(requestType: string, skills?: string[]): Promise<Developer[]>;
}
//# sourceMappingURL=PrismaDeveloperRepository.d.ts.map