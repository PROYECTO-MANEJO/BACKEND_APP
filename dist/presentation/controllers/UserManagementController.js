"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagementController = void 0;
const tslib_1 = require("tslib");
const BaseController_1 = require("./BaseController");
const bcrypt_1 = tslib_1.__importDefault(require("bcrypt"));
class UserManagementController extends BaseController_1.BaseController {
    constructor(container) {
        super();
        this.container = container;
    }
    /**
     * GET /api/admin/users
     * Obtener todos los usuarios con paginación y filtros
     */
    async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
            const prisma = this.container.getPrismaClient();
            const skip = (Number(page) - 1) * Number(limit);
            // Construir filtros dinámicos
            const where = {};
            if (search) {
                where.OR = [
                    { nom_usu1: { contains: search, mode: 'insensitive' } },
                    { ape_usu1: { contains: search, mode: 'insensitive' } },
                    { ced_usu: { contains: search } },
                    {
                        cuentas: {
                            some: {
                                cor_cue: { contains: search, mode: 'insensitive' }
                            }
                        }
                    }
                ];
            }
            if (role) {
                where.cuentas = {
                    some: {
                        rol_cue: role
                    }
                };
            }
            if (status) {
                where.documentos_verificados = status === 'verified';
            }
            const [usuarios, total] = await Promise.all([
                prisma.usuario.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    include: {
                        cuentas: {
                            select: {
                                cor_cue: true,
                                rol_cue: true
                            }
                        },
                        carrera: {
                            select: {
                                nom_car: true
                            }
                        }
                    },
                    orderBy: [
                        { ape_usu1: 'asc' },
                        { nom_usu1: 'asc' }
                    ]
                }),
                prisma.usuario.count({ where })
            ]);
            const usuariosFormateados = usuarios.map(usuario => ({
                id_usu: usuario.id_usu,
                ced_usu: usuario.ced_usu,
                nom_usu1: usuario.nom_usu1,
                nom_usu2: usuario.nom_usu2,
                ape_usu1: usuario.ape_usu1,
                ape_usu2: usuario.ape_usu2,
                fec_nac_usu: usuario.fec_nac_usu,
                num_tel_usu: usuario.num_tel_usu,
                documentos_verificados: usuario.documentos_verificados,
                fec_verificacion_docs: usuario.fec_verificacion_docs,
                nombre_completo: `${usuario.nom_usu1} ${usuario.nom_usu2 || ''} ${usuario.ape_usu1} ${usuario.ape_usu2 || ''}`.trim(),
                cuenta: usuario.cuentas[0] || null,
                carrera: usuario.carrera?.nom_car || null,
                cedula_aprobada: usuario.cedula_aprobada,
                matricula_aprobada: usuario.matricula_aprobada,
                github_username: usuario.github_username
            }));
            res.json({
                success: true,
                usuarios: usuariosFormateados,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        }
        catch (error) {
            console.error('[getAllUsers] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * GET /api/admin/users/:cedula
     * Obtener usuario específico por cédula
     */
    async getUserByCedula(req, res) {
        try {
            const { cedula } = req.params;
            const prisma = this.container.getPrismaClient();
            const usuario = await prisma.usuario.findUnique({
                where: { ced_usu: cedula },
                include: {
                    cuentas: true,
                    carrera: true,
                    inscripciones: {
                        include: {
                            evento: {
                                select: {
                                    nom_eve: true,
                                    fec_ini_eve: true
                                }
                            }
                        }
                    },
                    inscripcionesCurso: {
                        include: {
                            curso: {
                                select: {
                                    nom_cur: true,
                                    fec_ini_cur: true
                                }
                            }
                        }
                    }
                }
            });
            if (!usuario) {
                res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
                return;
            }
            const usuarioDetallado = {
                id_usu: usuario.id_usu,
                ced_usu: usuario.ced_usu,
                nom_usu1: usuario.nom_usu1,
                nom_usu2: usuario.nom_usu2,
                ape_usu1: usuario.ape_usu1,
                ape_usu2: usuario.ape_usu2,
                fec_nac_usu: usuario.fec_nac_usu,
                num_tel_usu: usuario.num_tel_usu,
                documentos_verificados: usuario.documentos_verificados,
                fec_verificacion_docs: usuario.fec_verificacion_docs,
                nombre_completo: `${usuario.nom_usu1} ${usuario.nom_usu2 || ''} ${usuario.ape_usu1} ${usuario.ape_usu2 || ''}`.trim(),
                cuenta: usuario.cuentas[0] || null,
                carrera: usuario.carrera,
                cedula_aprobada: usuario.cedula_aprobada,
                matricula_aprobada: usuario.matricula_aprobada,
                github_username: usuario.github_username,
                estadisticas: {
                    total_inscripciones_eventos: usuario.inscripciones.length,
                    total_inscripciones_cursos: usuario.inscripcionesCurso.length,
                    inscripciones_recientes: [
                        ...usuario.inscripciones.map(ins => ({
                            tipo: 'evento',
                            nombre: ins.evento.nom_eve,
                            fecha: ins.fec_ins,
                            estado: ins.estado_pago
                        })),
                        ...usuario.inscripcionesCurso.map(ins => ({
                            tipo: 'curso',
                            nombre: ins.curso.nom_cur,
                            fecha: ins.fec_ins_cur,
                            estado: ins.estado_pago_cur
                        }))
                    ].sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, 5)
                }
            };
            res.json({
                success: true,
                usuario: usuarioDetallado
            });
        }
        catch (error) {
            console.error('[getUserByCedula] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * POST /api/admin/users
     * Crear nuevo usuario (solo MASTER)
     */
    async createUser(req, res) {
        try {
            const { ced_usu, nom_usu1, nom_usu2, ape_usu1, ape_usu2, fec_nac_usu, num_tel_usu, cor_cue, pas_usu, rol_cue, id_car_per } = req.body;
            const prisma = this.container.getPrismaClient();
            // Verificar que el usuario actual es MASTER
            const usuarioActual = await prisma.usuario.findUnique({
                where: { id_usu: req.usuario?.id_usu || req.uid },
                include: { cuentas: true }
            });
            if (!usuarioActual || usuarioActual.cuentas[0]?.rol_cue !== 'MASTER') {
                res.status(403).json({
                    success: false,
                    message: 'Solo los usuarios MASTER pueden crear nuevos usuarios'
                });
                return;
            }
            // Validaciones básicas
            if (!ced_usu || !nom_usu1 || !ape_usu1 || !cor_cue || !pas_usu || !rol_cue) {
                res.status(400).json({
                    success: false,
                    message: 'Campos obligatorios: cédula, primer nombre, primer apellido, email, contraseña y rol'
                });
                return;
            }
            // Verificar que la cédula no exista
            const existingUser = await prisma.usuario.findUnique({
                where: { ced_usu }
            });
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: 'Ya existe un usuario con esa cédula'
                });
                return;
            }
            // Verificar que el email no exista
            const existingEmail = await prisma.cuenta.findFirst({
                where: { cor_cue }
            });
            if (existingEmail) {
                res.status(400).json({
                    success: false,
                    message: 'Ya existe una cuenta con ese email'
                });
                return;
            }
            // Validar carrera si es estudiante
            if (rol_cue === 'ESTUDIANTE' && id_car_per) {
                const carrera = await prisma.carrera.findUnique({
                    where: { id_car: id_car_per }
                });
                if (!carrera) {
                    res.status(400).json({
                        success: false,
                        message: 'La carrera seleccionada no existe'
                    });
                    return;
                }
            }
            // Encriptar contraseña
            const hashedPassword = await bcrypt_1.default.hash(pas_usu, 10);
            // Crear usuario y cuenta en transacción
            const result = await prisma.$transaction(async (tx) => {
                const nuevoUsuario = await tx.usuario.create({
                    data: {
                        ced_usu,
                        nom_usu1,
                        nom_usu2: nom_usu2 || '',
                        ape_usu1,
                        ape_usu2: ape_usu2 || '',
                        fec_nac_usu: new Date(fec_nac_usu),
                        num_tel_usu: num_tel_usu || null,
                        id_car_per: (rol_cue === 'ESTUDIANTE' && id_car_per) ? id_car_per : null,
                        documentos_verificados: false
                    }
                });
                await tx.cuenta.create({
                    data: {
                        cor_cue,
                        rol_cue,
                        id_usu_per: nuevoUsuario.id_usu,
                        isVerified: false
                    }
                });
                return nuevoUsuario;
            });
            res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente',
                usuario: {
                    id_usu: result.id_usu,
                    ced_usu: result.ced_usu,
                    nombre_completo: `${result.nom_usu1} ${result.nom_usu2 || ''} ${result.ape_usu1} ${result.ape_usu2 || ''}`.trim()
                }
            });
        }
        catch (error) {
            console.error('[createUser] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * PUT /api/admin/users/:cedula
     * Actualizar usuario existente (solo MASTER)
     */
    async updateUser(req, res) {
        try {
            const { cedula } = req.params;
            const { nom_usu1, nom_usu2, ape_usu1, ape_usu2, fec_nac_usu, num_tel_usu, cor_cue, pas_usu, est_usu } = req.body;
            const prisma = this.container.getPrismaClient();
            // Verificar que el usuario actual es MASTER
            const usuarioActual = await prisma.usuario.findUnique({
                where: { id_usu: req.usuario?.id_usu || req.uid },
                include: { cuentas: true }
            });
            if (!usuarioActual || usuarioActual.cuentas[0]?.rol_cue !== 'MASTER') {
                res.status(403).json({
                    success: false,
                    message: 'Solo los usuarios MASTER pueden actualizar usuarios'
                });
                return;
            }
            // Buscar usuario a actualizar
            const usuario = await prisma.usuario.findUnique({
                where: { ced_usu: cedula },
                include: { cuentas: true }
            });
            if (!usuario) {
                res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
                return;
            }
            // Preparar datos de actualización
            const updateData = {};
            if (nom_usu1)
                updateData.nom_usu1 = nom_usu1;
            if (nom_usu2 !== undefined)
                updateData.nom_usu2 = nom_usu2 || '';
            if (ape_usu1)
                updateData.ape_usu1 = ape_usu1;
            if (ape_usu2 !== undefined)
                updateData.ape_usu2 = ape_usu2 || '';
            if (fec_nac_usu)
                updateData.fec_nac_usu = new Date(fec_nac_usu);
            if (num_tel_usu !== undefined)
                updateData.num_tel_usu = num_tel_usu || null;
            // Actualizar en transacción
            await prisma.$transaction(async (tx) => {
                // Actualizar usuario
                if (Object.keys(updateData).length > 0) {
                    await tx.usuario.update({
                        where: { ced_usu: cedula },
                        data: updateData
                    });
                }
                // Actualizar cuenta si hay datos de cuenta
                const cuentaUpdateData = {};
                if (cor_cue)
                    cuentaUpdateData.cor_cue = cor_cue;
                if (Object.keys(cuentaUpdateData).length > 0 && usuario.cuentas[0]) {
                    await tx.cuenta.update({
                        where: { id_cue: usuario.cuentas[0].id_cue },
                        data: cuentaUpdateData
                    });
                }
            });
            res.json({
                success: true,
                message: 'Usuario actualizado exitosamente'
            });
        }
        catch (error) {
            console.error('[updateUser] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * DELETE /api/admin/users/:cedula
     * Eliminar usuario (soft delete - solo MASTER)
     */
    async deleteUser(req, res) {
        try {
            const { cedula } = req.params;
            const prisma = this.container.getPrismaClient();
            // Verificar que el usuario actual es MASTER
            const usuarioActual = await prisma.usuario.findUnique({
                where: { id_usu: req.usuario?.id_usu || req.uid },
                include: { cuentas: true }
            });
            if (!usuarioActual || usuarioActual.cuentas[0]?.rol_cue !== 'MASTER') {
                res.status(403).json({
                    success: false,
                    message: 'Solo los usuarios MASTER pueden eliminar usuarios'
                });
                return;
            }
            // Buscar usuario a eliminar
            const usuario = await prisma.usuario.findUnique({
                where: { ced_usu: cedula },
                include: { cuentas: true }
            });
            if (!usuario) {
                res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
                return;
            }
            // No permitir eliminar otros MASTER
            if (usuario.cuentas[0]?.rol_cue === 'MASTER') {
                res.status(403).json({
                    success: false,
                    message: 'No se puede eliminar usuarios con rol MASTER'
                });
                return;
            }
            // Soft delete - desactivar verificación de documentos
            await prisma.usuario.update({
                where: { ced_usu: cedula },
                data: { documentos_verificados: false }
            });
            res.json({
                success: true,
                message: 'Usuario eliminado exitosamente'
            });
        }
        catch (error) {
            console.error('[deleteUser] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    /**
     * GET /api/admin/users/stats
     * Obtener estadísticas de usuarios
     */
    async getUserStats(req, res) {
        try {
            const prisma = this.container.getPrismaClient();
            const [totalUsuarios, usuariosVerificados, usuariosPorRol, usuariosRecientes] = await Promise.all([
                prisma.usuario.count(),
                prisma.usuario.count({ where: { documentos_verificados: true } }),
                prisma.cuenta.groupBy({
                    by: ['rol_cue'],
                    _count: { rol_cue: true }
                }),
                prisma.usuario.count({
                    where: {
                        fec_verificacion_docs: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
                        }
                    }
                })
            ]);
            const rolesStats = usuariosPorRol.reduce((acc, item) => {
                acc[item.rol_cue.toLowerCase()] = item._count.rol_cue;
                return acc;
            }, {});
            res.json({
                success: true,
                stats: {
                    total: totalUsuarios,
                    verificados: usuariosVerificados,
                    no_verificados: totalUsuarios - usuariosVerificados,
                    recientes: usuariosRecientes,
                    porRol: rolesStats
                }
            });
        }
        catch (error) {
            console.error('[getUserStats] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}
exports.UserManagementController = UserManagementController;
//# sourceMappingURL=UserManagementController.js.map