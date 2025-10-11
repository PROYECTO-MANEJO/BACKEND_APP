export interface DeveloperData {
  id: string;
  userId: string;
  githubToken?: string;
  githubUsername?: string;
  skills: string[];
  availability: boolean;
  currentWorkload: number; // número de solicitudes asignadas
  createdAt: Date;
  updatedAt: Date;
}

export class Developer {
  constructor(private data: DeveloperData) {
    this.validateBusinessRules();
  }

  public static create(
    id: string,
    userId: string,
    githubUsername?: string,
    skills: string[] = []
  ): Developer {
    if (!id || !userId) {
      throw new Error("ID y userId son requeridos");
    }

    if (githubUsername && githubUsername.trim().length === 0) {
      throw new Error("Github username no puede estar vacío");
    }

    return new Developer({
      id,
      userId,
      githubUsername: githubUsername?.trim(),
      skills: skills.filter((skill) => skill.trim().length > 0),
      availability: true,
      currentWorkload: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private validateBusinessRules(): void {
    if (this.data.currentWorkload < 0) {
      throw new Error("La carga de trabajo no puede ser negativa");
    }

    if (this.data.skills.length > 50) {
      throw new Error("No se pueden tener más de 50 habilidades");
    }
  }

  // Getters
  public getId(): string {
    return this.data.id;
  }

  public getUserId(): string {
    return this.data.userId;
  }

  public getGithubUsername(): string | undefined {
    return this.data.githubUsername;
  }

  public getGithubToken(): string | undefined {
    return this.data.githubToken;
  }

  public getSkills(): string[] {
    return [...this.data.skills];
  }

  public isAvailable(): boolean {
    return this.data.availability;
  }

  public getCurrentWorkload(): number {
    return this.data.currentWorkload;
  }

  public getMaxWorkload(): number {
    // Por defecto máximo 5 solicitudes concurrentes
    return 5;
  }

  public getCreatedAt(): Date {
    return this.data.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.data.updatedAt;
  }

  // Business Methods
  public canTakeNewRequest(): boolean {
    return this.data.availability && this.data.currentWorkload < this.getMaxWorkload();
  }

  public hasGithubIntegration(): boolean {
    return !!this.data.githubToken && !!this.data.githubUsername;
  }

  public hasSkill(skill: string): boolean {
    return this.data.skills.some((s) =>
      s.toLowerCase().includes(skill.toLowerCase())
    );
  }

  public getWorkloadLevel(): "LOW" | "MEDIUM" | "HIGH" | "FULL" {
    if (this.data.currentWorkload === 0) return "LOW";
    if (this.data.currentWorkload <= 2) return "MEDIUM";
    if (this.data.currentWorkload <= 4) return "HIGH";
    return "FULL";
  }

  // Actions
  public updateGithubCredentials(token: string, username: string): Developer {
    if (!token || token.trim().length === 0) {
      throw new Error("Token de GitHub es requerido");
    }

    if (!username || username.trim().length === 0) {
      throw new Error("Username de GitHub es requerido");
    }

    return new Developer({
      ...this.data,
      githubToken: token.trim(),
      githubUsername: username.trim(),
      updatedAt: new Date(),
    });
  }

  public addSkill(skill: string): Developer {
    if (!skill || skill.trim().length === 0) {
      throw new Error("La habilidad no puede estar vacía");
    }

    const normalizedSkill = skill.trim().toLowerCase();
    const hasSkill = this.data.skills.some(
      (s) => s.toLowerCase() === normalizedSkill
    );

    if (hasSkill) {
      throw new Error("La habilidad ya existe");
    }

    return new Developer({
      ...this.data,
      skills: [...this.data.skills, skill.trim()],
      updatedAt: new Date(),
    });
  }

  public removeSkill(skill: string): Developer {
    const normalizedSkill = skill.trim().toLowerCase();
    const newSkills = this.data.skills.filter(
      (s) => s.toLowerCase() !== normalizedSkill
    );

    return new Developer({
      ...this.data,
      skills: newSkills,
      updatedAt: new Date(),
    });
  }

  public setAvailability(available: boolean): Developer {
    return new Developer({
      ...this.data,
      availability: available,
      updatedAt: new Date(),
    });
  }

  public incrementWorkload(): Developer {
    if (!this.canTakeNewRequest()) {
      throw new Error("El desarrollador no puede tomar más solicitudes");
    }

    return new Developer({
      ...this.data,
      currentWorkload: this.data.currentWorkload + 1,
      updatedAt: new Date(),
    });
  }

  public decrementWorkload(): Developer {
    if (this.data.currentWorkload <= 0) {
      throw new Error("La carga de trabajo no puede ser menor a 0");
    }

    return new Developer({
      ...this.data,
      currentWorkload: this.data.currentWorkload - 1,
      updatedAt: new Date(),
    });
  }

  public toData(): DeveloperData {
    return { ...this.data };
  }
}
