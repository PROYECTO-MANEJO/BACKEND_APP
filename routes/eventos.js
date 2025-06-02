const express= require('express');
const router = express.Router();
const {crearEvento, obtenerEventos, obtenerEventoPorId, actualizarEvento, eliminarEvento}= require('../controllers/eventoController');

router.post('/', crearEvento);
router.get('/', obtenerEventos);
router.get('/:id', obtenerEventoPorId);
router.put('/:id', actualizarEvento);
router.delete('/:id', eliminarEvento);

module.exports = router;