const express = require('express');
const router = express.Router();
const {
  asociarCursoCarrera,
  listarCursosPorCarrera,
  eliminarCursoCarrera
} = require('../controllers/cursoPorCarreraController');


router.post('/asociar',  asociarCursoCarrera);
router.get('/listar', listarCursosPorCarrera);
router.delete('/eliminar',eliminarCursoCarrera);

module.exports = router;
