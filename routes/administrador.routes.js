const express = require('express');
const router = express.Router();
const AdministradorController = require('../controllers/administrador');
const adminController = new AdministradorController();
const AuthMiddleware = require('../middlewares/authorMiddlewares');
const authMiddleware = new AuthMiddleware(process.env.JWT_SECRET);
router.post('/registro', (req, res) => adminController.registrarAdministrador(req, res));
router.post('/login', (req, res) => adminController.loginAdministrador(req, res));

router.get('/panel', authMiddleware.auth(['admin']), (req, res) => {
  res.json({ message: 'Acceso autorizado', user: req.user });
});

module.exports = router;
