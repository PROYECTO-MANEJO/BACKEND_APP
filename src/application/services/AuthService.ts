/**
 * Auth Service - Application Layer
 *
 * ✅ SRP: Responsabilidad única - Operaciones de autenticación
 * Separado del controlador para cumplir Single Responsibility Principle
 */

import { DIContainer } from "../../infrastructure/DIContainer";
import {
  AuthValidator,
  LoginValidationData,
  RegisterValidationData,
  CreateAdminValidationData,
} from "../../domain/validators/AuthValidator";
import { UserData } from "../../infrastructure/repositories/PrismaUserRepository";

export interface LoginRequest extends LoginValidationData {}

export interface RegisterRequest extends RegisterValidationData {}

export interface CreateAdminRequest extends CreateAdminValidationData {}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: any;
  message?: string;
}

export class AuthService {
  private container: DIContainer;

  constructor(container: DIContainer) {
    this.container = container;
  }

  /**
   * ✅ SRP: Autenticar usuario
   */
  async login(loginRequest: LoginRequest): Promise<AuthResponse> {
    // ✅ SRP: Delegar validación al AuthValidator
    AuthValidator.validateLogin({
      email: loginRequest.email,
      password: loginRequest.password,
    });

    // ✅ SRP: Obtener dependencias del container
    const authRepository = this.container.getAuthenticationRepository();
    const bcrypt = this.container.getBcrypt();
    const { generateJWT, generateAdminJWT } = this.container.getJwtHelpers();

    // Buscar información completa de la cuenta por email
    const authData = await authRepository.findCompleteByEmail(
      loginRequest.email
    );

    // Verificar si la cuenta existe
    if (!authData) {
      return {
        success: false,
        message: "Email not found",
      };
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(
      loginRequest.password,
      authData.user.password || ""
    );
    if (!validPassword) {
      return {
        success: false,
        message: "Incorrect password",
      };
    }

    // Generar JWT basado en el rol
    let token;
    if (
      authData.account.role === "ADMINISTRADOR" ||
      authData.account.role === "MASTER"
    ) {
      token = await generateAdminJWT(authData.user.id);
    } else {
      token = await generateJWT(authData.user.id);
    }

    const user = authData.user;
    const isEstudiante = authData.account.role === "ESTUDIANTE";

    // Formatear respuesta completa incluyendo estado de documentos
    const userProfile = {
      id_usu: user.id,
      ced_usu: user.cedula,
      nom_usu1: user.firstName,
      nom_usu2: user.firstName2,
      ape_usu1: user.lastName,
      ape_usu2: user.lastName2,
      fec_nac_usu: user.birthDate,
      num_tel_usu: user.phone,
      id_car_per: user.careerId,
      email: authData.account.email,
      rol: authData.account.role,
      carrera: authData.career
        ? {
            id_car: authData.career.id,
            nom_car: authData.career.name,
          }
        : null,
      // Incluir estado de documentos
      documentos: {
        cedula_subida: !!user.cedulaFileUrl,
        matricula_subida: !!user.matriculaFileUrl,
        matricula_requerida: isEstudiante,
        documentos_verificados: user.documentsVerified,
        fecha_verificacion: user.verificationDate,
        archivos_completos: isEstudiante
          ? !!user.cedulaFileUrl && !!user.matriculaFileUrl
          : !!user.cedulaFileUrl,
      },
    };

    return {
      success: true,
      user: userProfile,
      token,
    };
  }

  /**
   * ✅ SRP: Registrar nuevo usuario
   */
  async register(registerRequest: RegisterRequest): Promise<AuthResponse> {
    // ✅ SRP: Delegar validación al AuthValidator
    AuthValidator.validateRegister(registerRequest);

    // ✅ SRP: Obtener dependencias del container
    const userRepository = this.container.getUserRepository();
    const authRepository = this.container.getAuthenticationRepository();
    const bcrypt = this.container.getBcrypt();
    const prisma = this.container.getPrismaClient();

    // Verificar si ya existe cuenta con este email
    const existingAccountByEmail = await authRepository.isEmailTaken(
      registerRequest.email
    );
    if (existingAccountByEmail) {
      return {
        success: false,
        message: "An account with this email already exists",
      };
    }

    // Verificar si ya existe usuario con esta cédula
    const existingUserByCedula = await authRepository.isCedulaTaken(
      registerRequest.ced_usu
    );
    if (existingUserByCedula) {
      return {
        success: false,
        message: "A user with this cedula already exists",
      };
    }

    // Validar carrera para usuarios UTA
    if (
      registerRequest.email.endsWith("@uta.edu.ec") &&
      registerRequest.carrera
    ) {
      const carreraExists = await prisma.carrera.findUnique({
        where: { id_car: registerRequest.carrera },
      });

      if (!carreraExists) {
        return {
          success: false,
          message: "Selected career is not valid",
        };
      }
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerRequest.password, salt);

    // Asignación automática de rol
    const rolAsignado = registerRequest.email.endsWith("@uta.edu.ec")
      ? "ESTUDIANTE"
      : "USUARIO";

    // Validar fecha de nacimiento
    let fechaNacimiento = new Date("2000-01-01"); // Fecha por defecto
    if (registerRequest.fec_nac_usu) {
      fechaNacimiento = registerRequest.fec_nac_usu;
    }

    // Crear usuario y cuenta en transacción
    const result = await prisma.$transaction(async (prisma) => {
      // Preparar datos del usuario usando la interface UserData correcta
      const userData: Partial<UserData> = {
        cedula: registerRequest.ced_usu,
        firstName: registerRequest.nombre,
        secondName: registerRequest.nombre2 || "",
        lastName: registerRequest.apellido,
        secondLastName: registerRequest.apellido2 || "",
        password: hashedPassword,
        dateOfBirth: fechaNacimiento,
      };

      // Solo agregar carrera si es usuario UTA
      if (
        registerRequest.email.endsWith("@uta.edu.ec") &&
        registerRequest.carrera
      ) {
        userData.careerId = registerRequest.carrera;
      }

      // ✅ SRP: Crear usuario usando repository
      const newUser = await userRepository.create(userData);

      const newAccount = await prisma.cuenta.create({
        data: {
          cor_cue: registerRequest.email,
          rol_cue: rolAsignado as any,
          id_usu_per: newUser.id, // ✅ Usar 'id' en lugar de 'id_usu'
          isVerified: false,
        },
      });

      return { user: newUser, account: newAccount };
    });

    return {
      success: true,
      message:
        "A verification email has been sent to your email address. Please verify your account before logging in.",
    };
  }

  /**
   * ✅ SRP: Crear administrador
   */
  async createAdmin(adminRequest: CreateAdminRequest): Promise<AuthResponse> {
    // ✅ SRP: Delegar validación al AuthValidator
    AuthValidator.validateCreateAdmin(adminRequest);

    // ✅ SRP: Obtener dependencias del container
    const userRepository = this.container.getUserRepository();
    const bcrypt = this.container.getBcrypt();
    const prisma = this.container.getPrismaClient();

    // ✅ SRP: Verificar si ya existe usuario con esta cédula
    const existingUserByCedula = await userRepository.findByCedula(
      adminRequest.ced_usu
    );
    if (existingUserByCedula) {
      return {
        success: false,
        message: "Ya existe un usuario con esta cédula",
      };
    }

    // Verificar si ya existe cuenta con este email
    const existingAccount = await prisma.cuenta.findFirst({
      where: { cor_cue: adminRequest.cor_cue },
    });

    if (existingAccount) {
      return {
        success: false,
        message: "Ya existe una cuenta con este email",
      };
    }

    // Validar fecha de nacimiento
    let fechaNacimiento = new Date("1990-01-01"); // Fecha por defecto
    if (adminRequest.fec_nac_usu) {
      fechaNacimiento = adminRequest.fec_nac_usu;
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminRequest.pas_usu, salt);

    // Crear usuario y cuenta en transacción
    const result = await prisma.$transaction(async (prisma) => {
      // Crear usuario
      const newUser = await prisma.usuario.create({
        data: {
          ced_usu: adminRequest.ced_usu,
          nom_usu1: adminRequest.nom_usu1,
          nom_usu2: adminRequest.nom_usu2 || "",
          ape_usu1: adminRequest.ape_usu1,
          ape_usu2: adminRequest.ape_usu2 || "",
          pas_usu: hashedPassword,
          fec_nac_usu: fechaNacimiento,
          num_tel_usu: adminRequest.num_tel_usu || null,
          id_car_per: null, // Los administradores no tienen carrera
        },
      });

      // Crear cuenta con rol ADMINISTRADOR
      const newAccount = await prisma.cuenta.create({
        data: {
          cor_cue: adminRequest.cor_cue,
          rol_cue: "ADMINISTRADOR",
          id_usu_per: newUser.id_usu,
          isVerified: true, // Los administradores se crean verificados
        },
      });

      return { user: newUser, account: newAccount };
    });

    return {
      success: true,
      message: "Administrador creado exitosamente",
      user: {
        id_usu: result.user.id_usu,
        ced_usu: result.user.ced_usu,
        nom_usu1: result.user.nom_usu1,
        ape_usu1: result.user.ape_usu1,
        cor_cue: result.account.cor_cue,
        rol_cue: result.account.rol_cue,
      },
    };
  }

  /**
   * ✅ SRP: Logout del usuario
   */
  async logout(): Promise<AuthResponse> {
    return {
      success: true,
      message: "Session closed successfully",
    };
  }
}
