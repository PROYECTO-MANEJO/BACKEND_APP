"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationToken = void 0;
class VerificationToken {
    constructor(data) {
        this.id = data.id;
        this.userId = data.userId;
        this.token = data.token;
        this.type = data.type;
        this.expiresAt = data.expiresAt;
        this.isUsed = data.isUsed;
        this.createdAt = data.createdAt;
    }
    isExpired() {
        return new Date() > this.expiresAt;
    }
    isValid() {
        return !this.isUsed && !this.isExpired();
    }
    canBeUsed() {
        return this.isValid();
    }
}
exports.VerificationToken = VerificationToken;
//# sourceMappingURL=VerificationToken.js.map