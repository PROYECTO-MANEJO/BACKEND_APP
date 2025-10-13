// DTOs para el sistema de eventos

export interface CreateEventRequestDTO {
  nombre: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  area: string;
  audiencia: string;
  capacidadMaxima: number;
  carreraIds: number[];
  precio?: number;
  modalidad: "presencial" | "virtual" | "hibrida";
  estado?: boolean;
}

export interface UpdateEventRequestDTO {
  nombre?: string;
  descripcion?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  area?: string;
  audiencia?: string;
  capacidadMaxima?: number;
  carreraIds?: number[];
  precio?: number;
  modalidad?: "presencial" | "virtual" | "hibrida";
  estado?: boolean;
}

export interface EventResponseDTO {
  id: number;
  nombre: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  area: string;
  audiencia: string;
  capacidadMaxima: number;
  inscritosActuales: number;
  precio: number;
  modalidad: string;
  estado: boolean;
  carreras: CareerSummaryDTO[];
  fechaCreacion: Date;
}

import { CareerSummaryDTO } from '../common/CareerDTO';

export type { CareerSummaryDTO };

export interface EventListResponseDTO {
  events: EventResponseDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EnrollEventRequestDTO {
  usuarioId: number;
  eventoId: number;
  metodoPago?: string;
}

export interface EventEnrollmentResponseDTO {
  id: number;
  usuario: {
    id: number;
    nombres: string;
    apellidos: string;
    email: string;
  };
  evento: {
    id: number;
    nombre: string;
  };
  fechaInscripcion: Date;
  estadoPago: string;
  certificadoGenerado: boolean;
}
