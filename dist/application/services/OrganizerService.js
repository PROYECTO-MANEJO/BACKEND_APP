"use strict";
/**
 * Organizer Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Operaciones de negocio para organizadores
 * Separado del controlador para cumplir Single Responsibility Principle
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizerService = void 0;
const OrganizerValidator_1 = require("../../domain/validators/OrganizerValidator");
class OrganizerService {
    constructor(container) {
        this.container = container;
    }
    /**
     * ✅ SRP: Crear nuevo organizador
     */
    async createOrganizer(organizerRequest) {
        // ✅ SRP: Delegar validación al OrganizerValidator
        OrganizerValidator_1.OrganizerValidator.validate({
            ced_org: organizerRequest.ced_org,
            nom_org1: organizerRequest.nom_org1,
            nom_org2: organizerRequest.nom_org2,
            ape_org1: organizerRequest.ape_org1,
            ape_org2: organizerRequest.ape_org2,
            email: organizerRequest.email,
            tel_org: organizerRequest.tel_org,
            tit_aca_org: organizerRequest.tit_aca_org,
            especialidad: organizerRequest.especialidad,
            experiencia_anos: organizerRequest.experiencia_anos,
        });
        // ✅ SRP: Validar capacitación requerida
        OrganizerValidator_1.OrganizerValidator.validateRequiredTraining(organizerRequest.tit_aca_org, organizerRequest.experiencia_anos, organizerRequest.especialidad);
        // ✅ SRP: Lógica de creación de organizador
        // NOTA: Este es un archivo de demostración - no conectado al sistema real
        console.log("OrganizerService.createOrganizer - Archivo de demostración SRP");
        return {
            message: "Organizer creation logic would go here",
            data: organizerRequest,
        };
    }
    /**
     * ✅ SRP: Obtener todos los organizadores
     */
    async getAllOrganizers() {
        // ✅ SRP: Lógica de obtención de organizadores
        console.log("OrganizerService.getAllOrganizers - Archivo de demostración SRP");
        return [{ message: "Organizers fetching logic would go here" }];
    }
    /**
     * ✅ SRP: Obtener organizador por cédula
     */
    async getOrganizerByCedula(cedula) {
        // ✅ SRP: Lógica de obtención por cédula
        console.log("OrganizerService.getOrganizerByCedula - Archivo de demostración SRP", cedula);
        return {
            message: "Organizer by cedula fetching logic would go here",
            cedula,
        };
    }
    /**
     * ✅ SRP: Obtener organizadores activos
     */
    async getActiveOrganizers() {
        // ✅ SRP: Lógica de organizadores activos
        console.log("OrganizerService.getActiveOrganizers - Archivo de demostración SRP");
        return [{ message: "Active organizers fetching logic would go here" }];
    }
    /**
     * ✅ SRP: Actualizar organizador
     */
    async updateOrganizer(cedula, updateRequest) {
        // ✅ SRP: Delegar validación al OrganizerValidator
        OrganizerValidator_1.OrganizerValidator.validateUpdate(updateRequest);
        // ✅ SRP: Lógica de actualización
        console.log("OrganizerService.updateOrganizer - Archivo de demostración SRP", cedula, updateRequest);
        return {
            message: "Organizer update logic would go here",
            cedula,
            data: updateRequest,
        };
    }
    /**
     * ✅ SRP: Obtener cursos por organizador
     */
    async getCoursesByOrganizer(cedula) {
        // ✅ SRP: Lógica de cursos por organizador
        console.log("OrganizerService.getCoursesByOrganizer - Archivo de demostración SRP", cedula);
        return [
            { message: "Organizer courses fetching logic would go here", cedula },
        ];
    }
    /**
     * ✅ SRP: Obtener eventos por organizador
     */
    async getEventsByOrganizer(cedula) {
        // ✅ SRP: Lógica de eventos por organizador
        console.log("OrganizerService.getEventsByOrganizer - Archivo de demostración SRP", cedula);
        return [
            { message: "Organizer events fetching logic would go here", cedula },
        ];
    }
    /**
     * ✅ SRP: Activar/Desactivar organizador
     */
    async toggleOrganizerStatus(cedula) {
        // ✅ SRP: Lógica de cambio de estado
        console.log("OrganizerService.toggleOrganizerStatus - Archivo de demostración SRP", cedula);
        return {
            message: "Organizer status toggle logic would go here",
            cedula,
        };
    }
}
exports.OrganizerService = OrganizerService;
//# sourceMappingURL=OrganizerService.js.map