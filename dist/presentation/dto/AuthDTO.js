"use strict";
/**
 * Auth DTO - Presentation Layer
 *
 * ✅ SRP: Responsabilidad única - Transformaciones de datos de autenticación
 * Separado de AuthController para cumplir Single Responsibility Principle
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthDTOTransformer = void 0;
/**
 * Auth DTO Transformer
 * ✅ SRP: Solo transformación entre DTOs y requests del dominio
 */
class AuthDTOTransformer {
    /**
     * ✅ SRP: Convertir LoginRequestDTO a formato del servicio
     */
    static fromLoginDTO(dto) {
        return {
            email: dto.email,
            password: dto.password,
        };
    }
    /**
     * ✅ SRP: Convertir RegisterRequestDTO a formato del servicio
     */
    static fromRegisterDTO(dto) {
        return {
            email: dto.email,
            password: dto.password,
            nombre: dto.nombre,
            nombre2: dto.nombre2,
            apellido: dto.apellido,
            apellido2: dto.apellido2,
            ced_usu: dto.ced_usu,
            fec_nac_usu: dto.fec_nac_usu ? new Date(dto.fec_nac_usu) : undefined,
            carrera: dto.carrera,
        };
    }
    /**
     * ✅ SRP: Convertir CreateAdminRequestDTO a formato del servicio
     */
    static fromCreateAdminDTO(dto) {
        return {
            ced_usu: dto.ced_usu,
            nom_usu1: dto.nom_usu1,
            nom_usu2: dto.nom_usu2,
            ape_usu1: dto.ape_usu1,
            ape_usu2: dto.ape_usu2,
            cor_cue: dto.cor_cue,
            pas_usu: dto.pas_usu,
            fec_nac_usu: dto.fec_nac_usu ? new Date(dto.fec_nac_usu) : undefined,
            num_tel_usu: dto.num_tel_usu,
        };
    }
    /**
     * ✅ SRP: Convertir respuesta del servicio a DTO de respuesta
     */
    static toResponseDTO(serviceResponse) {
        return {
            success: serviceResponse.success,
            token: serviceResponse.token,
            user: serviceResponse.user,
            message: serviceResponse.message,
        };
    }
    /**
     * ✅ SRP: Validar campos básicos de entrada
     */
    static validateBasicFields(dto) {
        // Validaciones básicas de tipos - las específicas están en el validator
        if (dto.email !== undefined && typeof dto.email !== "string") {
            throw new Error("Email debe ser una cadena de texto");
        }
        if (dto.password !== undefined && typeof dto.password !== "string") {
            throw new Error("Password debe ser una cadena de texto");
        }
        if (dto.ced_usu !== undefined && typeof dto.ced_usu !== "string") {
            throw new Error("Cédula debe ser una cadena de texto");
        }
    }
}
exports.AuthDTOTransformer = AuthDTOTransformer;
//# sourceMappingURL=AuthDTO.js.map