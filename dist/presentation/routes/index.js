"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRoutes = void 0;
const express_1 = require("express");
const verificationRoutes_1 = require("./verificationRoutes");
const passwordRecoveryRoutes_1 = require("./passwordRecoveryRoutes");
const router = (0, express_1.Router)();
exports.apiRoutes = router;
// Verification routes
router.use("/verification", verificationRoutes_1.verificationRoutes);
// Password recovery routes
router.use("/password-recovery", passwordRecoveryRoutes_1.passwordRecoveryRoutes);
//# sourceMappingURL=index.js.map