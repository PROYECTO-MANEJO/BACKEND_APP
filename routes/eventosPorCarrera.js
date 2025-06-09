const express = require('express');
const router = express.Router();
const {
  asociarEventoCarrera,
  listarEventosPorCarrera,
  eliminarEventoCarrera
} = require('../controllers/eventosPorCarreraController');

router.post('/asociar', asociarEventoCarrera);
router.get('/listar', listarEventosPorCarrera);
router.delete('/eliminar', eliminarEventoCarrera);

module.exports = router;
