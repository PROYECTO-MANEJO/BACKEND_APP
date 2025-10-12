"use strict";
/**
 * Create Branch Use Case
 *
 * Caso de uso para crear una nueva rama de GitHub
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateHotfixBranchUseCase = exports.CreateFeatureBranchUseCase = exports.CreateBranchUseCase = void 0;
const GitHubBranch_1 = require("../../../domain/entities/github/GitHubBranch");
class CreateBranchUseCase {
    constructor(branchRepo, githubAPI) {
        this.branchRepo = branchRepo;
        this.githubAPI = githubAPI;
    }
    async execute(request) {
        try {
            // Validar entrada
            this.validateRequest(request);
            // Verificar si la rama ya existe
            const existingBranch = await this.branchRepo.findByName(request.name, request.repositoryId);
            if (existingBranch) {
                return {
                    branch: existingBranch,
                    success: false,
                    message: `La rama '${request.name}' ya existe en el repositorio`,
                };
            }
            // Obtener la rama base por defecto si no se especifica
            const baseBranch = request.baseBranch ||
                (await this.getDefaultBaseBranch(request.repositoryFullName));
            // Crear rama en GitHub
            const branchRequest = {
                ...request,
                baseBranch,
            };
            const githubBranchData = await this.githubAPI.createBranch(branchRequest);
            // Crear entidad de dominio
            const branchType = this.determineBranchType(request.name);
            const sha = githubBranchData.sha || githubBranchData.commit?.sha || "";
            const branch = GitHubBranch_1.GitHubBranch.create(request.name, request.repositoryId, request.repositoryFullName, branchType, sha, baseBranch, request.changeRequestId);
            // Guardar en base de datos
            const savedBranch = await this.branchRepo.create(branch);
            return {
                branch: savedBranch,
                success: true,
                message: `Rama '${request.name}' creada exitosamente desde '${baseBranch}'`,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            // En caso de error, crear entidad básica si tenemos los datos mínimos
            if (request.name && request.repositoryId) {
                const branchType = this.determineBranchType(request.name);
                const basicBranch = GitHubBranch_1.GitHubBranch.create(request.name, request.repositoryId, request.repositoryFullName, branchType, "", // SHA vacío para rama básica
                request.baseBranch || "main", request.changeRequestId);
                return {
                    branch: basicBranch,
                    success: false,
                    message: `Error al crear rama: ${errorMessage}`,
                };
            }
            throw new Error(`Error al crear rama: ${errorMessage}`);
        }
    }
    async getDefaultBaseBranch(repositoryFullName) {
        try {
            return await this.githubAPI.getDefaultBranch(repositoryFullName);
        }
        catch {
            return "main"; // Fallback por defecto
        }
    }
    validateRequest(request) {
        if (!request.name || request.name.trim().length === 0) {
            throw new Error("El nombre de la rama es requerido");
        }
        if (!request.repositoryId || request.repositoryId.trim().length === 0) {
            throw new Error("El ID del repositorio es requerido");
        }
        if (!request.repositoryFullName ||
            request.repositoryFullName.trim().length === 0) {
            throw new Error("El nombre completo del repositorio es requerido");
        }
        // Validar formato del nombre de rama
        const branchNamePattern = /^[a-zA-Z0-9._/-]+$/;
        if (!branchNamePattern.test(request.name)) {
            throw new Error("El nombre de la rama contiene caracteres inválidos");
        }
        // Verificar que no contenga espacios ni caracteres especiales problemáticos
        if (request.name.includes(" ") ||
            request.name.includes("..") ||
            request.name.startsWith(".") ||
            request.name.endsWith(".")) {
            throw new Error("El nombre de la rama no puede contener espacios, puntos consecutivos o empezar/terminar con punto");
        }
        if (request.name.length > 250) {
            throw new Error("El nombre de la rama no puede exceder 250 caracteres");
        }
        // Validar nombres reservados
        const reservedNames = ["HEAD", "refs"];
        if (reservedNames.includes(request.name)) {
            throw new Error(`El nombre '${request.name}' está reservado y no puede usarse`);
        }
        if (request.description && request.description.length > 500) {
            throw new Error("La descripción no puede exceder 500 caracteres");
        }
    }
    determineBranchType(branchName) {
        const lowerName = branchName.toLowerCase();
        if (lowerName === "main" || lowerName === "master") {
            return "MAIN";
        }
        if (lowerName === "develop" || lowerName === "development") {
            return "DEVELOP";
        }
        if (lowerName.startsWith("feature/") || lowerName.startsWith("feat/")) {
            return "FEATURE";
        }
        if (lowerName.startsWith("hotfix/") || lowerName.startsWith("hf/")) {
            return "HOTFIX";
        }
        if (lowerName.startsWith("bugfix/") ||
            lowerName.startsWith("bug/") ||
            lowerName.startsWith("fix/")) {
            return "BUGFIX";
        }
        if (lowerName.startsWith("release/") || lowerName.startsWith("rel/")) {
            return "RELEASE";
        }
        return "OTHER";
    }
}
exports.CreateBranchUseCase = CreateBranchUseCase;
/**
 * Create Feature Branch Use Case
 *
 * Caso de uso especializado para crear ramas de feature siguiendo GitFlow
 */
class CreateFeatureBranchUseCase {
    constructor(createBranchUseCase) {
        this.createBranchUseCase = createBranchUseCase;
    }
    async execute(featureName, repositoryId, repositoryFullName, changeRequestId, description) {
        const branchName = this.generateFeatureBranchName(featureName, changeRequestId);
        const request = {
            name: branchName,
            repositoryId,
            repositoryFullName,
            baseBranch: "develop", // GitFlow: features se crean desde develop
            changeRequestId,
            description,
        };
        return await this.createBranchUseCase.execute(request);
    }
    generateFeatureBranchName(featureName, changeRequestId) {
        // Limpiar el nombre de la feature
        const cleanName = featureName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/--+/g, "-")
            .trim();
        // Generar nombre siguiendo GitFlow convention
        if (changeRequestId) {
            return `feature/cr-${changeRequestId}-${cleanName}`;
        }
        return `feature/${cleanName}`;
    }
}
exports.CreateFeatureBranchUseCase = CreateFeatureBranchUseCase;
/**
 * Create Hotfix Branch Use Case
 *
 * Caso de uso especializado para crear ramas de hotfix siguiendo GitFlow
 */
class CreateHotfixBranchUseCase {
    constructor(createBranchUseCase) {
        this.createBranchUseCase = createBranchUseCase;
    }
    async execute(hotfixName, repositoryId, repositoryFullName, version, changeRequestId, description) {
        const branchName = this.generateHotfixBranchName(hotfixName, version, changeRequestId);
        const request = {
            name: branchName,
            repositoryId,
            repositoryFullName,
            baseBranch: "main", // GitFlow: hotfixes se crean desde main
            changeRequestId,
            description,
        };
        return await this.createBranchUseCase.execute(request);
    }
    generateHotfixBranchName(hotfixName, version, changeRequestId) {
        // Limpiar el nombre del hotfix
        const cleanName = hotfixName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/--+/g, "-")
            .trim();
        // Generar nombre siguiendo GitFlow convention
        let branchName = "hotfix/";
        if (version) {
            branchName += `v${version}-`;
        }
        if (changeRequestId) {
            branchName += `cr-${changeRequestId}-`;
        }
        branchName += cleanName;
        return branchName;
    }
}
exports.CreateHotfixBranchUseCase = CreateHotfixBranchUseCase;
//# sourceMappingURL=CreateBranchUseCase.js.map