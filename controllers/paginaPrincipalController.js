const paginaPrincipalService = require('../services/paginaPrincipalService');
const multer = require('multer');

// Configuración de multer para imágenes
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Verificar que sea una imagen
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

class PaginaPrincipalController {
  // Obtener contenido de la página principal
  async obtenerContenido(req, res) {
    try {
      const contenido = await paginaPrincipalService.obtenerContenido();
      
      // Convertir imágenes a URLs del servidor para enviar al frontend
      const contenidoConImagenes = {
        ...contenido,
        imagen_hero: contenido.imagen_hero ? `/api/pagina-principal/imagen/imagen_hero?t=${Date.now()}` : null,
        imagen_seccion1: contenido.imagen_seccion1 ? `/api/pagina-principal/imagen/imagen_seccion1?t=${Date.now()}` : null,
        imagen_seccion2: contenido.imagen_seccion2 ? `/api/pagina-principal/imagen/imagen_seccion2?t=${Date.now()}` : null,
        imagen_seccion3: contenido.imagen_seccion3 ? `/api/pagina-principal/imagen/imagen_seccion3?t=${Date.now()}` : null,
        imagen_seccion4: contenido.imagen_seccion4 ? `/api/pagina-principal/imagen/imagen_seccion4?t=${Date.now()}` : null,
      };
      
      res.json({
        success: true,
        data: contenidoConImagenes
      });
    } catch (error) {
      console.error('Error en obtenerContenido:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Actualizar contenido de la página principal
  async actualizarContenido(req, res) {
    try {
      const usuarioId = req.usuario.id_usu;
      const data = req.body;
      
      // Validación básica
      if (!data) {
        return res.status(400).json({
          success: false,
          message: 'Datos requeridos'
        });
      }
      
      const contenidoActualizado = await paginaPrincipalService.actualizarContenido(data, usuarioId);
      
      res.json({
        success: true,
        message: 'Contenido actualizado exitosamente',
        data: contenidoActualizado
      });
    } catch (error) {
      console.error('Error en actualizarContenido:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Subir imagen
  async subirImagen(req, res) {
    try {
      const { tipoImagen } = req.params;
      const usuarioId = req.usuario.id_usu;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ninguna imagen'
        });
      }
      
      // Validar tipo de imagen
      const tiposPermitidos = ['imagen_hero', 'imagen_seccion1', 'imagen_seccion2', 'imagen_seccion3', 'imagen_seccion4'];
      if (!tiposPermitidos.includes(tipoImagen)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de imagen no válido'
        });
      }
      
      const resultado = await paginaPrincipalService.subirImagen(tipoImagen, req.file.buffer, usuarioId);
      
      res.json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: resultado
      });
    } catch (error) {
      console.error('Error en subirImagen:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Obtener imagen específica
  async obtenerImagen(req, res) {
    try {
      const { tipoImagen } = req.params;
      
      const imagenBuffer = await paginaPrincipalService.obtenerImagen(tipoImagen);
      
      if (!imagenBuffer) {
        return res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
      }
      
      // Determinar tipo de contenido basado en los primeros bytes
      let contentType = 'image/jpeg'; // default
      
      // Detectar formato por magic numbers
      if (imagenBuffer[0] === 0xFF && imagenBuffer[1] === 0xD8) {
        contentType = 'image/jpeg';
      } else if (imagenBuffer[0] === 0x89 && imagenBuffer[1] === 0x50 && imagenBuffer[2] === 0x4E && imagenBuffer[3] === 0x47) {
        contentType = 'image/png';
      } else if (imagenBuffer[0] === 0x47 && imagenBuffer[1] === 0x49 && imagenBuffer[2] === 0x46) {
        contentType = 'image/gif';
      } else if (imagenBuffer[0] === 0x52 && imagenBuffer[1] === 0x49 && imagenBuffer[2] === 0x46 && imagenBuffer[3] === 0x46) {
        contentType = 'image/webp';
      }
      
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=31536000'); // Cache por 1 año
      res.send(imagenBuffer);
    } catch (error) {
      console.error('Error en obtenerImagen:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

// Instancia del controlador
const controller = new PaginaPrincipalController();

// Exportar controlador y middleware de upload
module.exports = {
  obtenerContenido: controller.obtenerContenido.bind(controller),
  actualizarContenido: controller.actualizarContenido.bind(controller),
  subirImagen: controller.subirImagen.bind(controller),
  obtenerImagen: controller.obtenerImagen.bind(controller),
  uploadMiddleware: upload.single('imagen')
}; 