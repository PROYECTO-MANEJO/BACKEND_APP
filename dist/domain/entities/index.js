"use strict";
/**
 * Domain Entities - Centralized Exports
 *
 * Todas las entidades del dominio exportadas desde un punto central
 * para facilitar imports y mantener organización
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomepageDashboard = exports.HomepageContent = exports.VerificationToken = exports.Participation = exports.Enrollment = exports.Inscription = exports.Report = exports.Developer = exports.ChangeRequest = exports.Certificate = exports.Event = exports.Course = void 0;
// Core Business Entities
var Course_1 = require("./Course");
Object.defineProperty(exports, "Course", { enumerable: true, get: function () { return Course_1.Course; } });
var Event_1 = require("./Event");
Object.defineProperty(exports, "Event", { enumerable: true, get: function () { return Event_1.Event; } });
// Management Entities  
var Certificate_1 = require("./Certificate");
Object.defineProperty(exports, "Certificate", { enumerable: true, get: function () { return Certificate_1.Certificate; } });
var ChangeRequest_1 = require("./ChangeRequest");
Object.defineProperty(exports, "ChangeRequest", { enumerable: true, get: function () { return ChangeRequest_1.ChangeRequest; } });
var Developer_1 = require("./Developer");
Object.defineProperty(exports, "Developer", { enumerable: true, get: function () { return Developer_1.Developer; } });
var Report_1 = require("./Report");
Object.defineProperty(exports, "Report", { enumerable: true, get: function () { return Report_1.Report; } });
// Process Entities
var Inscription_1 = require("./Inscription");
Object.defineProperty(exports, "Inscription", { enumerable: true, get: function () { return Inscription_1.Inscription; } });
var Enrollment_1 = require("./Enrollment");
Object.defineProperty(exports, "Enrollment", { enumerable: true, get: function () { return Enrollment_1.Enrollment; } });
var Participation_1 = require("./Participation");
Object.defineProperty(exports, "Participation", { enumerable: true, get: function () { return Participation_1.Participation; } });
// System Entities
var VerificationToken_1 = require("./VerificationToken");
Object.defineProperty(exports, "VerificationToken", { enumerable: true, get: function () { return VerificationToken_1.VerificationToken; } });
var HomepageContent_1 = require("./HomepageContent");
Object.defineProperty(exports, "HomepageContent", { enumerable: true, get: function () { return HomepageContent_1.HomepageContent; } });
var HomepageDashboard_1 = require("./HomepageDashboard");
Object.defineProperty(exports, "HomepageDashboard", { enumerable: true, get: function () { return HomepageDashboard_1.HomepageDashboard; } });
//# sourceMappingURL=index.js.map