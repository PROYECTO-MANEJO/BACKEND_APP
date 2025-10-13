/**
 * Auth DTO - Presentation Layer
 *
 * ✅ SRP: Responsabilidad única - Transformaciones de datos de autenticación
 * Separado de AuthController para cumplir Single Responsibility Principle
 */
export interface LoginRequestDTO {
    email: string;
    password: string;
}
export interface RegisterRequestDTO {
    email: string;
    password: string;
    nombre: string;
    nombre2?: string;
    apellido: string;
    apellido2?: string;
    ced_usu: string;
    fec_nac_usu?: string;
    carrera?: string;
}
export interface CreateAdminRequestDTO {
    ced_usu: string;
    nom_usu1: string;
    nom_usu2?: string;
    ape_usu1: string;
    ape_usu2?: string;
    cor_cue: string;
    pas_usu: string;
    fec_nac_usu?: string;
    num_tel_usu?: string;
}
export interface AuthResponseDTO {
    success: boolean;
    token?: string;
    user?: any;
    message?: string;
}
/**
 * Auth DTO Transformer
 * ✅ SRP: Solo transformación entre DTOs y requests del dominio
 */
export declare class AuthDTOTransformer {
    /**
     * ✅ SRP: Convertir LoginRequestDTO a formato del servicio
     */
    static fromLoginDTO(dto: LoginRequestDTO): {
        email: string;
        password: string;
    };
    /**
     * ✅ SRP: Convertir RegisterRequestDTO a formato del servicio
     */
    static fromRegisterDTO(dto: RegisterRequestDTO): {
        email: string;
        password: string;
        nombre: string;
        nombre2: string | undefined;
        apellido: string;
        apellido2: string | undefined;
        ced_usu: string;
        fec_nac_usu: Date | undefined;
        carrera: string | undefined;
    };
    /**
     * ✅ SRP: Convertir CreateAdminRequestDTO a formato del servicio
     */
    static fromCreateAdminDTO(dto: CreateAdminRequestDTO): {
        ced_usu: string;
        nom_usu1: string;
        nom_usu2: string | undefined;
        ape_usu1: string;
        ape_usu2: string | undefined;
        cor_cue: string;
        pas_usu: string;
        fec_nac_usu: Date | undefined;
        num_tel_usu: string | undefined;
    };
    /**
     * ✅ SRP: Convertir respuesta del servicio a DTO de respuesta
     */
    static toResponseDTO(serviceResponse: any): AuthResponseDTO;
    /**
     * ✅ SRP: Validar campos básicos de entrada
     */
    static validateBasicFields(dto: any): void;
}
//# sourceMappingURL=AuthDTO.d.ts.map