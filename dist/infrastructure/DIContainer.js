"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIContainer = void 0;
const tslib_1 = require("tslib");
const client_1 = require("@prisma/client");
const bcrypt_1 = tslib_1.__importDefault(require("bcrypt"));
const jwtHelper_1 = require("./helpers/jwtHelper");
/**
 * Real Dependency Injection Container
 * NO MOCKS - Real implementation with Prisma
 */
class DIContainer {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    static getInstance() {
        if (!DIContainer.instance) {
            DIContainer.instance = new DIContainer();
        }
        return DIContainer.instance;
    }
    getPrismaClient() {
        return this.prisma;
    }
    getBcrypt() {
        return bcrypt_1.default;
    }
    getJwtHelpers() {
        return {
            generateJWT: jwtHelper_1.generateJWT,
            generateAdminJWT: jwtHelper_1.generateAdminJWT,
            generateVerificationJWT: jwtHelper_1.generateVerificationJWT
        };
    }
    // Cleanup method for graceful shutdown
    async cleanup() {
        await this.prisma.$disconnect();
    }
}
exports.DIContainer = DIContainer;
//# sourceMappingURL=DIContainer.js.map