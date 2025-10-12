"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJWT = void 0;
const tslib_1 = require("tslib");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const validateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        res.status(401).json({
            success: false,
            error: 'No token provided'
        });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.uid = decoded.id;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
        return;
    }
};
exports.validateJWT = validateJWT;
//# sourceMappingURL=jwtMiddleware.js.map