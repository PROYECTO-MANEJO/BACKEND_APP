"use strict";
/**
 * Courses System - Application Layer Use Cases Index
 *
 * Exports all use cases for the courses system following Clean Architecture principles
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseCategory = exports.Course = exports.CourseAnalytics = exports.CourseCategoryManagement = exports.CourseManagement = void 0;
// Course Management Use Case
var CourseManagement_1 = require("./CourseManagement");
Object.defineProperty(exports, "CourseManagement", { enumerable: true, get: function () { return CourseManagement_1.CourseManagement; } });
// Course Category Management Use Case
var CourseCategoryManagement_1 = require("./CourseCategoryManagement");
Object.defineProperty(exports, "CourseCategoryManagement", { enumerable: true, get: function () { return CourseCategoryManagement_1.CourseCategoryManagement; } });
// Course Analytics Use Case
var CourseAnalytics_1 = require("./CourseAnalytics");
Object.defineProperty(exports, "CourseAnalytics", { enumerable: true, get: function () { return CourseAnalytics_1.CourseAnalytics; } });
// Re-export domain entities for convenience
var courses_1 = require("../../../domain/entities/courses");
Object.defineProperty(exports, "Course", { enumerable: true, get: function () { return courses_1.Course; } });
Object.defineProperty(exports, "CourseCategory", { enumerable: true, get: function () { return courses_1.CourseCategory; } });
//# sourceMappingURL=index.js.map