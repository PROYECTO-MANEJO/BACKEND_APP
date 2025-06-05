const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Función para inscribir a un usuario o estudiante
async function inscribirUsuario(req, res) {
  const { usuarioId, eventoId, metodoPago, enlacePago } = req.body;

  // Validación de los datos requeridos
  if (!usuarioId) {
    return res.status(400).json({ message: 'ID de usuario es obligatorio' });
  }

  // Métodos de pago permitidos
  const metodosPermitidos = ['TARJETA_CREDITO', 'TRANFERENCIA', 'EFECTIVO'];
  if (!metodosPermitidos.includes(metodoPago)) {
    return res.status(400).json({ message: 'Método de pago no válido' });
  }

  try {
    // Obtener la cuenta del usuario para verificar su rol
    const cuenta = await prisma.cuenta.findUnique({
      where: { id_cue: usuarioId },
      include: {
        usuario: true,  // Obtener el usuario relacionado con esta cuenta
      },
    });

    if (!cuenta) {
      return res.status(404).json({ message: 'Cuenta no encontrada' });
    }

    const rol = cuenta.rol_cue;  // Aquí obtenemos el rol directamente de la tabla `Cuenta`
    const carreraId = cuenta.usuario?.id_car_per;  // Si es un estudiante (MASTER), tendrá una carrera asociada
    const fechaInscripcion = new Date();

    // Verificar si la fecha de inscripción es válida
    if (isNaN(fechaInscripcion)) {
      return res.status(400).json({ message: 'Fecha de inscripción no válida' });
    }

    // Si el rol es "USUARIO", solo podrá inscribirse en eventos públicos
    if (rol === 'USUARIO') {
      const evento = await prisma.evento.findUnique({
        where: { id_eve: eventoId },
        include: { categoria: true },
      });

      // Verificar si el evento es público
      if (evento && evento.categoria && evento.categoria.nom_cat === 'PUBLICO_GENERAL') {
        await prisma.inscripcion.create({
          data: {
            id_usu_ins: usuarioId,
            id_eve_ins: eventoId,
            fec_ins: fechaInscripcion,
            val_ins: 0,  // Si deseas calcular el valor, cámbialo según tu lógica
            met_pag_ins: metodoPago,
            enl_ord_pag_ins: enlacePago || '',
            estado_pago: 'PENDIENTE',  // Estado de pago inicial
          },
        });
        return res.status(200).json({ message: 'Usuario inscrito al evento público' });
      } else {
        return res.status(403).json({ message: 'Este evento no es accesible para usuarios' });
      }
    }

    // Si el rol es "MASTER" (Estudiante), puede inscribirse en eventos públicos o de su carrera
    if (rol === 'MASTER') {
      if (!carreraId) {
        return res.status(400).json({ message: 'El estudiante no tiene una carrera asociada' });
      }

      // Verificar si el evento es específico para su carrera
      const eventoPorCarrera = await prisma.eventoPorCarrera.findFirst({
        where: {
          id_car_per: carreraId,  // La carrera del estudiante
          id_eve_per: eventoId,   // El evento al que se intenta inscribir
        },
      });

      if (eventoPorCarrera) {
        await prisma.inscripcion.create({
          data: {
            id_usu_ins: usuarioId,
            id_eve_ins: eventoId,
            fec_ins: fechaInscripcion,
            val_ins: 0,  // Si deseas calcular el valor, cámbialo según tu lógica
            met_pag_ins: metodoPago,
            enl_ord_pag_ins: enlacePago || '',
            estado_pago: 'PENDIENTE',  // Estado de pago inicial
          },
        });
        return res.status(200).json({ message: 'Estudiante inscrito al evento de su carrera' });
      } else {
        // Si el evento no es de su carrera, verificar si es un evento público
        const evento = await prisma.evento.findUnique({
          where: { id_eve: eventoId },
          include: { categoria: true },
        });

        if (evento && evento.categoria && evento.categoria.nom_cat === 'PUBLICO_GENERAL') {
          await prisma.inscripcion.create({
            data: {
              id_usu_ins: usuarioId,
              id_eve_ins: eventoId,
              fec_ins: fechaInscripcion,
              val_ins: 0,  // Si deseas calcular el valor, cámbialo según tu lógica
              met_pag_ins: metodoPago,
              enl_ord_pag_ins: enlacePago || '',
              estado_pago: 'PENDIENTE',  // Estado de pago inicial
            },
          });
          return res.status(200).json({ message: 'Estudiante inscrito al evento público' });
        } else {
          return res.status(403).json({ message: 'Este evento no es accesible para este estudiante' });
        }
      }
    }

    return res.status(400).json({ message: 'Debe proporcionar un evento válido' });
  } catch (error) {
    console.error('Error al inscribir usuario:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
}

module.exports = { inscribirUsuario };
