"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizerController = void 0;
class OrganizerController {
    constructor(container) {
        this.container = container;
        this.organizerRepository = container.getOrganizerRepository();
    }
    /**
     * GET /api/organizadores
     * Obtener todos los organizadores
     */
    async getOrganizadores(req, res) {
        try {
            const organizadores = await this.organizerRepository.findAll();
            res.json({
                success: true,
                organizadores: organizadores.map((org) => ({
                    ced_org: org.cedula,
                    nom_org1: org.firstName,
                    nom_org2: org.secondName,
                    ape_org1: org.lastName,
                    ape_org2: org.secondLastName,
                    tit_aca_org: org.academicTitle,
                    nombre_completo: `${org.firstName} ${org.secondName || ""} ${org.lastName} ${org.secondLastName || ""}`.trim(),
                })),
            });
        }
        catch (error) {
            console.error("[getOrganizadores] Error:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }
    /**
     * POST /api/organizadores
     * Crear nuevo organizador (Admin only)
     */
    async createOrganizador(req, res) {
        try {
            const { ced_org, nom_org1, nom_org2, ape_org1, ape_org2, tit_aca_org } = req.body;
            // Validaciones básicas
            if (!ced_org || !nom_org1 || !ape_org1) {
                res.status(400).json({
                    success: false,
                    message: "Cédula, primer nombre y primer apellido son obligatorios",
                });
                return;
            }
            // Verificar si ya existe un organizador con esa cédula
            const existingOrganizer = await this.organizerRepository.existsByCedula(ced_org.trim());
            if (existingOrganizer) {
                res.status(400).json({
                    success: false,
                    message: "Ya existe un organizador con esa cédula",
                });
                return;
            }
            // Crear objeto del dominio para el nuevo organizador
            const organizadorData = {
                cedula: ced_org.trim(),
                firstName: nom_org1.trim(),
                secondName: nom_org2?.trim() || undefined,
                lastName: ape_org1.trim(),
                secondLastName: ape_org2?.trim() || undefined,
                academicTitle: tit_aca_org?.trim() || undefined,
            };
            const nuevoOrganizador = await this.organizerRepository.create(organizadorData);
            res.status(201).json({
                success: true,
                message: "Organizador creado exitosamente",
                organizador: {
                    ced_org: nuevoOrganizador.cedula,
                    nom_org1: nuevoOrganizador.firstName,
                    nom_org2: nuevoOrganizador.secondName,
                    ape_org1: nuevoOrganizador.lastName,
                    ape_org2: nuevoOrganizador.secondLastName,
                    tit_aca_org: nuevoOrganizador.academicTitle,
                },
            });
        }
        catch (error) {
            console.error("[createOrganizador] Error:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }
    /**
     * GET /api/organizadores/:cedula
     * Obtener organizador por cédula
     */
    async getOrganizadorByCedula(req, res) {
        try {
            const { cedula } = req.params;
            if (!cedula) {
                res.status(400).json({
                    success: false,
                    message: "Cédula es requerida",
                });
                return;
            }
            const organizador = await this.organizerRepository.findByCedula(cedula);
            if (!organizador) {
                res.status(404).json({
                    success: false,
                    message: "Organizador no encontrado",
                });
                return;
            }
            res.json({
                success: true,
                organizador: {
                    ced_org: organizador.cedula,
                    nom_org1: organizador.firstName,
                    nom_org2: organizador.secondName,
                    ape_org1: organizador.lastName,
                    ape_org2: organizador.secondLastName,
                    tit_aca_org: organizador.academicTitle,
                    nombre_completo: `${organizador.firstName} ${organizador.secondName || ""} ${organizador.lastName} ${organizador.secondLastName || ""}`.trim(),
                },
            });
        }
        catch (error) {
            console.error("[getOrganizadorByCedula] Error:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }
    /**
     * PUT /api/organizadores/:cedula
     * Actualizar organizador (Admin only)
     */
    async updateOrganizador(req, res) {
        try {
            const { cedula } = req.params;
            const { nom_org1, nom_org2, ape_org1, ape_org2, tit_aca_org } = req.body;
            if (!cedula) {
                res.status(400).json({
                    success: false,
                    message: "Cédula es requerida",
                });
                return;
            }
            // Verificar que el organizador existe
            const existingOrganizer = await this.organizerRepository.findByCedula(cedula);
            if (!existingOrganizer) {
                res.status(404).json({
                    success: false,
                    message: "Organizador no encontrado",
                });
                return;
            }
            // Crear objeto de actualización
            const updateData = {};
            if (nom_org1 !== undefined)
                updateData.firstName = nom_org1.trim();
            if (nom_org2 !== undefined)
                updateData.secondName = nom_org2?.trim() || undefined;
            if (ape_org1 !== undefined)
                updateData.lastName = ape_org1.trim();
            if (ape_org2 !== undefined)
                updateData.secondLastName = ape_org2?.trim() || undefined;
            if (tit_aca_org !== undefined)
                updateData.academicTitle = tit_aca_org?.trim() || undefined;
            const organizadorActualizado = await this.organizerRepository.update(cedula, updateData);
            if (!organizadorActualizado) {
                res.status(500).json({
                    success: false,
                    message: "Error al actualizar el organizador",
                });
                return;
            }
            res.json({
                success: true,
                message: "Organizador actualizado exitosamente",
                organizador: {
                    ced_org: organizadorActualizado.cedula,
                    nom_org1: organizadorActualizado.firstName,
                    nom_org2: organizadorActualizado.secondName,
                    ape_org1: organizadorActualizado.lastName,
                    ape_org2: organizadorActualizado.secondLastName,
                    tit_aca_org: organizadorActualizado.academicTitle,
                },
            });
        }
        catch (error) {
            console.error("[updateOrganizador] Error:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }
    /**
     * DELETE /api/organizadores/:cedula
     * Eliminar organizador (Admin only)
     */
    async deleteOrganizador(req, res) {
        try {
            const { cedula } = req.params;
            if (!cedula) {
                res.status(400).json({
                    success: false,
                    message: "Cédula es requerida",
                });
                return;
            }
            // Verificar que el organizador existe
            const existingOrganizer = await this.organizerRepository.findByCedula(cedula);
            if (!existingOrganizer) {
                res.status(404).json({
                    success: false,
                    message: "Organizador no encontrado",
                });
                return;
            }
            await this.organizerRepository.delete(cedula);
            res.json({
                success: true,
                message: "Organizador eliminado exitosamente",
            });
        }
        catch (error) {
            console.error("[deleteOrganizador] Error:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }
}
exports.OrganizerController = OrganizerController;
//# sourceMappingURL=OrganizerController.js.map