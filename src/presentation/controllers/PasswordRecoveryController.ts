import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { DIContainer } from "../../infrastructure/DIContainer";
import { generateRecoveryToken } from "../../infrastructure/helpers/recoveryTokenHelper";

export class PasswordRecoveryController extends BaseController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    super();
    this.container = container;
  }

  /**
   * POST /api/password-recovery/forgot
   * Solicitar recuperación de contraseña
   */
  public async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      console.log(`Solicitud de recuperación de contraseña para: ${email}`);
      
      if (!email) {
        res.status(400).json({
          success: false,
          message: 'El correo electrónico es requerido'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();
      const emailService = this.container.getEmailService();

      // Buscar la cuenta y su usuario asociado
      const cuenta = await prisma.cuenta.findFirst({
        where: { cor_cue: email },
        include: { usuario: true }
      });

      // Siempre responder que se envió el correo si la cuenta existe o no (por seguridad)
      if (!cuenta || !cuenta.usuario) {
        res.json({
          success: true,
          message: 'Si existe una cuenta con ese correo, se enviarán instrucciones para restablecer la contraseña.'
        });
        return;
      }

      // Generar token de recuperación
      const { token, hashedToken } = await generateRecoveryToken();
      // Establecer fecha de expiración (1 hora desde ahora)
      const expiryDate = new Date(Date.now() + 3600000);

      // Actualizar el usuario con el hashed token y fecha de expiración
      await prisma.usuario.update({
        where: { id_usu: cuenta.usuario.id_usu },
        data: {
          resetToken: hashedToken,
          resetTokenExpiry: expiryDate
        }
      });

      // Enviar correo al usuario con el enlace que incluye el token en texto plano
      await emailService.sendPasswordResetEmail(email, token);

      res.json({
        success: true,
        message: 'Si existe una cuenta con ese correo, se enviarán instrucciones para restablecer la contraseña.'
      });
    } catch (error: any) {
      console.error('[forgotPassword] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor, contacte al administrador'
      });
    }
  }

  /**
   * POST /api/password-recovery/reset
   * Restablecer la contraseña
   */
  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        res.status(400).json({
          success: false,
          message: 'Token y contraseña son requeridos'
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
        return;
      }

      const prisma = this.container.getPrismaClient();
      const bcrypt = this.container.getBcrypt();

      console.log("[resetPassword] Iniciando verificación del token...");
      
      // Obtener todos los usuarios con token vigente
      const usuariosValidos = await prisma.usuario.findMany({
        where: { 
          resetTokenExpiry: { gt: new Date() },
          resetToken: { not: null }
        }
      });
      console.log("[resetPassword] Usuarios con token vigente:", usuariosValidos.length);

      let usuario = null;
      for (const u of usuariosValidos) {
        console.log(`[resetPassword] Comparando token para usuario: ${u.id_usu}`);
        try {
          const compareResult = await bcrypt.compare(token, u.resetToken || '');
          console.log(`[resetPassword] Resultado de bcrypt.compare para ${u.id_usu}:`, compareResult);
          if (compareResult) {
            usuario = u;
            break;
          }
        } catch (compareError) {
          console.error(`[resetPassword] Error comparando token para usuario ${u.id_usu}:`, compareError);
          continue;
        }
      }

      if (!usuario) {
        console.log("[resetPassword] No se encontró usuario con token válido");
        res.status(400).json({
          success: false,
          message: 'Token inválido o expirado'
        });
        return;
      }

      console.log("[resetPassword] Usuario encontrado:", usuario.id_usu);
      
      // Encriptar la nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log("[resetPassword] Contraseña encriptada");

      // Actualizar el usuario
      console.log("[resetPassword] Actualizando usuario con id:", usuario.id_usu);
      await prisma.usuario.update({
        where: { id_usu: usuario.id_usu },
        data: {
          pas_usu: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      });
      console.log("[resetPassword] Usuario actualizado exitosamente");

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error: any) {
      console.error("[resetPassword] Error:", error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor, contacte al administrador'
      });
    }
  }

  /**
   * POST /api/password-recovery/verify-token
   * Verificar la validez del token
   */
  public async verifyResetToken(req: Request, res: Response): Promise<void> {
    try {
      console.log("Verificando token - body:", req.body);
      const { token } = req.body;
      
      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Token es requerido'
        });
        return;
      }

      console.log("Token recibido:", token);
      
      const prisma = this.container.getPrismaClient();
      const bcrypt = this.container.getBcrypt();
      
      // Obtener todos los usuarios con token vigente
      const usuariosValidos = await prisma.usuario.findMany({
        where: {
          resetTokenExpiry: { gt: new Date() },
          resetToken: { not: null }
        }
      });
      console.log(usuariosValidos ? `Usuarios con token vigente: ${usuariosValidos.length}` : "No hay usuarios con token vigente");
      
      let usuarioValido = null;
      for (const u of usuariosValidos) {
        try {
          if (await bcrypt.compare(token, u.resetToken || '')) {
            usuarioValido = u;
            break;
          }
        } catch (compareError) {
          console.error(`Error comparando token para usuario ${u.id_usu}:`, compareError);
          continue;
        }
      }

      if (!usuarioValido) {
        res.status(400).json({
          success: false,
          message: 'Token inválido o expirado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Token válido'
      });
    } catch (error: any) {
      console.error('[verifyResetToken] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor, contacte al administrador'
      });
    }
  }
}
