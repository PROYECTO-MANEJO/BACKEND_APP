export interface DeveloperData {
    id: string;
    userId: string;
    githubToken?: string;
    githubUsername?: string;
    skills: string[];
    availability: boolean;
    currentWorkload: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Developer {
    private data;
    constructor(data: DeveloperData);
    static create(id: string, userId: string, githubUsername?: string, skills?: string[]): Developer;
    private validateBusinessRules;
    getId(): string;
    getUserId(): string;
    getGithubUsername(): string | undefined;
    getGithubToken(): string | undefined;
    getSkills(): string[];
    isAvailable(): boolean;
    getCurrentWorkload(): number;
    getMaxWorkload(): number;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    canTakeNewRequest(): boolean;
    hasGithubIntegration(): boolean;
    hasSkill(skill: string): boolean;
    getWorkloadLevel(): "LOW" | "MEDIUM" | "HIGH" | "FULL";
    updateGithubCredentials(token: string, username: string): Developer;
    addSkill(skill: string): Developer;
    removeSkill(skill: string): Developer;
    setAvailability(available: boolean): Developer;
    incrementWorkload(): Developer;
    decrementWorkload(): Developer;
    toData(): DeveloperData;
}
//# sourceMappingURL=Developer.d.ts.map