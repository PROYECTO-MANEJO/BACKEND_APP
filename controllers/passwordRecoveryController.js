const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { generateRecoveryToken } = require('../helpers/recoveryTokenHelper');
const { sendRecoveryEmail } = require('../helpers/emailService');

const prisma = new PrismaClient();

// Endpoint para solicitar recuperación de contraseña
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(`Solicitud de recuperación de contraseña para: ${email}`);
  try {
    // Buscar la cuenta y su usuario asociado
    const cuenta = await prisma.cuenta.findFirst({
      where: { cor_cue: email },
      include: { usuario: true }
    });

    // Siempre responder que se envió el correo si la cuenta existe o no
    if (!cuenta || !cuenta.usuario) {
      return res.json({
        success: true,
        message: 'Si existe una cuenta con ese correo, se enviarán instrucciones para restablecer la contraseña.'
      });
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
    await sendRecoveryEmail(email, token);

    return res.json({
      success: true,
      message: 'Si existe una cuenta con ese correo, se enviarán instrucciones para restablecer la contraseña.'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor, contacte al administrador'
    });
  }
};

// Endpoint para restablecer la contraseña
const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    console.log("[resetPassword] Iniciando verificación del token...");
    // Obtener todos los usuarios con token vigente
    const usuariosValidos = await prisma.usuario.findMany({
      where: { resetTokenExpiry: { gt: new Date() } }
    });
    console.log("[resetPassword] Usuarios con token vigente:", usuariosValidos.map(u => u.id_usu));

    let usuario = null;
    for (const u of usuariosValidos) {
      // Log para cada usuario
      console.log(`[resetPassword] Comparando token para usuario: ${u.id_usu}`);
      const compareResult = await bcrypt.compare(token, u.resetToken);
      console.log(`[resetPassword] Resultado de bcrypt.compare para ${u.id_usu}:`, compareResult);
      if (compareResult) {
        usuario = u;
        break;
      }
    }

    if (!usuario) {
      console.log("[resetPassword] No se encontró usuario con token válido");
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    console.log("[resetPassword] Usuario encontrado:", usuario.id_usu);
    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("[resetPassword] Contraseña encriptada");

    // Actualizar el usuario
    console.log("[resetPassword] Actualizando usuario con id:", usuario.id_usu);
    const updateResult = await prisma.usuario.update({
      where: { id_usu: usuario.id_usu },
      data: {
        pas_usu: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
    console.log("[resetPassword] Usuario actualizado:", updateResult);

    return res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error("[resetPassword] Error:", error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor, contacte al administrador'
    });
  }
};

// Endpoint para verificar la validez del token
const verifyResetToken = async (req, res) => {
    console.log("el body es:",req.body);
  const { token } = req.body;
  console.log("token es:",token)
  try {
    // Obtener todos los usuarios con token vigente
    const usuariosValidos = await prisma.usuario.findMany({
      where: {
        resetTokenExpiry: { gt: new Date() }
      }
    });
    console.log(usuariosValidos ? `Usuarios con token vigente: ${usuariosValidos.map(u => u.id_usu)}` : "No hay usuarios con token vigente");
    let usuarioValido = null;
    for (const u of usuariosValidos) {
      if (await bcrypt.compare(token, u.resetToken)) {
        usuarioValido = u;
        break;
      }
    }

    if (!usuarioValido) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    return res.json({
      success: true,
      message: 'Token válido'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor, contacte al administrador'
    });
  }
};

module.exports = { forgotPassword, resetPassword, verifyResetToken };