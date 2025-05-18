const jwt = require('jsonwebtoken');

class AuthMiddleware {
  constructor(secret) {
    this.secret = secret;
  }

  auth(rolesPermitidos = []) {
    return (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).json({ message: 'Token no proporcionado' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
          return res.status(401).json({ message: 'Token inválido' });
        }

        const payload = jwt.verify(token, this.secret);

        if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(payload.rol)) {
          return res.status(403).json({ message: 'Acceso denegado' });
        }

        req.user = payload;
        next();
      } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
      }
    };
  }
}

module.exports = AuthMiddleware;
