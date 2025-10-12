"use strict";
/**
 * Create Repository Use Case
 *
 * Caso de uso para crear un nuevo repositorio de GitHub
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRepositoryUseCase = void 0;
const GitHubRepository_1 = require("../../../domain/entities/github/GitHubRepository");
class CreateRepositoryUseCase {
    constructor(repositoryRepo, githubAPI) {
        this.repositoryRepo = repositoryRepo;
        this.githubAPI = githubAPI;
    }
    async execute(request) {
        try {
            // Validar entrada
            this.validateRequest(request);
            // Verificar si el repositorio ya existe
            const existingRepo = await this.repositoryRepo.findByName(request.name, request.organization);
            if (existingRepo) {
                return {
                    repository: existingRepo,
                    success: false,
                    message: `El repositorio '${request.name}' ya existe`,
                };
            }
            // Crear repositorio en GitHub
            const githubRepoData = await this.githubAPI.createRepository(request);
            // Crear entidad de dominio
            const repositoryType = this.determineRepositoryType(request.name, request.description);
            const repository = GitHubRepository_1.GitHubRepository.fromGitHubAPI(githubRepoData, repositoryType);
            // Guardar en base de datos
            const savedRepository = await this.repositoryRepo.create(repository);
            return {
                repository: savedRepository,
                success: true,
                message: `Repositorio '${request.name}' creado exitosamente`,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            // En caso de error, intentar crear una entidad básica si tenemos los datos mínimos
            if (request.name) {
                const repositoryType = this.determineRepositoryType(request.name, request.description);
                const basicRepo = GitHubRepository_1.GitHubRepository.create(request.name, request.organization || "unknown", repositoryType);
                return {
                    repository: basicRepo,
                    success: false,
                    message: `Error al crear repositorio: ${errorMessage}`,
                };
            }
            throw new Error(`Error al crear repositorio: ${errorMessage}`);
        }
    }
    validateRequest(request) {
        if (!request.name || request.name.trim().length === 0) {
            throw new Error("El nombre del repositorio es requerido");
        }
        if (request.name.length > 100) {
            throw new Error("El nombre del repositorio no puede exceder 100 caracteres");
        }
        // Validar formato del nombre (GitHub requirements)
        const namePattern = /^[a-zA-Z0-9._-]+$/;
        if (!namePattern.test(request.name)) {
            throw new Error("El nombre del repositorio contiene caracteres inválidos");
        }
        if (request.description && request.description.length > 350) {
            throw new Error("La descripción no puede exceder 350 caracteres");
        }
        if (request.organization) {
            const orgPattern = /^[a-zA-Z0-9._-]+$/;
            if (!orgPattern.test(request.organization)) {
                throw new Error("El nombre de la organización contiene caracteres inválidos");
            }
        }
    }
    determineRepositoryType(name, description) {
        const lowerName = name.toLowerCase();
        const lowerDesc = description?.toLowerCase() || "";
        if (lowerName.includes("frontend") ||
            lowerName.includes("client") ||
            lowerName.includes("ui") ||
            lowerDesc.includes("frontend") ||
            lowerDesc.includes("react") ||
            lowerDesc.includes("angular")) {
            return "FRONTEND";
        }
        if (lowerName.includes("backend") ||
            lowerName.includes("server") ||
            lowerName.includes("api") ||
            lowerDesc.includes("backend") ||
            lowerDesc.includes("server") ||
            lowerDesc.includes("api")) {
            return "BACKEND";
        }
        if (lowerName.includes("shared") ||
            lowerName.includes("common") ||
            lowerName.includes("lib") ||
            lowerDesc.includes("shared") ||
            lowerDesc.includes("library") ||
            lowerDesc.includes("common")) {
            return "SHARED";
        }
        return "OTHER";
    }
}
exports.CreateRepositoryUseCase = CreateRepositoryUseCase;
//# sourceMappingURL=CreateRepositoryUseCase.js.map