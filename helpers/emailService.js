const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,      // ej: smtp.gmail.com
  port: Number(process.env.SMTP_PORT), // ej: 587
  secure: process.env.SMTP_SECURE === 'true', // true para puerto 465
  auth: {
    user: process.env.SMTP_USER,    // tu correo SMTP
    pass: process.env.SMTP_PASS     // la contraseña de ese correo
  }
});

const sendRecoveryEmail = async (to, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const mailOptions = {
    from: process.env.SMTP_FROM, // ej: '"Soporte" <soporte@tudominio.com>'
    to,
    subject: 'Recuperación de contraseña',
    text: `Solicitaste recuperar tu contraseña. Haz click en el siguiente enlace para restablecerla: ${resetLink}`,
    html: `<p>Solicitaste recuperar tu contraseña.</p>
           <p>Haz click en el siguiente enlace para restablecerla:</p>
           <p><a href="${resetLink}">${resetLink}</a></p>`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendRecoveryEmail };