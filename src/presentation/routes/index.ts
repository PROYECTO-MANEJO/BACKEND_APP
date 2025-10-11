import { Router } from "express";
import { verificationRoutes } from "./verificationRoutes";
import { passwordRecoveryRoutes } from "./passwordRecoveryRoutes";
import changeRequestRoutes from "./changeRequestRoutes";

const router = Router();

// Verification routes
router.use("/verification", verificationRoutes);

// Password recovery routes
router.use("/password-recovery", passwordRecoveryRoutes);

// Change Request routes (Phase 8)
router.use("/", changeRequestRoutes);

export { router as apiRoutes };
