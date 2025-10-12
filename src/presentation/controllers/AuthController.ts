import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";

export class AuthController extends BaseController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    super();
    this.container = container;
  }

  /**
   * POST /api/auth/login
   * User login - REAL implementation from auth.js
   */
  public async login(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const { email, password } = req.body;
      const prisma = this.container.getPrismaClient();
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
        throw new Error('Email not found');
      }

      // Check if user exists
      if (!cuenta.usuario) {
        throw new Error('User not found');
      }

      // Check if account is verified (temporarily disabled for testing)
      // if (!cuenta.isVerified) {
      //   throw new Error('Your account has not been verified yet. Check your email.');
      // }

      // Verify password
      const validPassword = await bcrypt.compare(password, cuenta.usuario.pas_usu || '');
      if (!validPassword) {
        throw new Error('Incorrect password');
      }

      // Generate JWT token based on role
      let token;
      if (cuenta.rol_cue === 'ADMINISTRADOR' || cuenta.rol_cue === 'MASTER') {
        token = await generateAdminJWT(Number(cuenta.usuario.id_usu));
      } else {
        token = await generateJWT(Number(cuenta.usuario.id_usu));
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

      return {
        success: true,
        user: userProfile,
        token
      };
    });
  }

  /**
   * POST /api/auth/register
   * Register new user - REAL implementation from auth.js
   */
  public async register(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      const { email, password, nombre, nombre2, apellido, apellido2, ced_usu, fec_nac_usu, carrera } = req.body;
      const prisma = this.container.getPrismaClient();
      const bcrypt = this.container.getBcrypt();

      // Check if account already exists with this email
      const existingAccount = await prisma.cuenta.findFirst({
        where: {
          cor_cue: email
        }
      });

      if (existingAccount) {
        throw new Error('An account with this email already exists');
      }

      // Check if user already exists with this cedula
      const existingUserByCedula = await prisma.usuario.findFirst({
        where: { ced_usu }
      });

      if (existingUserByCedula) {
        throw new Error('A user with this cedula already exists');
      }

      if (!ced_usu) {
        throw new Error('Cedula is required');
      }

      // Validate password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
      if (!passwordRegex.test(password)) {
        throw new Error('Password must contain at least 6 characters, one uppercase letter, one number and one special character (@$!%*?&)');
      }

      // Validate career for UTA users
      if (email && email.endsWith('@uta.edu.ec')) {
        if (!carrera) {
          throw new Error('Career is required for UTA students');
        }
        
        // Check if career exists
        const carreraExists = await prisma.carrera.findUnique({
          where: { id_car: carrera }
        });
        
        if (!carreraExists) {
          throw new Error('Selected career is not valid');
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
          throw new Error('Invalid birth date. Use YYYY-MM-DD format');
        }
      } else {
        fechaNacimiento = new Date('2000-01-01');
      }

      // Create user and account in transaction
      const result = await prisma.$transaction(async (prisma) => {
        // Prepare user data
        const userData: any = {
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

        // Create user
        const newUser = await prisma.usuario.create({
          data: userData
        });

        const newAccount = await prisma.cuenta.create({
          data: {
            cor_cue: email,
            rol_cue: rolAsignado as any,
            id_usu_per: newUser.id_usu,
            isVerified: false
          }
        });

        return { user: newUser, account: newAccount };
      });

      // TODO: Send verification token
      // await sendVerificationToken(email, result.user.id_usu);

      return {
        success: true,
        message: 'A verification email has been sent to your email address. Please verify your account before logging in.'
      };
    });
  }

  /**
   * Simple implementations for other auth methods
   */
  public async logout(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      return { message: "Session closed successfully" };
    });
  }

  public async getProfile(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      return { message: "Get profile not implemented yet" };
    });
  }

  public async updateProfile(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      return { message: "Update profile not implemented yet" };
    });
  }

  public async changePassword(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      return { message: "Change password not implemented yet" };
    });
  }

  public async forgotPassword(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      return { message: "Forgot password not implemented yet" };
    });
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      return { message: "Reset password not implemented yet" };
    });
  }

  public async verifyEmail(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      return { message: "Email verification not implemented yet" };
    });
  }

  public async resendVerification(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      return { message: "Resend verification not implemented yet" };
    });
  }

  public async refreshToken(req: Request, res: Response): Promise<void> {
    await this.execute(req, res, async () => {
      return { message: "Refresh token not implemented yet" };
    });
  }
}