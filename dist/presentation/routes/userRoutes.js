"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const DIContainer_1 = require("../../infrastructure/DIContainer");
class UserRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        const container = DIContainer_1.DIContainer.getInstance();
        this.userController = new UserController_1.UserController(container);
        this.setupRoutes();
    }
    setupRoutes() {
        /**
         * GET /api/users/profile
         * Get current user profile (requires JWT token)
         */
        this.router.get("/profile", 
        // TODO: Add JWT middleware
        this.userController.getUserProfile.bind(this.userController));
        /**
         * PUT /api/users/profile
         * Update current user profile (requires JWT token)
         */
        this.router.put("/profile", 
        // TODO: Add JWT middleware and validation
        this.userController.updateUserProfile.bind(this.userController));
        /**
         * GET /api/users
         * Get all users (admin only)
         */
        this.router.get("/", 
        // TODO: Add JWT middleware and admin authorization
        this.userController.getAllUsers.bind(this.userController));
    }
    getRouter() {
        return this.router;
    }
}
exports.UserRoutes = UserRoutes;
//# sourceMappingURL=userRoutes.js.map