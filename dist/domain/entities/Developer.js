"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Developer = void 0;
class Developer {
    constructor(data) {
        this.data = data;
        this.validateBusinessRules();
    }
    static create(id, userId, githubUsername, skills = []) {
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
    validateBusinessRules() {
        if (this.data.currentWorkload < 0) {
            throw new Error("La carga de trabajo no puede ser negativa");
        }
        if (this.data.skills.length > 50) {
            throw new Error("No se pueden tener más de 50 habilidades");
        }
    }
    // Getters
    getId() {
        return this.data.id;
    }
    getUserId() {
        return this.data.userId;
    }
    getGithubUsername() {
        return this.data.githubUsername;
    }
    getGithubToken() {
        return this.data.githubToken;
    }
    getSkills() {
        return [...this.data.skills];
    }
    isAvailable() {
        return this.data.availability;
    }
    getCurrentWorkload() {
        return this.data.currentWorkload;
    }
    getMaxWorkload() {
        // Por defecto máximo 5 solicitudes concurrentes
        return 5;
    }
    getCreatedAt() {
        return this.data.createdAt;
    }
    getUpdatedAt() {
        return this.data.updatedAt;
    }
    // Business Methods
    canTakeNewRequest() {
        return (this.data.availability &&
            this.data.currentWorkload < this.getMaxWorkload());
    }
    hasGithubIntegration() {
        return !!this.data.githubToken && !!this.data.githubUsername;
    }
    hasSkill(skill) {
        return this.data.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase()));
    }
    getWorkloadLevel() {
        if (this.data.currentWorkload === 0)
            return "LOW";
        if (this.data.currentWorkload <= 2)
            return "MEDIUM";
        if (this.data.currentWorkload <= 4)
            return "HIGH";
        return "FULL";
    }
    // Actions
    updateGithubCredentials(token, username) {
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
    addSkill(skill) {
        if (!skill || skill.trim().length === 0) {
            throw new Error("La habilidad no puede estar vacía");
        }
        const normalizedSkill = skill.trim().toLowerCase();
        const hasSkill = this.data.skills.some((s) => s.toLowerCase() === normalizedSkill);
        if (hasSkill) {
            throw new Error("La habilidad ya existe");
        }
        return new Developer({
            ...this.data,
            skills: [...this.data.skills, skill.trim()],
            updatedAt: new Date(),
        });
    }
    removeSkill(skill) {
        const normalizedSkill = skill.trim().toLowerCase();
        const newSkills = this.data.skills.filter((s) => s.toLowerCase() !== normalizedSkill);
        return new Developer({
            ...this.data,
            skills: newSkills,
            updatedAt: new Date(),
        });
    }
    setAvailability(available) {
        return new Developer({
            ...this.data,
            availability: available,
            updatedAt: new Date(),
        });
    }
    incrementWorkload() {
        if (!this.canTakeNewRequest()) {
            throw new Error("El desarrollador no puede tomar más solicitudes");
        }
        return new Developer({
            ...this.data,
            currentWorkload: this.data.currentWorkload + 1,
            updatedAt: new Date(),
        });
    }
    decrementWorkload() {
        if (this.data.currentWorkload <= 0) {
            throw new Error("La carga de trabajo no puede ser menor a 0");
        }
        return new Developer({
            ...this.data,
            currentWorkload: this.data.currentWorkload - 1,
            updatedAt: new Date(),
        });
    }
    toData() {
        return { ...this.data };
    }
}
exports.Developer = Developer;
//# sourceMappingURL=Developer.js.map