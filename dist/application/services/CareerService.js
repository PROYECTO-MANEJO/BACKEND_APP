"use strict";
/**
 * Career Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Operaciones de negocio para carreras
 * Separado del controlador para cumplir Single Responsibility Principle
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareerService = void 0;
const CareerValidator_1 = require("../../domain/validators/CareerValidator");
class CareerService {
    constructor(container) {
        this.container = container;
    }
    /**
     * ✅ SRP: Crear nueva carrera
     */
    async createCareer(careerRequest) {
        // ✅ SRP: Delegar validación al CareerValidator
        CareerValidator_1.CareerValidator.validate({
            nom_car: careerRequest.nom_car,
            des_car: careerRequest.des_car,
            duracion_semestres: careerRequest.duracion_semestres,
            modalidad: careerRequest.modalidad,
        });
        // ✅ SRP: Validar nombre único (simulado)
        const existingNames = []; // Simulado
        CareerValidator_1.CareerValidator.validateUniqueName(careerRequest.nom_car, existingNames);
        // ✅ SRP: Lógica de creación de carrera
        // NOTA: Este es un archivo de demostración - no conectado al sistema real
        console.log("CareerService.createCareer - Archivo de demostración SRP");
        return {
            message: "Career creation logic would go here",
            data: careerRequest,
        };
    }
    /**
     * ✅ SRP: Obtener todas las carreras
     */
    async getAllCareers() {
        // ✅ SRP: Lógica de obtención de carreras
        console.log("CareerService.getAllCareers - Archivo de demostración SRP");
        return [{ message: "Career fetching logic would go here" }];
    }
    /**
     * ✅ SRP: Obtener carrera por ID
     */
    async getCareerById(id) {
        // ✅ SRP: Lógica de obtención por ID
        console.log("CareerService.getCareerById - Archivo de demostración SRP", id);
        return {
            message: "Career by ID fetching logic would go here",
            id,
        };
    }
    /**
     * ✅ SRP: Actualizar carrera
     */
    async updateCareer(id, updateRequest) {
        // ✅ SRP: Delegar validación al CareerValidator
        CareerValidator_1.CareerValidator.validateUpdate(updateRequest);
        // ✅ SRP: Lógica de actualización
        console.log("CareerService.updateCareer - Archivo de demostración SRP", id, updateRequest);
        return {
            message: "Career update logic would go here",
            id,
            data: updateRequest,
        };
    }
    /**
     * ✅ SRP: Eliminar carrera
     */
    async deleteCareer(id) {
        // ✅ SRP: Lógica de eliminación
        console.log("CareerService.deleteCareer - Archivo de demostración SRP", id);
    }
    /**
     * ✅ SRP: Obtener carreras activas
     */
    async getActiveCareers() {
        // ✅ SRP: Lógica de carreras activas
        console.log("CareerService.getActiveCareers - Archivo de demostración SRP");
        return [{ message: "Active careers fetching logic would go here" }];
    }
}
exports.CareerService = CareerService;
//# sourceMappingURL=CareerService.js.map