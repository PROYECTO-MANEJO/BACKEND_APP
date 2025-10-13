"use strict";
/**
 * Data Transfer Objects - Centralized Exports
 *
 * Todos los DTOs organizados por funcionalidad y exportados
 * desde un punto central para facilitar imports
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// User Management DTOs
tslib_1.__exportStar(require("./user/UserDTO"), exports);
tslib_1.__exportStar(require("./user/UserManagementTypes"), exports);
// Course Management DTOs
tslib_1.__exportStar(require("./CourseDTO"), exports);
// Event Management DTOs
tslib_1.__exportStar(require("./EventDTO"), exports);
// Admin Management DTOs
tslib_1.__exportStar(require("./admin/CertificateDTO"), exports);
// Organizer Management DTOs
tslib_1.__exportStar(require("./OrganizerDTO"), exports);
// Category Management DTOs
tslib_1.__exportStar(require("./CategoryDTO"), exports);
// Homepage Management DTOs
tslib_1.__exportStar(require("./HomepageDTO"), exports);
// Common DTOs
tslib_1.__exportStar(require("./common/CommonTypes"), exports);
tslib_1.__exportStar(require("./common/CareerDTO"), exports);
//# sourceMappingURL=index.js.map