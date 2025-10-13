"use strict";
/**
 * Event Entity - Domain Layer
 *
 * ✅ SRP: Responsabilidad única - Gestión de datos del evento
 * Las validaciones están en EventValidator
 * Las reglas de negocio están en EventBusinessRules
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
class Event {
    constructor(data) {
        // ✅ SRP: Validaciones delegadas al EventValidator
        // La entidad solo maneja datos, no validaciones
        this._id = data.id;
        this._nom_eve = data.nom_eve;
        this._des_eve = data.des_eve;
        this._id_cat_eve = data.id_cat_eve;
        this._fec_ini_eve = data.fec_ini_eve;
        this._fec_fin_eve = data.fec_fin_eve || null;
        this._hor_ini_eve = data.hor_ini_eve;
        this._hor_fin_eve = data.hor_fin_eve || null;
        this._dur_eve = data.dur_eve;
        this._are_eve = data.are_eve;
        this._ubi_eve = data.ubi_eve;
        this._ced_org_eve = data.ced_org_eve;
        this._capacidad_max_eve = data.capacidad_max_eve;
        this._tipo_audiencia_eve = data.tipo_audiencia_eve;
        this._es_gratuito = data.es_gratuito;
        this._precio = data.precio || null;
        this._porcentaje_asistencia_aprobacion =
            data.porcentaje_asistencia_aprobacion;
        this._estado_eve = data.estado_eve || "ACTIVO";
        this._fecha_creacion = data.fecha_creacion || new Date();
        this._fecha_actualizacion = data.fecha_actualizacion || new Date();
    }
    updateData(data) {
        // ✅ SRP: Solo actualiza datos, no valida ni aplica reglas de negocio
        if (data.nom_eve !== undefined)
            this._nom_eve = data.nom_eve;
        if (data.des_eve !== undefined)
            this._des_eve = data.des_eve;
        if (data.capacidad_max_eve !== undefined)
            this._capacidad_max_eve = data.capacidad_max_eve;
        if (data.precio !== undefined)
            this._precio = data.precio;
        if (data.estado_eve !== undefined)
            this._estado_eve = data.estado_eve;
        this._fecha_actualizacion = new Date();
    }
    changeStatus(newStatus) {
        this._estado_eve = newStatus;
        this._fecha_actualizacion = new Date();
    }
    // ✅ GETTERS
    get id() {
        return this._id;
    }
    get nom_eve() {
        return this._nom_eve;
    }
    get des_eve() {
        return this._des_eve;
    }
    get id_cat_eve() {
        return this._id_cat_eve;
    }
    get fec_ini_eve() {
        return this._fec_ini_eve;
    }
    get fec_fin_eve() {
        return this._fec_fin_eve || null;
    }
    get hor_ini_eve() {
        return this._hor_ini_eve;
    }
    get hor_fin_eve() {
        return this._hor_fin_eve || null;
    }
    get dur_eve() {
        return this._dur_eve;
    }
    get are_eve() {
        return this._are_eve;
    }
    get ubi_eve() {
        return this._ubi_eve;
    }
    get ced_org_eve() {
        return this._ced_org_eve;
    }
    get capacidad_max_eve() {
        return this._capacidad_max_eve;
    }
    get tipo_audiencia_eve() {
        return this._tipo_audiencia_eve;
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
    get estado_eve() {
        return this._estado_eve;
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
            nom_eve: this._nom_eve,
            des_eve: this._des_eve,
            id_cat_eve: this._id_cat_eve,
            fec_ini_eve: this._fec_ini_eve,
            fec_fin_eve: this._fec_fin_eve,
            hor_ini_eve: this._hor_ini_eve,
            hor_fin_eve: this._hor_fin_eve,
            dur_eve: this._dur_eve,
            are_eve: this._are_eve,
            ubi_eve: this._ubi_eve,
            ced_org_eve: this._ced_org_eve,
            capacidad_max_eve: this._capacidad_max_eve,
            tipo_audiencia_eve: this._tipo_audiencia_eve,
            es_gratuito: this._es_gratuito,
            precio: this._precio,
            porcentaje_asistencia_aprobacion: this._porcentaje_asistencia_aprobacion,
            estado_eve: this._estado_eve,
            fecha_creacion: this._fecha_creacion,
            fecha_actualizacion: this._fecha_actualizacion,
        };
    }
}
exports.Event = Event;
//# sourceMappingURL=Event.js.map