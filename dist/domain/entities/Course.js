"use strict";
/**
 * Course Entity - Domain Layer
 *
 * ✅ SRP: Responsabilidad única - Gestión de datos del curso
 * Las validaciones están en CourseValidator
 * Las reglas de negocio están en CourseBusinessRules
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Course = void 0;
class Course {
    constructor(data) {
        // ✅ SRP: Validaciones delegadas al CourseValidator
        // La entidad solo maneja datos, no validaciones
        this._id = data.id;
        this._nom_cur = data.nom_cur;
        this._des_cur = data.des_cur;
        this._dur_cur = data.dur_cur;
        this._fec_ini_cur = data.fec_ini_cur;
        this._fec_fin_cur = data.fec_fin_cur;
        this._id_cat_cur = data.id_cat_cur;
        this._ced_org_cur = data.ced_org_cur;
        this._capacidad_max_cur = data.capacidad_max_cur;
        this._tipo_audiencia_cur = data.tipo_audiencia_cur;
        this._requiere_verificacion_docs = data.requiere_verificacion_docs || false;
        this._es_gratuito = data.es_gratuito;
        this._precio = data.precio || null;
        this._porcentaje_asistencia_aprobacion =
            data.porcentaje_asistencia_aprobacion;
        this._nota_minima_aprobacion = data.nota_minima_aprobacion;
        this._estado_cur = data.estado_cur || "ACTIVO";
        this._fecha_creacion = data.fecha_creacion || new Date();
        this._fecha_actualizacion = data.fecha_actualizacion || new Date();
    }
    // ✅ SRP PURO: Solo gestión de datos
    // - Validaciones están en CourseValidator
    // - Reglas de negocio están en CourseBusinessRules
    // - La entidad solo maneja el estado de los datos
    // ✅ MÉTODOS SIMPLES PARA MODIFICAR DATOS (sin lógica de negocio)
    /**
     * Actualizar información básica del curso
     * NOTA: Las validaciones y reglas de negocio deben aplicarse ANTES de llamar este método
     */
    updateData(data) {
        // ✅ SRP: Solo actualiza datos, no valida ni aplica reglas de negocio
        if (data.nom_cur !== undefined)
            this._nom_cur = data.nom_cur;
        if (data.des_cur !== undefined)
            this._des_cur = data.des_cur;
        if (data.dur_cur !== undefined)
            this._dur_cur = data.dur_cur;
        if (data.capacidad_max_cur !== undefined)
            this._capacidad_max_cur = data.capacidad_max_cur;
        if (data.precio !== undefined)
            this._precio = data.precio;
        if (data.estado_cur !== undefined)
            this._estado_cur = data.estado_cur;
        if (data.porcentaje_asistencia_aprobacion !== undefined) {
            this._porcentaje_asistencia_aprobacion =
                data.porcentaje_asistencia_aprobacion;
        }
        if (data.nota_minima_aprobacion !== undefined) {
            this._nota_minima_aprobacion = data.nota_minima_aprobacion;
        }
        this._fecha_actualizacion = new Date();
    }
    /**
     * Cambiar estado del curso
     * NOTA: Las reglas de negocio deben aplicarse ANTES de llamar este método
     */
    changeStatus(newStatus) {
        this._estado_cur = newStatus;
        this._fecha_actualizacion = new Date();
    }
    // ✅ GETTERS
    get id() {
        return this._id;
    }
    get nom_cur() {
        return this._nom_cur;
    }
    get des_cur() {
        return this._des_cur;
    }
    get dur_cur() {
        return this._dur_cur;
    }
    get fec_ini_cur() {
        return this._fec_ini_cur;
    }
    get fec_fin_cur() {
        return this._fec_fin_cur;
    }
    get id_cat_cur() {
        return this._id_cat_cur;
    }
    get ced_org_cur() {
        return this._ced_org_cur;
    }
    get capacidad_max_cur() {
        return this._capacidad_max_cur;
    }
    get tipo_audiencia_cur() {
        return this._tipo_audiencia_cur;
    }
    get requiere_verificacion_docs() {
        return this._requiere_verificacion_docs;
    }
    get es_gratuito() {
        return this._es_gratuito;
    }
    get precio() {
        return this._precio || null;
    }
    get porcentaje_asistencia_aprobacion() {
        return this._porcentaje_asistencia_aprobacion;
    }
    get nota_minima_aprobacion() {
        return this._nota_minima_aprobacion;
    }
    get estado_cur() {
        return this._estado_cur;
    }
    get fecha_creacion() {
        return this._fecha_creacion;
    }
    get fecha_actualizacion() {
        return this._fecha_actualizacion;
    }
    // ✅ MÉTODO PARA SERIALIZACIÓN
    toPlainObject() {
        return {
            id: this._id,
            nom_cur: this._nom_cur,
            des_cur: this._des_cur,
            dur_cur: this._dur_cur,
            fec_ini_cur: this._fec_ini_cur,
            fec_fin_cur: this._fec_fin_cur,
            id_cat_cur: this._id_cat_cur,
            ced_org_cur: this._ced_org_cur,
            capacidad_max_cur: this._capacidad_max_cur,
            tipo_audiencia_cur: this._tipo_audiencia_cur,
            requiere_verificacion_docs: this._requiere_verificacion_docs,
            es_gratuito: this._es_gratuito,
            precio: this._precio,
            porcentaje_asistencia_aprobacion: this._porcentaje_asistencia_aprobacion,
            nota_minima_aprobacion: this._nota_minima_aprobacion,
            estado_cur: this._estado_cur,
            fecha_creacion: this._fecha_creacion,
            fecha_actualizacion: this._fecha_actualizacion,
        };
    }
}
exports.Course = Course;
//# sourceMappingURL=Course.js.map