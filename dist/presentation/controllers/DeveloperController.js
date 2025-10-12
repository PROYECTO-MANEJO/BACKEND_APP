"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeveloperController = void 0;
const DIContainer_1 = require("../../infrastructure/config/DIContainer");
class DeveloperController {
    constructor() {
        this.container = DIContainer_1.DIContainer.getInstance();
    }
    /**
     * GET /api/developers
     * Obtener lista de desarrolladores disponibles
     */
    async getAllDevelopers(req, res) {
        try {
            const userRole = req.usuario?.rol;
            if (!userRole ||
                !["ADMINISTRADOR", "MASTER", "DESARROLLADOR"].includes(userRole)) {
                res.status(403).json({
                    success: false,
                    message: "Acceso denegado",
                });
                return;
            }
            const repository = this.container.developerRepository;
            const developers = await repository.findAll();
            res.json({
                success: true,
                data: developers.map((dev) => ({
                    id: dev.getId(),
                    userId: dev.getUserId(),
                    githubUsername: dev.getGithubUsername(),
                    skills: dev.getSkills(),
                    currentWorkload: dev.getCurrentWorkload(),
                    maxWorkload: dev.getMaxWorkload(),
                    isAvailable: dev.canTakeNewRequest(),
                    workloadLevel: dev.getWorkloadLevel(),
                    createdAt: dev.getCreatedAt(),
                    updatedAt: dev.getUpdatedAt(),
                })),
            });
        }
        catch (error) {
            console.error("Error getting developers:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
                error: error instanceof Error ? error.message : "Error desconocido",
            });
        }
    }
    /**
     * GET /api/developers/:id
     * Obtener un desarrollador por ID
     */
    async getDeveloperById(req, res) {
        try {
            const userRole = req.usuario?.rol;
            if (!userRole ||
                !["ADMINISTRADOR", "MASTER", "DESARROLLADOR"].includes(userRole)) {
                res.status(403).json({
                    success: false,
                    message: "Acceso denegado",
                });
                return;
            }
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de desarrollador requerido",
                });
                return;
            }
            const repository = this.container.developerRepository;
            const developer = await repository.findById(id);
            if (!developer) {
                res.status(404).json({
                    success: false,
                    message: "Desarrollador no encontrado",
                });
                return;
            }
            res.json({
                success: true,
                data: {
                    id: developer.getId(),
                    userId: developer.getUserId(),
                    githubUsername: developer.getGithubUsername(),
                    skills: developer.getSkills(),
                    currentWorkload: developer.getCurrentWorkload(),
                    maxWorkload: developer.getMaxWorkload(),
                    isAvailable: developer.canTakeNewRequest(),
                    hasGithubIntegration: developer.hasGithubIntegration(),
                    workloadLevel: developer.getWorkloadLevel(),
                    createdAt: developer.getCreatedAt(),
                    updatedAt: developer.getUpdatedAt(),
                },
            });
        }
        catch (error) {
            console.error("Error getting developer:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
                error: error instanceof Error ? error.message : "Error desconocido",
            });
        }
    }
    /**
     * GET /api/developers/available
     * Obtener desarrolladores disponibles para asignación
     */
    async getAvailableDevelopers(req, res) {
        try {
            const userRole = req.usuario?.rol;
            if (!userRole || !["ADMINISTRADOR", "MASTER"].includes(userRole)) {
                res.status(403).json({
                    success: false,
                    message: "Solo los administradores pueden ver desarrolladores disponibles",
                });
                return;
            }
            const repository = this.container.developerRepository;
            const developers = await repository.findAvailable();
            res.json({
                success: true,
                data: developers.map((dev) => ({
                    id: dev.getId(),
                    userId: dev.getUserId(),
                    githubUsername: dev.getGithubUsername(),
                    currentWorkload: dev.getCurrentWorkload(),
                    maxWorkload: dev.getMaxWorkload(),
                    workloadLevel: dev.getWorkloadLevel(),
                    canTakeNewRequest: dev.canTakeNewRequest(),
                })),
            });
        }
        catch (error) {
            console.error("Error getting available developers:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
                error: error instanceof Error ? error.message : "Error desconocido",
            });
        }
    }
    /**
     * GET /api/developers/statistics
     * Obtener estadísticas de desarrolladores
     */
    async getDeveloperStatistics(req, res) {
        try {
            const userRole = req.usuario?.rol;
            if (!userRole || !["ADMINISTRADOR", "MASTER"].includes(userRole)) {
                res.status(403).json({
                    success: false,
                    message: "Acceso denegado",
                });
                return;
            }
            const repository = this.container.developerRepository;
            const statistics = await repository.getStatistics();
            res.json({
                success: true,
                data: statistics,
            });
        }
        catch (error) {
            console.error("Error getting developer statistics:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }
    /**
     * GET /api/developers/workload
     * Obtener estadísticas detalladas de carga de trabajo
     */
    async getWorkloadStatistics(req, res) {
        try {
            const userRole = req.usuario?.rol;
            if (!userRole || !["ADMINISTRADOR", "MASTER"].includes(userRole)) {
                res.status(403).json({
                    success: false,
                    message: "Acceso denegado",
                });
                return;
            }
            const repository = this.container.developerRepository;
            if (repository.getDeveloperWorkloadStats) {
                const workloadStats = await repository.getDeveloperWorkloadStats();
                res.json({
                    success: true,
                    data: workloadStats,
                });
            }
            else {
                res.status(501).json({
                    success: false,
                    message: "Función no implementada en el repositorio",
                });
            }
        }
        catch (error) {
            console.error("Error getting workload statistics:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }
    /**
     * GET /api/developers/recommended/:requestType
     * Obtener desarrolladores recomendados para un tipo de solicitud
     */
    async getRecommendedDevelopers(req, res) {
        try {
            const userRole = req.usuario?.rol;
            if (!userRole || !["ADMINISTRADOR", "MASTER"].includes(userRole)) {
                res.status(403).json({
                    success: false,
                    message: "Solo los administradores pueden obtener recomendaciones",
                });
                return;
            }
            const { requestType } = req.params;
            if (!requestType) {
                res.status(400).json({
                    success: false,
                    message: "Tipo de solicitud requerido",
                });
                return;
            }
            const skills = req.query.skills
                ? req.query.skills.split(",")
                : undefined;
            const repository = this.container.developerRepository;
            const developers = await repository.findRecommendedForRequest(requestType, skills);
            res.json({
                success: true,
                data: developers.map((dev) => ({
                    id: dev.getId(),
                    userId: dev.getUserId(),
                    githubUsername: dev.getGithubUsername(),
                    skills: dev.getSkills(),
                    currentWorkload: dev.getCurrentWorkload(),
                    workloadLevel: dev.getWorkloadLevel(),
                    recommendationScore: Math.random() * 100, // Por ahora aleatorio
                })),
            });
        }
        catch (error) {
            console.error("Error getting recommended developers:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
                error: error instanceof Error ? error.message : "Error desconocido",
            });
        }
    }
    /**
     * PUT /api/developers/:id/github
     * Actualizar credenciales de GitHub de un desarrollador
     */
    async updateGithubCredentials(req, res) {
        try {
            const userId = req.usuario?.id_usu;
            const userRole = req.usuario?.rol;
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de desarrollador requerido",
                });
                return;
            }
            // Solo el mismo desarrollador o un administrador puede actualizar
            if (userId !== id &&
                !["ADMINISTRADOR", "MASTER"].includes(userRole || "")) {
                res.status(403).json({
                    success: false,
                    message: "No tienes permisos para actualizar este desarrollador",
                });
                return;
            }
            const { githubToken, githubUsername } = req.body;
            if (!githubToken || !githubUsername) {
                res.status(400).json({
                    success: false,
                    message: "Token y username de GitHub son requeridos",
                });
                return;
            }
            const repository = this.container.developerRepository;
            const developer = await repository.findById(id);
            if (!developer) {
                res.status(404).json({
                    success: false,
                    message: "Desarrollador no encontrado",
                });
                return;
            }
            const updatedDeveloper = developer.updateGithubCredentials(githubToken, githubUsername);
            await repository.update(updatedDeveloper);
            res.json({
                success: true,
                message: "Credenciales de GitHub actualizadas exitosamente",
                data: {
                    id: updatedDeveloper.getId(),
                    githubUsername: updatedDeveloper.getGithubUsername(),
                    hasGithubIntegration: updatedDeveloper.hasGithubIntegration(),
                },
            });
        }
        catch (error) {
            console.error("Error updating GitHub credentials:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Error interno del servidor",
            });
        }
    }
}
exports.DeveloperController = DeveloperController;
//# sourceMappingURL=DeveloperController.js.map