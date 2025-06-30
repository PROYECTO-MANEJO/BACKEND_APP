const jwt = require('jsonwebtoken');

const generateJWT = (id) => {
    return new Promise((resolve, reject) => {
        const payload = { id };
        jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' }, (err, token) => {
            if (err) {
                reject('No se pudo generar el token');
            } else {
                resolve(token);
            }
        })
    });
};

const generateAdminJWT = (id) => {
    return new Promise((resolve, reject) => {
        const payload = { id, role: 'admin' };
        jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '24h' }, (err, token) => {
            if (err) {
                reject('No se pudo generar el token de administrador');
            } else {
                resolve(token);
            }   
        })
    });
};

const generateVerificationJWT = (id) => {
  return new Promise((resolve, reject) => {
    const payload = { id, type: 'emailVerification' };
    jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' }, (err, token) => {
      if (err) {
        reject('No se pudo generar el token de verificación');
      } else {
        resolve(token);
      }
    });
  });
};

// Verificar el token de verificación
const verifyVerificationJWT = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        reject('Token inválido o expirado');
      } else {
        resolve(decoded); // Devolver el contenido decodificado
      }
    });
  });
};



module.exports = {
    generateJWT,
    generateAdminJWT,
    generateVerificationJWT,
    verifyVerificationJWT
};