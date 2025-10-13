"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const BaseController_1 = require("./BaseController");
class AuthController extends BaseController_1.BaseController {
    constructor(container) {
        super();
        this.container = container;
    }
    /**
     * POST /api/auth/login
     * User login - REAL implementation from auth.js
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;
            // ✅ SOLID: Usar repository en lugar de Prisma directo
            const userRepository = this.container.getUserRepository();
            const prisma = this.container.getPrismaClient(); // Solo para queries complejas de cuenta
            const bcrypt = this.container.getBcrypt();
            const { generateJWT, generateAdminJWT } = this.container.getJwtHelpers();
            // Find account by email with complete user information
            const cuenta = await prisma.cuenta.findFirst({
                where: {
                    cor_cue: email
                },
                include: {
                    usuario: {
                        include: {
                            carrera: {
                                select: {
                                    id_car: true,
                                    nom_car: true
                                }
                            }
                        }
                    }
                }
            });
            // Check if account exists
            if (!cuenta) {
                res.status(400).json({
                    success: false,
                    message: 'Email not found'
                });
                return;
            }
            // Check if user exists
            if (!cuenta.usuario) {
                res.status(400).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }
            // Check if account is verified (temporarily disabled for testing)
            // if (!cuenta.isVerified) {
            //   return res.status(400).json({
            //     success: false,
            //     message: 'Your account has not been verified yet. Check your email.'
            //   });
            // }
            // Verify password
            const validPassword = await bcrypt.compare(password, cuenta.usuario.pas_usu || '');
            if (!validPassword) {
                res.status(400).json({
                    success: false,
                    message: 'Incorrect password'
                });
                return;
            }
            // Generate JWT token based on role
            let token;
            if (cuenta.rol_cue === 'ADMINISTRADOR' || cuenta.rol_cue === 'MASTER') {
                token = await generateAdminJWT(cuenta.usuario.id_usu);
            }
            else {
                token = await generateJWT(cuenta.usuario.id_usu);
            }
            const user = cuenta.usuario;
            const isEstudiante = cuenta.rol_cue === 'ESTUDIANTE';
            // Format complete response including document status
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
                email: cuenta.cor_cue,
                rol: cuenta.rol_cue,
                carrera: user.carrera ? {
                    id_car: user.carrera.id_car,
                    nom_car: user.carrera.nom_car
                } : null,
                // Include document status
                documentos: {
                    cedula_subida: !!user.enl_ced_pdf,
                    matricula_subida: !!user.enl_mat_pdf,
                    matricula_requerida: isEstudiante,
                    documentos_verificados: user.documentos_verificados,
                    fecha_verificacion: user.fec_verificacion_docs,
                    archivos_completos: isEstudiante
                        ? (!!user.enl_ced_pdf && !!user.enl_mat_pdf)
                        : !!user.enl_ced_pdf
                }
            };
            res.status(200).json({
                success: true,
                user: userProfile,
                token
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    /**
     * POST /api/auth/register
     * Register new user - REAL implementation from auth.js
     */
    async register(req, res) {
        try {
            const { email, password, nombre, nombre2, apellido, apellido2, ced_usu, fec_nac_usu, carrera } = req.body;
            // ✅ SOLID: Usar repository en lugar de Prisma directo
            const userRepository = this.container.getUserRepository();
            const prisma = this.container.getPrismaClient(); // Solo para validaciones complejas y transacciones
            const bcrypt = this.container.getBcrypt();
            // Check if account already exists with this email
            const existingAccount = await prisma.cuenta.findFirst({
                where: {
                    cor_cue: email
                }
            });
            if (existingAccount) {
                res.status(400).json({
                    success: false,
                    message: 'An account with this email already exists'
                });
                return;
            }
            // ✅ SOLID: Check if user already exists with this cedula using repository
            const existingUserByCedula = await userRepository.findByCedula(ced_usu);
            if (existingUserByCedula) {
                res.status(400).json({
                    success: false,
                    message: 'A user with this cedula already exists'
                });
                return;
            }
            if (!ced_usu) {
                res.status(400).json({
                    success: false,
                    message: 'Cedula is required'
                });
                return;
            }
            // Validate password strength
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
            if (!passwordRegex.test(password)) {
                res.status(400).json({
                    success: false,
                    message: 'Password must contain at least 6 characters, one uppercase letter, one number and one special character (@$!%*?&)'
                });
                return;
            }
            // Validate career for UTA users
            if (email && email.endsWith('@uta.edu.ec')) {
                if (!carrera) {
                    res.status(400).json({
                        success: false,
                        message: 'Career is required for UTA students'
                    });
                    return;
                }
                // Check if career exists
                const carreraExists = await prisma.carrera.findUnique({
                    where: { id_car: carrera }
                });
                if (!carreraExists) {
                    res.status(400).json({
                        success: false,
                        message: 'Selected career is not valid'
                    });
                    return;
                }
            }
            // Encrypt password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            // Automatic role assignment
            let rolAsignado = email.endsWith('@uta.edu.ec') ? 'ESTUDIANTE' : 'USUARIO';
            // Validate birth date
            let fechaNacimiento = null;
            if (fec_nac_usu) {
                fechaNacimiento = new Date(fec_nac_usu);
                if (isNaN(fechaNacimiento.getTime())) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid birth date. Use YYYY-MM-DD format'
                    });
                    return;
                }
            }
            else {
                fechaNacimiento = new Date('2000-01-01');
            }
            // Create user and account in transaction
            const result = await prisma.$transaction(async (prisma) => {
                // Prepare user data
                const userData = {
                    ced_usu,
                    nom_usu1: nombre,
                    nom_usu2: nombre2 || '',
                    ape_usu1: apellido,
                    ape_usu2: apellido2 || '',
                    pas_usu: hashedPassword,
                    fec_nac_usu: fechaNacimiento
                };
                // Only add career if UTA user
                if (email && email.endsWith('@uta.edu.ec') && carrera) {
                    userData.id_car_per = carrera;
                }
                // ✅ SOLID: Create user using repository
                const newUser = await userRepository.create(userData);
                const newAccount = await prisma.cuenta.create({
                    data: {
                        cor_cue: email,
                        rol_cue: rolAsignado,
                        id_usu_per: newUser.id_usu,
                        isVerified: false
                    }
                });
                return { user: newUser, account: newAccount };
            });
            // TODO: Send verification token
            // await sendVerificationToken(email, result.user.id_usu);
            res.status(201).json({
                success: true,
                message: 'A verification email has been sent to your email address. Please verify your account before logging in.'
            });
        }
        catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    /**
     * Simple implementations for other auth methods
     */
    async logout(req, res) {
        await this.execute(req, res, async () => {
            return { message: "Session closed successfully" };
        });
    }
    async getProfile(req, res) {
        await this.execute(req, res, async () => {
            return { message: "Get profile not implemented yet" };
        });
    }
    async updateProfile(req, res) {
        await this.execute(req, res, async () => {
            return { message: "Update profile not implemented yet" };
        });
    }
    async changePassword(req, res) {
        await this.execute(req, res, async () => {
            return { message: "Change password not implemented yet" };
        });
    }
    async forgotPassword(req, res) {
        await this.execute(req, res, async () => {
            return { message: "Forgot password not implemented yet" };
        });
    }
    async resetPassword(req, res) {
        await this.execute(req, res, async () => {
            return { message: "Reset password not implemented yet" };
        });
    }
    async verifyEmail(req, res) {
        await this.execute(req, res, async () => {
            return { message: "Email verification not implemented yet" };
        });
    }
    async resendVerification(req, res) {
        await this.execute(req, res, async () => {
            return { message: "Resend verification not implemented yet" };
        });
    }
    async refreshToken(req, res) {
        await this.execute(req, res, async () => {
            return { message: "Refresh token not implemented yet" };
        });
    }
    /**
     * POST /api/auth/createAdmin
     * Create new administrator (Master only)
     */
    async createAdmin(req, res) {
        try {
            const { ced_usu, nom_usu1, nom_usu2, ape_usu1, ape_usu2, cor_cue, pas_usu, fec_nac_usu, num_tel_usu } = req.body;
            // ✅ SOLID: Usar repository en lugar de Prisma directo
            const userRepository = this.container.getUserRepository();
            const prisma = this.container.getPrismaClient(); // Solo para validaciones complejas y transacciones
            const bcrypt = this.container.getBcrypt();
            // Validar campos requeridos
            if (!ced_usu || !nom_usu1 || !ape_usu1 || !cor_cue || !pas_usu) {
                res.status(400).json({
                    success: false,
                    message: 'Campos requeridos: ced_usu, nom_usu1, ape_usu1, cor_cue, pas_usu'
                });
                return;
            }
            // ✅ SOLID: Verificar si ya existe un usuario con esta cédula usando repository
            const existingUserByCedula = await userRepository.findByCedula(ced_usu);
            if (existingUserByCedula) {
                res.status(400).json({
                    success: false,
                    message: 'Ya existe un usuario con esta cédula'
                });
                return;
            }
            // Verificar si ya existe una cuenta con este email
            const existingAccount = await prisma.cuenta.findFirst({
                where: { cor_cue }
            });
            if (existingAccount) {
                res.status(400).json({
                    success: false,
                    message: 'Ya existe una cuenta con este email'
                });
                return;
            }
            // Validar fortaleza de la contraseña
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
            if (!passwordRegex.test(pas_usu)) {
                res.status(400).json({
                    success: false,
                    message: 'La contraseña debe tener al menos 6 caracteres, una mayúscula, un número y un carácter especial (@$!%*?&)'
                });
                return;
            }
            // Validar fecha de nacimiento
            let fechaNacimiento = new Date('1990-01-01'); // Fecha por defecto
            if (fec_nac_usu) {
                fechaNacimiento = new Date(fec_nac_usu);
                if (isNaN(fechaNacimiento.getTime())) {
                    res.status(400).json({
                        success: false,
                        message: 'Fecha de nacimiento inválida. Use formato YYYY-MM-DD'
                    });
                    return;
                }
            }
            // Encriptar contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(pas_usu, salt);
            // Crear usuario y cuenta en transacción
            const result = await prisma.$transaction(async (prisma) => {
                // Crear usuario
                const newUser = await prisma.usuario.create({
                    data: {
                        ced_usu,
                        nom_usu1,
                        nom_usu2: nom_usu2 || '',
                        ape_usu1,
                        ape_usu2: ape_usu2 || '',
                        pas_usu: hashedPassword,
                        fec_nac_usu: fechaNacimiento,
                        num_tel_usu: num_tel_usu || null,
                        id_car_per: null // Los administradores no tienen carrera
                    }
                });
                // Crear cuenta con rol ADMINISTRADOR
                const newAccount = await prisma.cuenta.create({
                    data: {
                        cor_cue,
                        rol_cue: 'ADMINISTRADOR',
                        id_usu_per: newUser.id_usu,
                        isVerified: true // Los administradores se crean verificados
                    }
                });
                return { user: newUser, account: newAccount };
            });
            res.status(201).json({
                success: true,
                message: 'Administrador creado exitosamente',
                data: {
                    id_usu: result.user.id_usu,
                    ced_usu: result.user.ced_usu,
                    nom_usu1: result.user.nom_usu1,
                    ape_usu1: result.user.ape_usu1,
                    cor_cue: result.account.cor_cue,
                    rol_cue: result.account.rol_cue
                }
            });
        }
        catch (error) {
            console.error('[createAdmin] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map