const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear organizador
const crearOrganizador = async (req, res) => {
  try {
    const { ced_org, nom_org1, nom_org2, ape_org1, ape_org2, tit_aca_org } = req.body;

    if (!ced_org || !nom_org1 || !ape_org1 || !ape_org2) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
    }

    const existente = await prisma.organizador.findUnique({ where: { ced_org } });
    if (existente) return res.status(400).json({ success: false, message: 'Ya existe un organizador con esa cédula' });

    const nuevo = await prisma.organizador.create({
      data: { ced_org, nom_org1, nom_org2, ape_org1, ape_org2, tit_aca_org }
    });

    res.status(201).json({ success: true, message: 'Organizador creado correctamente', organizador: nuevo });
  } catch (error) {
    console.error('Error al crear organizador:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Obtener todos los organizadores
const obtenerOrganizadores = async (req, res) => {
  try {
    const lista = await prisma.organizador.findMany();
    res.json({ success: true, organizadores: lista });
  } catch (error) {
    console.error('Error al obtener organizadores:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Actualizar organizador
const actualizarOrganizador = async (req, res) => {
  const { cedula } = req.params;
  const data = req.body;
  try {
    const existe = await prisma.organizador.findUnique({ where: { ced_org: cedula } });
    if (!existe) return res.status(404).json({ success: false, message: 'Organizador no encontrado' });

    const actualizado = await prisma.organizador.update({ where: { ced_org: cedula }, data });
    res.json({ success: true, message: 'Organizador actualizado', organizador: actualizado });
  } catch (error) {
    console.error('Error al actualizar organizador:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Eliminar organizador
const eliminarOrganizador = async (req, res) => {
  const { cedula } = req.params;
  try {
    const existe = await prisma.organizador.findUnique({ where: { ced_org: cedula } });
    if (!existe) return res.status(404).json({ success: false, message: 'Organizador no encontrado' });

    await prisma.organizador.delete({ where: { ced_org: cedula } });
    res.json({ success: true, message: 'Organizador eliminado' });
  } catch (error) {
    console.error('Error al eliminar organizador:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

module.exports = {
  crearOrganizador,
  obtenerOrganizadores,
  actualizarOrganizador,
  eliminarOrganizador
};
