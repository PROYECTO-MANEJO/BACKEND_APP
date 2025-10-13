/**
 * Homepage Service - Application Layer
 *
 * ✅ SRP: Single Responsibility Principle - Solo maneja lógica de negocio de Homepage
 * ✅ OCP: Open/Closed Principle - Abierto para extensión (nuevos métodos), cerrado para modificación
 * ✅ LSP: Liskov Substitution Principle - Implementa contratos consistentes
 * ✅ ISP: Interface Segregation Principle - Usa interfaces específicas del dominio
 * ✅ DIP: Dependency Inversion Principle - Depende de abstracciones (DIContainer, repositorios)
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
/**
 * ✅ OCP: Clase abierta para extensión (nuevos métodos), cerrada para modificación
 * ✅ DIP: Recibe dependencias por inyección, no las crea internamente
 */
export declare class HomepageService {
    private container;
    constructor(container: DIContainer);
    /**
     * ✅ SRP: Obtener contenido de homepage
     * ✅ LSP: Retorna HomepageServiceResponse consistente con el contrato
     * ✅ OCP: Método extensible sin modificar la clase base
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
     * ✅ LSP: Retorna HomepageServiceResponse consistente
     * ✅ OCP: Método extensible para nuevos tipos de contenido público
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