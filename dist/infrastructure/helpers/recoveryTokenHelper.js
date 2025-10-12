"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRecoveryToken = void 0;
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const bcrypt_1 = tslib_1.__importDefault(require("bcrypt"));
const generateRecoveryToken = async () => {
    const token = crypto_1.default.randomBytes(20).toString('hex');
    const hashedToken = await bcrypt_1.default.hash(token, 10);
    const expiry = new Date(Date.now() + 3600000); // 1 hora
    return { token, hashedToken, expiry };
};
exports.generateRecoveryToken = generateRecoveryToken;
//# sourceMappingURL=recoveryTokenHelper.js.map