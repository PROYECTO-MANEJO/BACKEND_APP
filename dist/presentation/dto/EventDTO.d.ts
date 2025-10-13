/**
 * Event DTOs - Presentation Layer
 *
 * Responsabilidad única: Transformación y formateo de datos de eventos
 * Aplica SRP separando las transformaciones del controlador
 */
import { Event } from "../../domain/entities/Event";
export interface EventResponseDTO {
    id_eve: string;
    nom_eve: string;
    des_eve: string;
    fec_ini_eve: Date;
    fec_fin_eve?: Date | null;
    hor_ini_eve: Date;
    hor_fin_eve?: Date | null;
    dur_eve: number;
    are_eve: string;
    ubi_eve: string;
    capacidad_max_eve: number;
    precio?: number | null;
    es_gratuito: boolean;
    tipo_audiencia_eve: string;
    porcentaje_asistencia_aprobacion: number;
    estado: string;
}
export interface CreateEventDTO {
    nom_eve: string;
    des_eve: string;
    id_cat_eve: number;
    fec_ini_eve: string;
    fec_fin_eve?: string;
    hor_ini_eve: string;
    hor_fin_eve?: string;
    dur_eve: number;
    are_eve: string;
    ubi_eve: string;
    ced_org_eve: string;
    capacidad_max_eve: number;
    tipo_audiencia_eve?: string;
    es_gratuito?: boolean;
    precio?: number;
    porcentaje_asistencia_aprobacion: number;
    carreras?: string[];
}
export declare class EventDTOTransformer {
    /**
     * Convertir Event entity a ResponseDTO
     */
    static toResponseDTO(event: Event): EventResponseDTO;
    /**
     * Convertir múltiples Events a ResponseDTOs
     */
    static toResponseDTOList(events: Event[]): EventResponseDTO[];
    /**
     * Convertir DTO de entrada a datos del dominio
     */
    static fromCreateDTO(dto: CreateEventDTO): {
        nom_eve: string;
        des_eve: string;
        id_cat_eve: number;
        fec_ini_eve: Date;
        fec_fin_eve: Date | undefined;
        hor_ini_eve: Date;
        hor_fin_eve: Date | undefined;
        dur_eve: number;
        are_eve: string;
        ubi_eve: string;
        ced_org_eve: string;
        capacidad_max_eve: number;
        tipo_audiencia_eve: string;
        es_gratuito: boolean;
        precio: number;
        porcentaje_asistencia_aprobacion: number;
        carreras: string[] | undefined;
    };
    /**
     * Convertir string de hora a objeto Date
     */
    private static convertTimeStringToDate;
    /**
     * Validar formato de fecha
     */
    static validateDateFormat(dateString: string): Date;
    /**
     * Validar tipos de datos básicos
     */
    static validateBasicTypes(dto: CreateEventDTO): void;
}
//# sourceMappingURL=EventDTO.d.ts.map