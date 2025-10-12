"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyVerificationJWT = exports.generateVerificationJWT = exports.generateAdminJWT = exports.generateJWT = void 0;
const tslib_1 = require("tslib");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const generateJWT = (id) => {
    return new Promise((resolve, reject) => {
        const payload = { id };
        jsonwebtoken_1.default.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' }, (err, token) => {
            if (err) {
                reject('Could not generate token');
            }
            else {
                resolve(token);
            }
        });
    });
};
exports.generateJWT = generateJWT;
const generateAdminJWT = (id) => {
    return new Promise((resolve, reject) => {
        const payload = { id, role: 'admin' };
        jsonwebtoken_1.default.sign(payload, process.env.SECRET_KEY, { expiresIn: '24h' }, (err, token) => {
            if (err) {
                reject('Could not generate admin token');
            }
            else {
                resolve(token);
            }
        });
    });
};
exports.generateAdminJWT = generateAdminJWT;
const generateVerificationJWT = (id) => {
    return new Promise((resolve, reject) => {
        const payload = { id, type: 'emailVerification' };
        jsonwebtoken_1.default.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' }, (err, token) => {
            if (err) {
                reject('Could not generate verification token');
            }
            else {
                resolve(token);
            }
        });
    });
};
exports.generateVerificationJWT = generateVerificationJWT;
const verifyVerificationJWT = (token) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                reject('Invalid or expired token');
            }
            else {
                resolve(decoded);
            }
        });
    });
};
exports.verifyVerificationJWT = verifyVerificationJWT;
//# sourceMappingURL=jwtHelper.js.map