const express= require('express');
const router = express.Router();
const {crearEvento, obtenerEventos, obtenerEventoPorId, actualizarEvento, eliminarEvento, obtenerEventosDisponibles, obtenerMisEventos}= require('../controllers/eventoController');
const { validateJWT } = require('../middlewares/validateJWT');

router.post('/', crearEvento);
router.get('/', obtenerEventos);
// Nuevas rutas para eventos filtrados (deben ir antes de /:id)
router.get('/disponibles', validateJWT, obtenerEventosDisponibles);
router.get('/mis-eventos', validateJWT, obtenerMisEventos);
router.get('/:id', obtenerEventoPorId);
router.put('/:id', actualizarEvento);
router.delete('/:id', eliminarEvento);

module.exports = router;