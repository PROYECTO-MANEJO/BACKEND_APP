"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCompleteStudentProfile = exports.requireCareerAssignment = exports.requireVerifiedDocuments = exports.requireStudent = void 0;
/**
 * Middleware para verificar que el usuario tiene rol ESTUDIANTE
 */
const requireStudent = (req, res, next) => {
    const userRole = req.usuario?.rol;
    if (!userRole || userRole !== 'ESTUDIANTE') {
        res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere rol de Estudiante.'
        });
        return;
    }
    next();
};
exports.requireStudent = requireStudent;
/**
 * Middleware para verificar que el estudiante tiene documentos verificados
 */
const requireVerifiedDocuments = (req, res, next) => {
    const documentosVerificados = req.usuario?.documentos_verificados;
    if (!documentosVerificados) {
        res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere tener documentos verificados (cédula y matrícula).'
        });
        return;
    }
    next();
};
exports.requireVerifiedDocuments = requireVerifiedDocuments;
/**
 * Middleware para verificar que el estudiante tiene carrera asignada
 */
const requireCareerAssignment = (req, res, next) => {
    const carreraId = req.usuario?.id_car_per;
    if (!carreraId) {
        res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere tener una carrera asignada.'
        });
        return;
    }
    next();
};
exports.requireCareerAssignment = requireCareerAssignment;
/**
 * Middleware combinado para verificar perfil completo de estudiante
 * (rol + carrera + documentos verificados)
 */
const requireCompleteStudentProfile = (req, res, next) => {
    const userRole = req.usuario?.rol;
    const carreraId = req.usuario?.id_car_per;
    const documentosVerificados = req.usuario?.documentos_verificados;
    if (!userRole || userRole !== 'ESTUDIANTE') {
        res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere rol de Estudiante.'
        });
        return;
    }
    if (!carreraId) {
        res.status(403).json({
            success: false,
            message: 'Perfil incompleto. Se requiere tener una carrera asignada.'
        });
        return;
    }
    if (!documentosVerificados) {
        res.status(403).json({
            success: false,
            message: 'Documentos pendientes. Se requiere tener cédula y matrícula verificadas.'
        });
        return;
    }
    next();
};
exports.requireCompleteStudentProfile = requireCompleteStudentProfile;
//# sourceMappingURL=studentMiddleware.js.map