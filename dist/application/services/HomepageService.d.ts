/**
 * Homepage Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Lógica de negocio de Homepage
 * ✅ SOLID: Single Responsibility Principle
 * ✅ DIP: Dependency Inversion Principle - Depende de abstracciones
 */
import { DIContainer } from "../../infrastructure/DIContainer";
export interface HomepageContentRequest {
    titulo_hero?: string;
    subtitulo_hero?: string;
    descripcion_hero?: string;
    titulo_ofrecemos?: string;
    subtitulo_ofrecemos?: string;
    titulo_seccion1?: string;
    descripcion_seccion1?: string;
    titulo_seccion2?: string;
    descripcion_seccion2?: string;
    titulo_seccion3?: string;
    descripcion_seccion3?: string;
    titulo_seccion4?: string;
    descripcion_seccion4?: string;
    texto_footer1?: string;
    texto_footer2?: string;
    texto_footer3?: string;
    editor_id?: string;
}
export interface HomepageImageRequest {
    imageType: string;
    imageFile?: any;
    editor_id?: string;
}
export interface HomepageServiceResponse {
    success: boolean;
    message?: string;
    data?: any;
}
export declare class HomepageService {
    private container;
    constructor(container: DIContainer);
    /**
     * ✅ SRP: Obtener contenido de homepage
     */
    getHomepageContent(): Promise<HomepageServiceResponse>;
    /**
     * ✅ SRP: Actualizar contenido de homepage
     */
    updateHomepageContent(contentRequest: HomepageContentRequest): Promise<HomepageServiceResponse>;
    /**
     * ✅ SRP: Actualizar imagen de homepage
     */
    updateHomepageImage(imageRequest: HomepageImageRequest): Promise<HomepageServiceResponse>;
    /**
     * ✅ SRP: Obtener imagen de homepage
     */
    getHomepageImage(imageType: string): Promise<HomepageServiceResponse>;
    /**
     * ✅ SRP: Obtiene contenido público (eventos y cursos para usuarios no autenticados)
     */
    getPublicContent(): Promise<HomepageServiceResponse>;
    /**
     * ✅ SRP: Obtiene contenido para estudiantes (por carrera + públicos)
     */
    getStudentContent(userId: string): Promise<HomepageServiceResponse>;
    /**
     * ✅ SRP: Obtiene contenido para usuarios externos (solo públicos)
     */
    getExternalContent(): Promise<HomepageServiceResponse>;
}
//# sourceMappingURL=HomepageService.d.ts.map