const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PaginaPrincipalService {
  // Obtener contenido de la página principal
  async obtenerContenido() {
    try {
      // Buscar el primer registro o crear uno por defecto
      let paginaPrincipal = await prisma.paginaPrincipal.findFirst();
      
      if (!paginaPrincipal) {
        // Crear registro por defecto con contenido actual
        paginaPrincipal = await prisma.paginaPrincipal.create({
          data: {
            titulo_hero: 'FISEI - SIGEC',
            subtitulo_hero: 'Sistema Integral de Gestión de Eventos y Cursos',
            descripcion_hero: 'Facultad de Ingeniería en Sistemas, Electrónica e Industrial - Universidad Técnica de Ambato',
            titulo_ofrecemos: '¿Qué Ofrecemos?',
            subtitulo_ofrecemos: 'Descubre todas las oportunidades de crecimiento académico y profesional que tenemos para ti',
            titulo_seccion1: 'Cursos Especializados',
            descripcion_seccion1: 'En FISEI ofrecemos una amplia variedad de cursos técnicos y académicos diseñados específicamente para potenciar tu desarrollo profesional. Nuestros programas están actualizados con las últimas tendencias tecnológicas y metodologías de enseñanza, garantizando una formación de calidad que te prepare para los desafíos del mundo laboral moderno.',
            titulo_seccion2: 'Eventos Académicos',
            descripcion_seccion2: 'Participa en conferencias, seminarios y talleres que enriquecerán tu experiencia universitaria. Organizamos eventos con expertos de la industria, investigadores reconocidos y profesionales destacados que compartirán sus conocimientos y experiencias contigo, creando oportunidades únicas de networking y aprendizaje.',
            titulo_seccion3: 'Certificaciones Oficiales',
            descripcion_seccion3: 'Obtén certificados oficiales que validen tus conocimientos y habilidades adquiridas durante tu formación. Nuestras certificaciones están reconocidas por la industria y te brindarán una ventaja competitiva en el mercado laboral, demostrando tu competencia y compromiso con la excelencia académica.',
            titulo_seccion4: 'Comunidad Académica',
            descripcion_seccion4: 'Forma parte de una comunidad universitaria comprometida con la excelencia educativa y la innovación. En FISEI, fomentamos un ambiente colaborativo donde estudiantes, docentes e investigadores trabajamos juntos para crear soluciones innovadoras y contribuir al desarrollo tecnológico del país.',
            texto_footer1: 'Facultad de Ingeniería en Sistemas, Electrónica e Industrial',
            texto_footer2: 'Universidad Técnica de Ambato - Campus Huachi',
            texto_footer3: '© 2024 FISEI-UTA. Todos los derechos reservados.'
          },
          include: {
            ultimoEditor: true
          }
        });
      } else {
        // Incluir información del último editor
        paginaPrincipal = await prisma.paginaPrincipal.findUnique({
          where: { id_pag: paginaPrincipal.id_pag },
          include: {
            ultimoEditor: true
          }
        });
      }
      
      return paginaPrincipal;
    } catch (error) {
      console.error('Error al obtener contenido de página principal:', error);
      throw new Error('Error al obtener contenido de página principal');
    }
  }
  
  // Actualizar contenido de la página principal
  async actualizarContenido(data, usuarioId) {
    try {
      // Buscar el registro existente
      let paginaPrincipal = await prisma.paginaPrincipal.findFirst();
      
      const updateData = {
        ...data,
        fecha_ultima_actualizacion: new Date(),
        id_usuario_ultima_edicion: usuarioId
      };
      
      if (paginaPrincipal) {
        // Actualizar registro existente
        paginaPrincipal = await prisma.paginaPrincipal.update({
          where: { id_pag: paginaPrincipal.id_pag },
          data: updateData,
          include: {
            ultimoEditor: true
          }
        });
      } else {
        // Crear nuevo registro si no existe
        paginaPrincipal = await prisma.paginaPrincipal.create({
          data: {
            ...updateData,
            fecha_creacion: new Date()
          },
          include: {
            ultimoEditor: true
          }
        });
      }
      
      return paginaPrincipal;
    } catch (error) {
      console.error('Error al actualizar contenido de página principal:', error);
      throw new Error('Error al actualizar contenido de página principal');
    }
  }
  
  // Subir imagen
  async subirImagen(tipoImagen, buffer, usuarioId) {
    try {
      const paginaPrincipal = await prisma.paginaPrincipal.findFirst();
      
      if (!paginaPrincipal) {
        throw new Error('No se encontró configuración de página principal');
      }
      
      const updateData = {
        [tipoImagen]: buffer,
        fecha_ultima_actualizacion: new Date(),
        id_usuario_ultima_edicion: usuarioId
      };
      
      const resultado = await prisma.paginaPrincipal.update({
        where: { id_pag: paginaPrincipal.id_pag },
        data: updateData,
        include: {
          ultimoEditor: true
        }
      });
      
      return resultado;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw new Error('Error al subir imagen');
    }
  }
  
  // Obtener imagen
  async obtenerImagen(tipoImagen) {
    try {
      const paginaPrincipal = await prisma.paginaPrincipal.findFirst({
        select: {
          [tipoImagen]: true
        }
      });
      
      if (!paginaPrincipal || !paginaPrincipal[tipoImagen]) {
        return null;
      }
      
      return paginaPrincipal[tipoImagen];
    } catch (error) {
      console.error('Error al obtener imagen:', error);
      throw new Error('Error al obtener imagen');
    }
  }
}

module.exports = new PaginaPrincipalService(); 