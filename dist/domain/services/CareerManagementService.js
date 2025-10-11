"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareerManagementService = void 0;
const Career_1 = require("../entities/Career");
/**
 * Servicio de dominio para gestión de carreras
 * Principios aplicados:
 * - SRP: Solo lógica de negocio de carreras
 * - DIP: Depende de abstracciones
 */
class CareerManagementService {
    constructor(careerRepository) {
        this.careerRepository = careerRepository;
    }
    async getAllCareers() {
        try {
            return await this.careerRepository.findAll();
        }
        catch (error) {
            console.error("[CareerManagementService] Error obteniendo carreras:", error);
            throw new Error("Error obteniendo lista de carreras");
        }
    }
    async getActiveCareers() {
        try {
            return await this.careerRepository.findActivecareers();
        }
        catch (error) {
            console.error("[CareerManagementService] Error obteniendo carreras activas:", error);
            throw new Error("Error obteniendo carreras activas");
        }
    }
    async getCareerById(id) {
        try {
            return await this.careerRepository.findById(id);
        }
        catch (error) {
            console.error("[CareerManagementService] Error obteniendo carrera:", error);
            throw new Error("Error obteniendo carrera");
        }
    }
    async createCareer(careerData) {
        try {
            // Validar datos
            if (!careerData.name || !careerData.code || !careerData.faculty) {
                return {
                    success: false,
                    message: "Nombre, código y facultad son requeridos",
                };
            }
            // Validar código
            if (!Career_1.CareerEntity.isValidCode(careerData.code)) {
                return {
                    success: false,
                    message: "El código debe tener entre 2 y 10 caracteres",
                };
            }
            // Verificar si el código ya existe
            const codeExists = await this.careerRepository.codeExists(careerData.code);
            if (codeExists) {
                return {
                    success: false,
                    message: "Ya existe una carrera con ese código",
                };
            }
            // Crear carrera
            const newCareer = {
                name: careerData.name.trim(),
                code: careerData.code.trim().toUpperCase(),
                faculty: careerData.faculty.trim(),
                isActive: careerData.isActive ?? true,
            };
            const career = await this.careerRepository.create(newCareer);
            return {
                success: true,
                message: "Carrera creada exitosamente",
                career,
            };
        }
        catch (error) {
            console.error("[CareerManagementService] Error creando carrera:", error);
            return { success: false, message: "Error interno del servidor" };
        }
    }
    async updateCareer(id, updateData) {
        try {
            // Verificar que la carrera existe
            const existingCareer = await this.careerRepository.findById(id);
            if (!existingCareer) {
                return { success: false, message: "Carrera no encontrada" };
            }
            // Validar código si se está actualizando
            if (updateData.code) {
                if (!Career_1.CareerEntity.isValidCode(updateData.code)) {
                    return {
                        success: false,
                        message: "El código debe tener entre 2 y 10 caracteres",
                    };
                }
                const codeExists = await this.careerRepository.codeExists(updateData.code, id);
                if (codeExists) {
                    return {
                        success: false,
                        message: "Ya existe una carrera con ese código",
                    };
                }
            }
            // Preparar datos de actualización
            const updatePayload = {};
            if (updateData.name)
                updatePayload.name = updateData.name.trim();
            if (updateData.code)
                updatePayload.code = updateData.code.trim().toUpperCase();
            if (updateData.faculty)
                updatePayload.faculty = updateData.faculty.trim();
            if (updateData.isActive !== undefined)
                updatePayload.isActive = updateData.isActive;
            // Actualizar
            const updated = await this.careerRepository.update(id, updatePayload);
            if (!updated) {
                return { success: false, message: "Error actualizando carrera" };
            }
            const updatedCareer = await this.careerRepository.findById(id);
            return {
                success: true,
                message: "Carrera actualizada exitosamente",
                career: updatedCareer,
            };
        }
        catch (error) {
            console.error("[CareerManagementService] Error actualizando carrera:", error);
            return { success: false, message: "Error interno del servidor" };
        }
    }
    async toggleCareerStatus(id) {
        try {
            const career = await this.careerRepository.findById(id);
            if (!career) {
                return { success: false, message: "Carrera no encontrada" };
            }
            const newStatus = !career.isActive;
            const updated = await this.careerRepository.setActiveStatus(id, newStatus);
            if (!updated) {
                return { success: false, message: "Error cambiando estado de carrera" };
            }
            const statusText = newStatus ? "activada" : "desactivada";
            return {
                success: true,
                message: `Carrera ${statusText} exitosamente`,
            };
        }
        catch (error) {
            console.error("[CareerManagementService] Error cambiando estado:", error);
            return { success: false, message: "Error interno del servidor" };
        }
    }
    async deleteCareer(id) {
        try {
            const career = await this.careerRepository.findById(id);
            if (!career) {
                return { success: false, message: "Carrera no encontrada" };
            }
            // En lugar de eliminar físicamente, desactivar
            const deactivated = await this.careerRepository.setActiveStatus(id, false);
            if (!deactivated) {
                return { success: false, message: "Error eliminando carrera" };
            }
            return { success: true, message: "Carrera eliminada exitosamente" };
        }
        catch (error) {
            console.error("[CareerManagementService] Error eliminando carrera:", error);
            return { success: false, message: "Error interno del servidor" };
        }
    }
}
exports.CareerManagementService = CareerManagementService;
//# sourceMappingURL=CareerManagementService.js.map