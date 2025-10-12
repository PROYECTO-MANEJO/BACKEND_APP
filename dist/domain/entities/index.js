"use strict";
/**
 * Domain Entities - Index
 *
 * Exporta todas las entidades del dominio
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseCategory = exports.Course = exports.EventCategory = exports.Event = exports.Enrollment = exports.Participation = exports.HomepageDashboard = exports.HomepageContent = exports.CourseEntities = exports.EventEntities = exports.ParticipationEntities = exports.HomepageEntities = exports.AdminEntities = void 0;
const tslib_1 = require("tslib");
// GitHub Entities
tslib_1.__exportStar(require("./github"), exports);
// GitHub Entities
tslib_1.__exportStar(require("./github"), exports);
// Administration Entities (with namespace to avoid conflicts)
const AdminEntities = tslib_1.__importStar(require("./administration"));
exports.AdminEntities = AdminEntities;
// Homepage Entities (with namespace to avoid conflicts)
const HomepageEntities = tslib_1.__importStar(require("./homepage"));
exports.HomepageEntities = HomepageEntities;
// Participation Entities (with namespace to avoid conflicts)
const ParticipationEntities = tslib_1.__importStar(require("./participation"));
exports.ParticipationEntities = ParticipationEntities;
// Events Entities (with namespace to avoid conflicts)
const EventEntities = tslib_1.__importStar(require("./events"));
exports.EventEntities = EventEntities;
// Courses Entities (with namespace to avoid conflicts)
const CourseEntities = tslib_1.__importStar(require("./courses"));
exports.CourseEntities = CourseEntities;
// Re-export main entities directly for convenience
var homepage_1 = require("./homepage");
Object.defineProperty(exports, "HomepageContent", { enumerable: true, get: function () { return homepage_1.HomepageContent; } });
Object.defineProperty(exports, "HomepageDashboard", { enumerable: true, get: function () { return homepage_1.HomepageDashboard; } });
var participation_1 = require("./participation");
Object.defineProperty(exports, "Participation", { enumerable: true, get: function () { return participation_1.Participation; } });
Object.defineProperty(exports, "Enrollment", { enumerable: true, get: function () { return participation_1.Enrollment; } });
var events_1 = require("./events");
Object.defineProperty(exports, "Event", { enumerable: true, get: function () { return events_1.Event; } });
Object.defineProperty(exports, "EventCategory", { enumerable: true, get: function () { return events_1.EventCategory; } });
var courses_1 = require("./courses");
Object.defineProperty(exports, "Course", { enumerable: true, get: function () { return courses_1.Course; } });
Object.defineProperty(exports, "CourseCategory", { enumerable: true, get: function () { return courses_1.CourseCategory; } });
//# sourceMappingURL=index.js.map