const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');

const prisma = new PrismaClient();

// =====================================================
// HELPER PARA GENERACIÓN AUTOMÁTICA DE CERTIFICADOS
// =====================================================

/**
 * Generar certificado automáticamente cuando se aprueba una participación
 * Se llama desde el controlador de administración después de registrar participación
 */
const generarCertificadoAutomatico = async (tipo, inscripcionId, participacionData) => {
  try {
    // Solo generar certificado si la participación está aprobada
    if (!participacionData.aprobado) {
      return { success: false, message: 'Participación no aprobada, certificado no generado' };
    }

    if (tipo === 'evento') {
      return await generarCertificadoEventoAutomatico(inscripcionId, participacionData);
    } else if (tipo === 'curso') {
      return await generarCertificadoCursoAutomatico(inscripcionId, participacionData);
    }

    return { success: false, message: 'Tipo de participación no válido' };

  } catch (error) {
    console.error('❌ Error al generar certificado automático:', error);
    return { success: false, message: 'Error al generar certificado', error: error.message };
  }
};

/**
 * Generar certificado para evento automáticamente
 */
const generarCertificadoEventoAutomatico = async (inscripcionId, participacionData) => {
  try {
    // Obtener datos completos de la inscripción
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: inscripcionId },
      include: {
        evento: {
          include: {
            categoria: true,
            organizador: true
          }
        },
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            ced_usu: true
          }
        }
      }
    });

    if (!inscripcion) {
      return { success: false, message: 'Inscripción no encontrada' };
    }

    // NOTA: El helper automático ya no genera PDFs directamente.
    // La generación automática se ha deshabilitado temporalmente.
    // Los certificados deben generarse manualmente desde el frontend.
    
    return {
      success: false,
      message: 'Generación automática deshabilitada. Use la generación manual desde el frontend.'
    };

  } catch (error) {
    console.error('❌ Error al generar certificado de evento automático:', error);
    return { success: false, message: 'Error al generar certificado de evento', error: error.message };
  }
};

/**
 * Generar certificado para curso automáticamente
 */
const generarCertificadoCursoAutomatico = async (inscripcionId, participacionData) => {
  try {
    // Obtener datos completos de la inscripción
    const inscripcion = await prisma.inscripcionCurso.findUnique({
      where: { id_ins_cur: inscripcionId },
      include: {
        curso: {
          include: {
            categoria: true,
            organizador: true
          }
        },
        usuario: {
          select: {
            nom_usu1: true,
            nom_usu2: true,
            ape_usu1: true,
            ape_usu2: true,
            ced_usu: true
          }
        }
      }
    });

    if (!inscripcion) {
      return { success: false, message: 'Inscripción no encontrada' };
    }

    // NOTA: El helper automático ya no genera PDFs directamente.
    // La generación automática se ha deshabilitado temporalmente.
    // Los certificados deben generarse manualmente desde el frontend.
    
    return {
      success: false,
      message: 'Generación automática deshabilitada. Use la generación manual desde el frontend.'
    };

  } catch (error) {
    console.error('❌ Error al generar certificado de curso automático:', error);
    return { success: false, message: 'Error al generar certificado de curso', error: error.message };
  }
};

// =====================================================
// NOTA: Las funciones de generación de PDF se han movido 
// al certificadosController.js para usar el patrón exitoso
// de streaming que funciona correctamente.
// =====================================================

module.exports = {
  generarCertificadoAutomatico,
  generarCertificadoEventoAutomatico,
  generarCertificadoCursoAutomatico
}; 