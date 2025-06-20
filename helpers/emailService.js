const nodemailer = require('nodemailer');

// Configuración del transporter con validación
const createTransporter = () => {
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'FRONTEND_URL'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`Advertencia: Variables de entorno faltantes para email: ${missingVars.join(', ')}`);
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,      // ej: smtp.gmail.com
    port: Number(process.env.SMTP_PORT) || 587, // ej: 587
    secure: process.env.SMTP_SECURE === 'true', // true para puerto 465
    auth: {
      user: process.env.SMTP_USER,    // tu correo SMTP
      pass: process.env.SMTP_PASS     // la contraseña de ese correo
    },
    timeout: 10000, // 10 segundos de timeout
  });
};

const transporter = createTransporter();

const sendRecoveryEmail = async (to, token) => {
  try {
    // Validar que tenemos las variables de entorno necesarias
    if (!process.env.FRONTEND_URL) {
      throw new Error('FRONTEND_URL no está configurado en las variables de entorno');
    }

    if (!process.env.SMTP_HOST) {
      throw new Error('SMTP_FROM no está configurado en las variables de entorno');
    }

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    
    const mailOptions = {
      from: process.env.SMTP_HOST, // ej: '"Soporte" <soporte@tudominio.com>'
      to,
      subject: 'Recuperación de contraseña - Sistema de Gestión Académica',
      text: `Hola,

Has solicitado recuperar tu contraseña para acceder al Sistema de Gestión Académica.

Para restablecer tu contraseña, haz clic en el siguiente enlace:
${resetLink}

Este enlace expirará en 1 hora por seguridad.

Si no solicitaste este cambio, puedes ignorar este correo.

Saludos,
Equipo de Soporte Técnico`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #6d1313; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Recuperación de Contraseña</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #ddd;">
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Hola,
            </p>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Has solicitado recuperar tu contraseña para acceder al <strong>Sistema de Gestión Académica</strong>.
            </p>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
              Para restablecer tu contraseña, haz clic en el siguiente botón:
            </p>
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${resetLink}" 
                 style="background-color: #6d1313; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
                Restablecer Contraseña
              </a>
            </div>
            <p style="font-size: 14px; line-height: 1.5; margin-bottom: 15px; color: #666;">
              O copia y pega este enlace en tu navegador:
            </p>
            <p style="font-size: 14px; word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 4px; margin-bottom: 20px;">
              ${resetLink}
            </p>
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>⚠️ Importante:</strong> Este enlace expirará en <strong>1 hora</strong> por seguridad.
              </p>
            </div>
            <p style="font-size: 14px; line-height: 1.5; color: #666;">
              Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
              Equipo de Soporte Técnico<br>
              Sistema de Gestión Académica
            </p>
          </div>
        </div>
      `
    };

    console.log(`[emailService] Enviando correo de recuperación a: ${to}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`[emailService] Correo enviado exitosamente. MessageId: ${result.messageId}`);
    
    return result;
  } catch (error) {
    console.error(`[emailService] Error enviando correo a ${to}:`, error);
    throw new Error(`Error al enviar el correo de recuperación: ${error.message}`);
  }
};

// Función para verificar la configuración del email
const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('[emailService] Configuración de email verificada correctamente');
    return true;
  } catch (error) {
    console.error('[emailService] Error en la configuración de email:', error);
    return false;
  }
};




// Función para enviar el correo de verificación de cuenta
const sendVerificationEmail = async (to, token) => {
  try {
    // Validar que tenemos las variables de entorno necesarias
    if (!process.env.FRONTEND_URL) {
      throw new Error('FRONTEND_URL no está configurado en las variables de entorno');
    }

    if (!process.env.SMTP_HOST) {
      throw new Error('SMTP_FROM no está configurado en las variables de entorno');
    }

    const verificationLink = `${process.env.FRONTEND_URL}/verificar-cuenta?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_HOST, // ej: '"Soporte" <soporte@tudominio.com>'
      to,
      subject: 'Verificación de Cuenta - Sistema de Gestión Académica',
      text: `Hola,

Gracias por registrarte en el Sistema de Gestión Académica.

Para activar tu cuenta, haz clic en el siguiente enlace:
${verificationLink}

Este enlace expirará en 1 hora por seguridad.

Si no solicitaste este cambio, puedes ignorar este correo.

Saludos,
Equipo de Soporte Técnico`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #6d1313; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Verificación de Cuenta</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #ddd;">
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Hola,
            </p>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Gracias por registrarte en el <strong>Sistema de Gestión Académica</strong>.
            </p>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
              Para activar tu cuenta, haz clic en el siguiente botón:
            </p>
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${verificationLink}" 
                 style="background-color: #6d1313; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
                Activar Cuenta
              </a>
            </div>
            <p style="font-size: 14px; line-height: 1.5; margin-bottom: 15px; color: #666;">
              O copia y pega este enlace en tu navegador:
            </p>
            <p style="font-size: 14px; word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 4px; margin-bottom: 20px;">
              ${verificationLink}
            </p>
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>⚠️ Importante:</strong> Este enlace expirará en <strong>1 hora</strong> por seguridad.
              </p>
            </div>
            <p style="font-size: 14px; line-height: 1.5; color: #666;">
              Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
              Equipo de Soporte Técnico<br>
              Sistema de Gestión Académica
            </p>
          </div>
        </div>
      `
    };

    console.log(`[emailService] Enviando correo de verificación a: ${to}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`[emailService] Correo enviado exitosamente. MessageId: ${result.messageId}`);
    
    return result;
  } catch (error) {
    console.error(`[emailService] Error enviando correo a ${to}:`, error);
    throw new Error(`Error al enviar el correo de verificación: ${error.message}`);
  }
};

module.exports = { sendRecoveryEmail, sendVerificationEmail,testEmailConnection };