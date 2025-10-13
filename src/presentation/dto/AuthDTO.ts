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
export class AuthDTOTransformer {
  /**
   * ✅ SRP: Convertir LoginRequestDTO a formato del servicio
   */
  public static fromLoginDTO(dto: LoginRequestDTO) {
    return {
      email: dto.email,
      password: dto.password,
    };
  }

  /**
   * ✅ SRP: Convertir RegisterRequestDTO a formato del servicio
   */
  public static fromRegisterDTO(dto: RegisterRequestDTO) {
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
  public static fromCreateAdminDTO(dto: CreateAdminRequestDTO) {
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
  public static toResponseDTO(serviceResponse: any): AuthResponseDTO {
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
  public static validateBasicFields(dto: any): void {
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
