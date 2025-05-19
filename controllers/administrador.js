const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

class AdministradorController {
  constructor() {
    this.prisma = new PrismaClient();
  }

  registrarAdministrador = async (req, res) => {
    try {
      const { nombre, nombreUsuario, correo, password, permisos } = req.body;

      if (!nombre || !nombreUsuario || !correo || !password) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
      }

      const existeCorreo = await this.prisma.administrador.findUnique({ where: { correo } });
      if (existeCorreo) {
        return res.status(409).json({ message: 'Correo ya registrado' });
      }

      const existeNombreUsuario = await this.prisma.administrador.findUnique({ where: { nombreUsuario } });
      if (existeNombreUsuario) {
        return res.status(409).json({ message: 'Nombre de usuario ya registrado' });
      }

      const passwordHasheada = await bcrypt.hash(password, 10);

      const nuevoAdmin = await this.prisma.administrador.create({
        data: {
          nombre,
          nombreUsuario,
          correo,
          password: passwordHasheada,
          permisos,
        },
      });

      const { password: _, ...adminSinPassword } = nuevoAdmin;

      res.status(201).json({
        message: 'Administrador creado correctamente',
        admin: adminSinPassword,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  loginAdministrador = async (req, res) => {
    const { correo, password } = req.body;

    try {
      const admin = await this.prisma.administrador.findUnique({ where: { correo } });
      if (!admin) return res.status(401).json({ message: 'Correo o contraseña incorrectos' });

      const passwordValido = await bcrypt.compare(password, admin.password);
      if (!passwordValido) return res.status(401).json({ message: 'Correo o contraseña incorrectos' });

      const token = jwt.sign(
        { id: admin.id, correo: admin.correo, nombre: admin.nombre, rol: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      const { password: _, ...adminSinPassword } = admin;

      res.json({ token, admin: adminSinPassword });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

module.exports = AdministradorController;
