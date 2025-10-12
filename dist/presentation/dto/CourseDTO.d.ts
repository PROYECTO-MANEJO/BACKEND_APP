export interface CreateCourseRequestDTO {
    nombre: string;
    descripcion: string;
    carreraIds: number[];
    fechaInicio: Date;
    fechaFin: Date;
    precio: number;
    capacidadMaxima: number;
    modalidad: "presencial" | "virtual" | "hibrida";
    estado?: boolean;
}
export interface UpdateCourseRequestDTO {
    nombre?: string;
    descripcion?: string;
    carreraIds?: number[];
    fechaInicio?: Date;
    fechaFin?: Date;
    precio?: number;
    capacidadMaxima?: number;
    modalidad?: "presencial" | "virtual" | "hibrida";
    estado?: boolean;
}
export interface CourseResponseDTO {
    id: number;
    nombre: string;
    descripcion: string;
    carreras: CareerSummaryDTO[];
    fechaInicio: Date;
    fechaFin: Date;
    precio: number;
    capacidadMaxima: number;
    inscritosActuales: number;
    modalidad: string;
    estado: boolean;
    fechaCreacion: Date;
}
export interface CareerSummaryDTO {
    id: number;
    nombre: string;
}
export interface CourseListResponseDTO {
    courses: CourseResponseDTO[];
    total: number;
    page: number;
    pageSize: number;
}
export interface EnrollCourseRequestDTO {
    usuarioId: number;
    cursoId: number;
    metodoPago: string;
}
export interface CourseEnrollmentResponseDTO {
    id: number;
    usuario: {
        id: number;
        nombres: string;
        apellidos: string;
        email: string;
    };
    curso: {
        id: number;
        nombre: string;
    };
    fechaInscripcion: Date;
    estadoPago: string;
    certificadoGenerado: boolean;
}
//# sourceMappingURL=CourseDTO.d.ts.map