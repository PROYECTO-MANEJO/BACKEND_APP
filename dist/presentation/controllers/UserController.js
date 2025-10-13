"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const BaseController_1 = require("./BaseController");
class UserController extends BaseController_1.BaseController {
    constructor(container) {
        super();
        this.container = container;
    }
    /**
     * GET /api/users/profile
     * Get current user profile (based on JWT token)
     */
    async getUserProfile(req, res) {
        await this.execute(req, res, async () => {
            const userId = req.uid; // From JWT middleware
            // ✅ SOLID: Usar repository en lugar de Prisma directo
            const userRepository = this.container.getUserRepository();
            const user = await userRepository.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const account = user.cuentas[0];
            const isEstudiante = account?.rol_cue === 'ESTUDIANTE';
            const userProfile = {
                id_usu: user.id_usu,
                ced_usu: user.ced_usu,
                nom_usu1: user.nom_usu1,
                nom_usu2: user.nom_usu2,
                ape_usu1: user.ape_usu1,
                ape_usu2: user.ape_usu2,
                fec_nac_usu: user.fec_nac_usu,
                num_tel_usu: user.num_tel_usu,
                id_car_per: user.id_car_per,
                github_token: user.github_token,
                github_username: user.github_username,
                email: account?.cor_cue,
                rol: account?.rol_cue,
                carrera: user.carrera ? { id_car: user.carrera.id_car, nom_car: user.carrera.nom_car } : null,
                documentos: {
                    cedula_subida: !!user.enl_ced_pdf,
                    matricula_subida: !!user.enl_mat_pdf,
                    matricula_requerida: isEstudiante,
                    documentos_verificados: user.documentos_verificados,
                    fecha_verificacion: user.fec_verificacion_docs,
                    archivos_completos: isEstudiante ? (!!user.enl_ced_pdf && !!user.enl_mat_pdf) : !!user.enl_ced_pdf
                }
            };
            return userProfile;
        });
    }
    /**
     * PUT /api/users/profile
     * Update current user profile
     */
    async updateUserProfile(req, res) {
        await this.execute(req, res, async () => {
            const userId = req.uid; // From JWT middleware
            // ✅ SOLID: Usar repository en lugar de Prisma directo
            const userRepository = this.container.getUserRepository();
            const prisma = this.container.getPrismaClient(); // Solo para validaciones complejas
            const { nom_usu1, nom_usu2, ape_usu1, ape_usu2, fec_nac_usu, num_tel_usu, id_car_per, github_token } = req.body;
            const existingUser = await userRepository.findById(userId);
            if (!existingUser) {
                throw new Error('User not found');
            }
            // Validate GitHub token if provided
            if (github_token) {
                const userRole = existingUser.cuentas[0]?.rol_cue;
                const allowedRoles = ['DESARROLLADOR', 'MASTER', 'ADMINISTRADOR'];
                if (!allowedRoles.includes(userRole || '')) {
                    throw new Error('Only developers, masters and administrators can configure a GitHub token');
                }
            }
            const isEstudiante = existingUser.cuentas[0]?.rol_cue === 'ESTUDIANTE';
            let carreraToUpdate = isEstudiante ? id_car_per : null;
            if (isEstudiante && carreraToUpdate) {
                const carreraExists = await prisma.carrera.findUnique({ where: { id_car: carreraToUpdate } });
                if (!carreraExists) {
                    throw new Error('Selected career does not exist');
                }
            }
            const updatedUser = await prisma.usuario.update({
                where: { id_usu: userId },
                data: {
                    nom_usu1,
                    nom_usu2: nom_usu2 || '',
                    ape_usu1,
                    ape_usu2: ape_usu2 || '',
                    fec_nac_usu: new Date(fec_nac_usu),
                    num_tel_usu: num_tel_usu || null,
                    id_car_per: carreraToUpdate || null,
                    github_token: github_token || null,
                    github_username: null // TODO: Implement GitHub validation
                },
                include: {
                    carrera: { select: { id_car: true, nom_car: true } },
                    cuentas: { select: { cor_cue: true, rol_cue: true } }
                }
            });
            const account = updatedUser.cuentas[0];
            const userProfile = {
                id_usu: updatedUser.id_usu,
                ced_usu: updatedUser.ced_usu,
                nom_usu1: updatedUser.nom_usu1,
                nom_usu2: updatedUser.nom_usu2,
                ape_usu1: updatedUser.ape_usu1,
                ape_usu2: updatedUser.ape_usu2,
                fec_nac_usu: updatedUser.fec_nac_usu,
                num_tel_usu: updatedUser.num_tel_usu,
                id_car_per: updatedUser.id_car_per,
                github_token: updatedUser.github_token,
                github_username: updatedUser.github_username,
                email: account?.cor_cue,
                rol: account?.rol_cue,
                carrera: updatedUser.carrera ? { id_car: updatedUser.carrera.id_car, nom_car: updatedUser.carrera.nom_car } : null
            };
            return {
                success: true,
                message: 'Profile updated successfully',
                user: userProfile
            };
        });
    }
    /**
     * GET /api/users
     * Get all users for admin (based on original getAllUsers function)
     */
    async getAllUsers(req, res) {
        await this.execute(req, res, async () => {
            const prisma = this.container.getPrismaClient();
            const users = await prisma.usuario.findMany({
                include: {
                    carrera: { select: { id_car: true, nom_car: true } },
                    cuentas: { select: { cor_cue: true, rol_cue: true } }
                },
                orderBy: { nom_usu1: 'asc' }
            });
            const userList = users.map(user => {
                const account = user.cuentas[0];
                const isEstudiante = account?.rol_cue === 'ESTUDIANTE';
                return {
                    id_usu: user.id_usu,
                    ced_usu: user.ced_usu,
                    nom_usu1: user.nom_usu1,
                    nom_usu2: user.nom_usu2,
                    ape_usu1: user.ape_usu1,
                    ape_usu2: user.ape_usu2,
                    fec_nac_usu: user.fec_nac_usu,
                    num_tel_usu: user.num_tel_usu,
                    email: account?.cor_cue,
                    rol: account?.rol_cue,
                    carrera: user.carrera ? { id_car: user.carrera.id_car, nom_car: user.carrera.nom_car } : null,
                    documentos: {
                        cedula_subida: !!user.enl_ced_pdf,
                        matricula_subida: !!user.enl_mat_pdf,
                        matricula_requerida: isEstudiante,
                        documentos_verificados: user.documentos_verificados,
                        fecha_verificacion: user.fec_verificacion_docs,
                        archivos_completos: isEstudiante ? (!!user.enl_ced_pdf && !!user.enl_mat_pdf) : !!user.enl_ced_pdf
                    }
                };
            });
            return {
                success: true,
                users: userList,
                total: userList.length
            };
        });
    }
    /**
     * GET /api/users/admins
     * Get only administrators for master admin management
     */
    async getAdmins(req, res) {
        await this.execute(req, res, async () => {
            // ✅ SOLID: Usar repository en lugar de Prisma directo
            const userRepository = this.container.getUserRepository();
            const admins = await userRepository.findByRole('ADMINISTRADOR');
            const formattedAdmins = admins.map((admin) => {
                const account = admin.cuentas[0];
                return {
                    id_usu: admin.id_usu,
                    ced_usu: admin.ced_usu,
                    nom_usu1: admin.nom_usu1,
                    nom_usu2: admin.nom_usu2,
                    ape_usu1: admin.ape_usu1,
                    ape_usu2: admin.ape_usu2,
                    fec_nac_usu: admin.fec_nac_usu,
                    num_tel_usu: admin.num_tel_usu,
                    cor_cue: account?.cor_cue, // ✅ Usar cor_cue como espera el frontend
                    rol_cue: account?.rol_cue, // ✅ Mantener rol_cue
                    carrera: admin.carrera ? { id_car: admin.carrera.id_car, nom_car: admin.carrera.nom_car } : null,
                    documentos: {
                        cedula_subida: !!admin.enl_ced_pdf,
                        matricula_subida: false, // Los admins no necesitan matrícula
                        matricula_requerida: false,
                        documentos_verificados: admin.documentos_verificados,
                        fecha_verificacion: admin.fec_verificacion_docs,
                        archivos_completos: !!admin.enl_ced_pdf
                    }
                };
            });
            return {
                success: true,
                usuarios: formattedAdmins // Usar 'usuarios' como espera el frontend
            };
        });
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map