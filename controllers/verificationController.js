const { PrismaClient } = require('@prisma/client');
const { sendVerificationEmail } = require('../helpers/emailService');
const { generateVerificationJWT, verifyVerificationJWT } = require('../helpers/jwt'); // Utilizamos las funciones de JWT

const prisma = new PrismaClient();

// Función para generar el token de verificación y enviar el correo
const sendVerificationToken = async (email, userId) => {
  try {
    // Generar el token de verificación
    const token = await generateVerificationJWT(userId);

    // Enviar el correo de verificación
    await sendVerificationEmail(email, token);

    return true; // Retorna true si todo salió bien
  } catch (error) {
    console.error('[verificationController] Error enviando correo de verificación:', error);
    throw new Error('Error al enviar el correo de verificación');
  }
};

// Función para verificar el token de verificación
const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token es requerido' });
  }

  try {
    // Decodificar token
    const decoded = await verifyVerificationJWT(token);
    console.log('[verifyEmail] Decoded token:', decoded);

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id_usu: decoded.id }
    });

    if (!usuario) {
      return res.status(400).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Buscar cuenta asociada
    const cuenta = await prisma.cuenta.findFirst({
      where: { id_usu_per: usuario.id_usu }
    });

    if (!cuenta) {
      return res.status(400).json({ success: false, message: 'Cuenta no encontrada' });
    }

    if (cuenta.isVerified) {
      return res.status(200).json({ success: true, message: 'La cuenta ya está verificada' });
    }

    // Actualizar cuenta a verificada
    await prisma.cuenta.update({
      where: { id_cue: cuenta.id_cue },
      data: {
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null
      }
    });

    return res.status(200).json({ success: true, message: 'Cuenta verificada exitosamente' });

  } catch (error) {
    console.error('[verificationController] Error al verificar el token:', error);
    return res.status(500).json({ success: false, message: 'Error al verificar la cuenta' });
  }
};


module.exports = { sendVerificationToken, verifyEmail };
