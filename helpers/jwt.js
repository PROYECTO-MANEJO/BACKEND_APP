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

module.exports = {
    generateJWT,
    generateAdminJWT
};