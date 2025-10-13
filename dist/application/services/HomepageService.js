"use strict";
/**
 * Homepage Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Lógica de negocio de Homepage
 * ✅ SOLID: Single Responsibility Principle
 * ✅ DIP: Dependency Inversion Principle - Depende de abstracciones
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomepageService = void 0;
const HomepageValidator_1 = require("../../domain/validators/HomepageValidator");
class HomepageService {
    constructor(container) {
        this.container = container;
    }
    /**
     * ✅ SRP: Obtener contenido de homepage
     */
    async getHomepageContent() {
        try {
            const homepageRepository = this.container.getHomepageRepository();
            // Buscar contenido existente o crear por defecto
            let homepageContent = await homepageRepository.getContent();
            if (!homepageContent) {
                homepageContent = await homepageRepository.createDefaultContent();
            }
            // Transformar entidad del dominio a respuesta
            const sections = homepageContent.getSections();
            const footerTexts = homepageContent.getFooterTexts();
            const images = homepageContent.getImages();
            const lastEditor = homepageContent.getLastEditor();
            const response = {
                id_pag: parseInt(homepageContent.getId()),
                titulo_hero: homepageContent.getHeroTitle(),
                subtitulo_hero: homepageContent.getHeroSubtitle(),
                descripcion_hero: homepageContent.getHeroDescription(),
                titulo_ofrecemos: homepageContent.getOfferTitle(),
                subtitulo_ofrecemos: homepageContent.getOfferSubtitle(),
                titulo_seccion1: sections[0]?.title || "",
                descripcion_seccion1: sections[0]?.description || "",
                titulo_seccion2: sections[1]?.title || "",
                descripcion_seccion2: sections[1]?.description || "",
                titulo_seccion3: sections[2]?.title || "",
                descripcion_seccion3: sections[2]?.description || "",
                titulo_seccion4: sections[3]?.title || "",
                descripcion_seccion4: sections[3]?.description || "",
                texto_footer1: footerTexts.text1,
                texto_footer2: footerTexts.text2,
                texto_footer3: footerTexts.text3,
                imagen_hero: images.hero
                    ? `/api/homepage/image/hero?t=${Date.now()}`
                    : undefined,
                imagen_seccion1: images.seccion1
                    ? `/api/homepage/image/seccion1?t=${Date.now()}`
                    : undefined,
                imagen_seccion2: images.seccion2
                    ? `/api/homepage/image/seccion2?t=${Date.now()}`
                    : undefined,
                imagen_seccion3: images.seccion3
                    ? `/api/homepage/image/seccion3?t=${Date.now()}`
                    : undefined,
                imagen_seccion4: images.seccion4
                    ? `/api/homepage/image/seccion4?t=${Date.now()}`
                    : undefined,
                ultimoEditor: lastEditor.name
                    ? {
                        nom_usu1: lastEditor.name.split(" ")[0] || "",
                        ape_usu1: lastEditor.name.split(" ")[1] || "",
                    }
                    : undefined,
                fecha_actualizacion: homepageContent.getLastUpdateDate(),
                fecha_creacion: homepageContent.getCreatedAt(),
            };
            return {
                success: true,
                data: response,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Error al obtener el contenido de la homepage",
            };
        }
    }
    /**
     * ✅ SRP: Actualizar contenido de homepage
     */
    async updateHomepageContent(contentRequest) {
        try {
            // ✅ SRP: Delegar validación al HomepageValidator
            HomepageValidator_1.HomepageValidator.validateContentUpdate(contentRequest);
            const homepageRepository = this.container.getHomepageRepository();
            // Actualizar contenido (convertir a formato esperado por el repositorio)
            const contentData = {
                heroTitle: contentRequest.titulo_hero,
                heroSubtitle: contentRequest.subtitulo_hero,
                heroDescription: contentRequest.descripcion_hero,
                offerTitle: contentRequest.titulo_ofrecemos,
                offerSubtitle: contentRequest.subtitulo_ofrecemos,
                footerText1: contentRequest.texto_footer1,
                footerText2: contentRequest.texto_footer2,
                footerText3: contentRequest.texto_footer3,
                sections: [
                    ...(contentRequest.titulo_seccion1
                        ? [
                            {
                                id: "1",
                                title: contentRequest.titulo_seccion1,
                                description: contentRequest.descripcion_seccion1 || "",
                                order: 1,
                                isVisible: true,
                            },
                        ]
                        : []),
                    ...(contentRequest.titulo_seccion2
                        ? [
                            {
                                id: "2",
                                title: contentRequest.titulo_seccion2,
                                description: contentRequest.descripcion_seccion2 || "",
                                order: 2,
                                isVisible: true,
                            },
                        ]
                        : []),
                    ...(contentRequest.titulo_seccion3
                        ? [
                            {
                                id: "3",
                                title: contentRequest.titulo_seccion3,
                                description: contentRequest.descripcion_seccion3 || "",
                                order: 3,
                                isVisible: true,
                            },
                        ]
                        : []),
                    ...(contentRequest.titulo_seccion4
                        ? [
                            {
                                id: "4",
                                title: contentRequest.titulo_seccion4,
                                description: contentRequest.descripcion_seccion4 || "",
                                order: 4,
                                isVisible: true,
                            },
                        ]
                        : []),
                ],
            };
            const updatedContent = await homepageRepository.updateContent(contentData, contentRequest.editor_id || "");
            return {
                success: true,
                message: "Contenido actualizado exitosamente",
                data: updatedContent,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Error al actualizar el contenido",
            };
        }
    }
    /**
     * ✅ SRP: Actualizar imagen de homepage
     */
    async updateHomepageImage(imageRequest) {
        try {
            // ✅ SRP: Delegar validación al HomepageValidator
            HomepageValidator_1.HomepageValidator.validateImageUpdate(imageRequest.imageType, imageRequest.imageFile);
            const homepageRepository = this.container.getHomepageRepository();
            // Actualizar imagen
            await homepageRepository.updateImage(imageRequest.imageType, imageRequest.imageFile.buffer, imageRequest.imageFile.mimetype, imageRequest.editor_id || "");
            return {
                success: true,
                message: "Imagen actualizada exitosamente",
                data: null,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Error al actualizar la imagen",
            };
        }
    }
    /**
     * ✅ SRP: Obtener imagen de homepage
     */
    async getHomepageImage(imageType) {
        try {
            // ✅ SRP: Validar tipo de imagen
            const validImageTypes = [
                "hero",
                "seccion1",
                "seccion2",
                "seccion3",
                "seccion4",
            ];
            if (!validImageTypes.includes(imageType)) {
                return {
                    success: false,
                    message: `Tipo de imagen no válido. Debe ser uno de: ${validImageTypes.join(", ")}`,
                };
            }
            const homepageRepository = this.container.getHomepageRepository();
            const imageSection = await homepageRepository.getImageByType(imageType);
            if (!imageSection || !imageSection.buffer) {
                return {
                    success: false,
                    message: "Imagen no encontrada",
                };
            }
            return {
                success: true,
                data: imageSection.buffer,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Error al obtener la imagen",
            };
        }
    }
    /**
     * ✅ SRP: Obtiene contenido público (eventos y cursos para usuarios no autenticados)
     */
    async getPublicContent() {
        try {
            // ✅ SRP: Obtener cliente Prisma del container (patrón establecido en este servicio)
            const prisma = this.container.getPrismaClient();
            // Obtener todos los eventos activos
            const eventos = await prisma.evento.findMany({
                where: {
                    estado: "ACTIVO",
                },
                select: {
                    id_eve: true,
                    nom_eve: true,
                    des_eve: true,
                    fec_ini_eve: true,
                    fec_fin_eve: true,
                    hor_ini_eve: true,
                    hor_fin_eve: true,
                    ubi_eve: true,
                    dur_eve: true,
                    capacidad_max_eve: true,
                    es_gratuito: true,
                    precio: true,
                    tipo_audiencia_eve: true,
                    categoria: {
                        select: {
                            nom_cat: true,
                        },
                    },
                    eventosPorCarrera: {
                        select: {
                            carrera: {
                                select: {
                                    nom_car: true,
                                },
                            },
                        },
                    },
                    inscripciones: {
                        where: {
                            estado_pago: "APROBADO",
                        },
                        select: {
                            id_ins: true,
                        },
                    },
                },
                orderBy: {
                    fec_ini_eve: "asc",
                },
                take: 8,
            });
            // Obtener todos los cursos activos
            const cursos = await prisma.curso.findMany({
                where: {
                    estado: "ACTIVO",
                },
                select: {
                    id_cur: true,
                    nom_cur: true,
                    des_cur: true,
                    fec_ini_cur: true,
                    fec_fin_cur: true,
                    dur_cur: true,
                    capacidad_max_cur: true,
                    es_gratuito: true,
                    precio: true,
                    tipo_audiencia_cur: true,
                    requiere_verificacion_docs: true,
                    categoria: {
                        select: {
                            nom_cat: true,
                        },
                    },
                    cursosPorCarrera: {
                        select: {
                            carrera: {
                                select: {
                                    nom_car: true,
                                },
                            },
                        },
                    },
                    inscripcionesCurso: {
                        where: {
                            estado_pago_cur: "APROBADO",
                        },
                        select: {
                            id_ins_cur: true,
                        },
                    },
                },
                orderBy: {
                    fec_ini_cur: "asc",
                },
                take: 8,
            });
            return {
                success: true,
                data: {
                    eventos,
                    cursos,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Error al obtener contenido público",
            };
        }
    }
    /**
     * ✅ SRP: Obtiene contenido para estudiantes (por carrera + públicos)
     */
    async getStudentContent(userId) {
        try {
            const prisma = this.container.getPrismaClient();
            // Obtener la carrera del usuario
            const usuario = await prisma.usuario.findUnique({
                where: { id_usu: userId },
                select: {
                    id_car_per: true,
                    carrera: {
                        select: {
                            nom_car: true,
                        },
                    },
                },
            });
            // Si el usuario no tiene carrera asignada, mostrar solo contenido público
            if (!usuario || !usuario.id_car_per) {
                // Obtener eventos públicos y para todas las carreras
                const eventosPublicos = await prisma.evento.findMany({
                    where: {
                        estado: "ACTIVO",
                        OR: [
                            { tipo_audiencia_eve: "PUBLICO_GENERAL" },
                            { tipo_audiencia_eve: "TODAS_CARRERAS" },
                        ],
                        fec_fin_eve: {
                            gte: new Date(),
                        },
                    },
                    include: {
                        categoria: {
                            select: {
                                nom_cat: true,
                            },
                        },
                    },
                    orderBy: { fec_ini_eve: "asc" },
                });
                // Obtener cursos públicos y para todas las carreras
                const cursosPublicos = await prisma.curso.findMany({
                    where: {
                        estado: "ACTIVO",
                        OR: [
                            { tipo_audiencia_cur: "PUBLICO_GENERAL" },
                            { tipo_audiencia_cur: "TODAS_CARRERAS" },
                        ],
                        fec_fin_cur: {
                            gte: new Date(),
                        },
                    },
                    include: {
                        categoria: {
                            select: {
                                nom_cat: true,
                            },
                        },
                    },
                    orderBy: { fec_ini_cur: "asc" },
                });
                return {
                    success: true,
                    data: {
                        eventos: eventosPublicos.map((evento) => ({
                            id_eve: evento.id_eve,
                            nom_eve: evento.nom_eve,
                            des_eve: evento.des_eve,
                            fec_ini_eve: evento.fec_ini_eve,
                            fec_fin_eve: evento.fec_fin_eve,
                            hor_ini_eve: evento.hor_ini_eve,
                            hor_fin_eve: evento.hor_fin_eve,
                            ubi_eve: evento.ubi_eve,
                            capacidad_max_eve: evento.capacidad_max_eve,
                            es_gratuito: evento.es_gratuito,
                            precio: evento.precio,
                            categoria: evento.categoria?.nom_cat,
                            tipo_audiencia: evento.tipo_audiencia_eve,
                        })),
                        cursos: cursosPublicos.map((curso) => ({
                            id_cur: curso.id_cur,
                            nom_cur: curso.nom_cur,
                            des_cur: curso.des_cur,
                            fec_ini_cur: curso.fec_ini_cur,
                            fec_fin_cur: curso.fec_fin_cur,
                            dur_cur: curso.dur_cur,
                            capacidad_max_cur: curso.capacidad_max_cur,
                            es_gratuito: curso.es_gratuito,
                            precio: curso.precio,
                            categoria: curso.categoria?.nom_cat,
                            tipo_audiencia: curso.tipo_audiencia_cur,
                        })),
                        carrera: null,
                        mensaje: "Mostrando contenido público y para todas las carreras (usuario sin carrera asignada)",
                    },
                };
            }
            // Obtener eventos para el estudiante
            const eventos = await prisma.evento.findMany({
                where: {
                    estado: "ACTIVO",
                    OR: [
                        { tipo_audiencia_eve: "PUBLICO_GENERAL" },
                        { tipo_audiencia_eve: "TODAS_CARRERAS" },
                        {
                            AND: [
                                { tipo_audiencia_eve: "CARRERA_ESPECIFICA" },
                                {
                                    eventosPorCarrera: {
                                        some: {
                                            id_car_per: usuario.id_car_per,
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
                select: {
                    id_eve: true,
                    nom_eve: true,
                    des_eve: true,
                    fec_ini_eve: true,
                    fec_fin_eve: true,
                    hor_ini_eve: true,
                    hor_fin_eve: true,
                    ubi_eve: true,
                    dur_eve: true,
                    capacidad_max_eve: true,
                    es_gratuito: true,
                    precio: true,
                    tipo_audiencia_eve: true,
                    categoria: {
                        select: {
                            nom_cat: true,
                        },
                    },
                    eventosPorCarrera: {
                        select: {
                            carrera: {
                                select: {
                                    nom_car: true,
                                },
                            },
                        },
                    },
                    inscripciones: {
                        where: {
                            estado_pago: "APROBADO",
                        },
                        select: {
                            id_ins: true,
                        },
                    },
                },
                orderBy: {
                    fec_ini_eve: "asc",
                },
            });
            // Obtener cursos para el estudiante
            const cursos = await prisma.curso.findMany({
                where: {
                    estado: "ACTIVO",
                    OR: [
                        { tipo_audiencia_cur: "PUBLICO_GENERAL" },
                        { tipo_audiencia_cur: "TODAS_CARRERAS" },
                        {
                            AND: [
                                { tipo_audiencia_cur: "CARRERA_ESPECIFICA" },
                                {
                                    cursosPorCarrera: {
                                        some: {
                                            id_car_per: usuario.id_car_per,
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
                select: {
                    id_cur: true,
                    nom_cur: true,
                    des_cur: true,
                    fec_ini_cur: true,
                    fec_fin_cur: true,
                    dur_cur: true,
                    capacidad_max_cur: true,
                    es_gratuito: true,
                    precio: true,
                    tipo_audiencia_cur: true,
                    requiere_verificacion_docs: true,
                    categoria: {
                        select: {
                            nom_cat: true,
                        },
                    },
                    cursosPorCarrera: {
                        select: {
                            carrera: {
                                select: {
                                    nom_car: true,
                                },
                            },
                        },
                    },
                    inscripcionesCurso: {
                        where: {
                            estado_pago_cur: "APROBADO",
                        },
                        select: {
                            id_ins_cur: true,
                        },
                    },
                },
                orderBy: {
                    fec_ini_cur: "asc",
                },
            });
            return {
                success: true,
                data: {
                    eventos,
                    cursos,
                    carrera: usuario.carrera?.nom_car,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Error al obtener contenido para estudiantes",
            };
        }
    }
    /**
     * ✅ SRP: Obtiene contenido para usuarios externos (solo públicos)
     */
    async getExternalContent() {
        try {
            const prisma = this.container.getPrismaClient();
            // Eventos públicos y para todas las carreras para usuarios externos
            const eventos = await prisma.evento.findMany({
                where: {
                    estado: "ACTIVO",
                    OR: [
                        { tipo_audiencia_eve: "PUBLICO_GENERAL" },
                        { tipo_audiencia_eve: "TODAS_CARRERAS" },
                    ],
                    fec_ini_eve: {
                        gte: new Date(),
                    },
                },
                select: {
                    id_eve: true,
                    nom_eve: true,
                    des_eve: true,
                    fec_ini_eve: true,
                    fec_fin_eve: true,
                    hor_ini_eve: true,
                    hor_fin_eve: true,
                    ubi_eve: true,
                    dur_eve: true,
                    capacidad_max_eve: true,
                    es_gratuito: true,
                    precio: true,
                    tipo_audiencia_eve: true,
                    categoria: {
                        select: {
                            nom_cat: true,
                        },
                    },
                    eventosPorCarrera: {
                        select: {
                            carrera: {
                                select: {
                                    nom_car: true,
                                },
                            },
                        },
                    },
                    inscripciones: {
                        where: {
                            estado_pago: "APROBADO",
                        },
                        select: {
                            id_ins: true,
                        },
                    },
                },
                orderBy: {
                    fec_ini_eve: "asc",
                },
            });
            // Cursos públicos y para todas las carreras para usuarios externos
            const cursos = await prisma.curso.findMany({
                where: {
                    estado: "ACTIVO",
                    OR: [
                        { tipo_audiencia_cur: "PUBLICO_GENERAL" },
                        { tipo_audiencia_cur: "TODAS_CARRERAS" },
                    ],
                    fec_ini_cur: {
                        gte: new Date(),
                    },
                },
                select: {
                    id_cur: true,
                    nom_cur: true,
                    des_cur: true,
                    fec_ini_cur: true,
                    fec_fin_cur: true,
                    dur_cur: true,
                    capacidad_max_cur: true,
                    es_gratuito: true,
                    precio: true,
                    tipo_audiencia_cur: true,
                    requiere_verificacion_docs: true,
                    categoria: {
                        select: {
                            nom_cat: true,
                        },
                    },
                    cursosPorCarrera: {
                        select: {
                            carrera: {
                                select: {
                                    nom_car: true,
                                },
                            },
                        },
                    },
                    inscripcionesCurso: {
                        where: {
                            estado_pago_cur: "APROBADO",
                        },
                        select: {
                            id_ins_cur: true,
                        },
                    },
                },
                orderBy: {
                    fec_ini_cur: "asc",
                },
            });
            return {
                success: true,
                data: {
                    eventos,
                    cursos,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Error al obtener contenido externo",
            };
        }
    }
}
exports.HomepageService = HomepageService;
//# sourceMappingURL=HomepageService.js.map