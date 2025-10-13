export interface GenerateCertificateRequestDTO {
    usuarioId: number;
    eventoId?: number;
    cursoId?: number;
    tipo: "evento" | "curso";
}
export interface CertificateResponseDTO {
    id: number;
    usuario: {
        id: number;
        nombres: string;
        apellidos: string;
        cedula: string;
    };
    evento?: {
        id: number;
        nombre: string;
    };
    curso?: {
        id: number;
        nombre: string;
    };
    tipo: string;
    fechaGeneracion: Date;
    aprobado: boolean;
    pdfUrl?: string;
}
export interface CertificateListResponseDTO {
    certificates: CertificateResponseDTO[];
    total: number;
    page: number;
    pageSize: number;
}
export interface ApproveCertificateRequestDTO {
    certificadoId: number;
    aprobado: boolean;
    observaciones?: string;
}
export interface CertificateStatisticsDTO {
    totalGenerados: number;
    totalAprobados: number;
    totalPendientes: number;
    porEvento: {
        eventoId: number;
        eventoNombre: string;
        cantidad: number;
    }[];
    porCurso: {
        cursoId: number;
        cursoNombre: string;
        cantidad: number;
    }[];
}
export interface DownloadCertificateRequestDTO {
    usuarioId: number;
    certificadoId: number;
}
//# sourceMappingURL=CertificateDTO.d.ts.map