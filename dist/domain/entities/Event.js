"use strict";
/**
 * Event Entity - Domain Layer
 *
 * Representa un evento del sistema con todas sus reglas de negocio
 * y validaciones correspondientes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
class Event {
    constructor(data) {
        this.validateEventData(data);
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
    // ✅ VALIDACIONES DE NEGOCIO
    validateEventData(data) {
        // Validar campos obligatorios
        if (!data.nom_eve?.trim()) {
            throw new Error("El nombre del evento es obligatorio");
        }
        if (!data.des_eve?.trim()) {
            throw new Error("La descripción del evento es obligatoria");
        }
        if (!data.id_cat_eve || data.id_cat_eve <= 0) {
            throw new Error("La categoría del evento es obligatoria");
        }
        if (!data.fec_ini_eve) {
            throw new Error("La fecha de inicio es obligatoria");
        }
        if (!data.hor_ini_eve) {
            throw new Error("La hora de inicio es obligatoria");
        }
        if (!data.dur_eve || data.dur_eve <= 0) {
            throw new Error("La duración debe ser mayor a 0 minutos");
        }
        if (!data.are_eve?.trim()) {
            throw new Error("El área del evento es obligatoria");
        }
        if (!data.ubi_eve?.trim()) {
            throw new Error("La ubicación del evento es obligatoria");
        }
        if (!data.ced_org_eve?.trim()) {
            throw new Error("La cédula del organizador es obligatoria");
        }
        if (!data.capacidad_max_eve || data.capacidad_max_eve <= 0) {
            throw new Error("La capacidad máxima debe ser mayor a 0");
        }
        // Validar fechas
        this.validateDates(data.fec_ini_eve, data.fec_fin_eve);
        // Validar porcentaje de asistencia
        this.validateAttendancePercentage(data.porcentaje_asistencia_aprobacion);
        // Validar precio si no es gratuito
        this.validatePrice(data.es_gratuito, data.precio);
        // Validar tipo de audiencia
        this.validateAudienceType(data.tipo_audiencia_eve);
        // Validar duración razonable
        this.validateDuration(data.dur_eve);
        // Validar capacidad máxima razonable
        this.validateCapacity(data.capacidad_max_eve);
    }
    validateDates(fechaInicio, fechaFin) {
        const now = new Date();
        if (fechaInicio < now) {
            throw new Error("La fecha de inicio no puede ser en el pasado");
        }
        if (fechaFin) {
            if (fechaFin < fechaInicio) {
                throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
            }
            // Validar que no sea más de 1 año en el futuro
            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() + 1);
            if (fechaFin > maxDate) {
                throw new Error("La fecha de fin no puede ser más de 1 año en el futuro");
            }
        }
    }
    validateAttendancePercentage(porcentaje) {
        if (porcentaje == null || isNaN(porcentaje)) {
            throw new Error("El porcentaje de asistencia es obligatorio");
        }
        if (porcentaje < 0 || porcentaje > 100) {
            throw new Error("El porcentaje de asistencia debe estar entre 0 y 100");
        }
    }
    validatePrice(esGratuito, precio) {
        if (!esGratuito) {
            if (!precio || precio <= 0) {
                throw new Error("El precio debe ser mayor a 0 para eventos pagos");
            }
            if (precio > 1000000) {
                // Precio máximo razonable
                throw new Error("El precio no puede superar $1,000,000");
            }
        }
    }
    validateAudienceType(tipoAudiencia) {
        const tiposValidos = [
            "ESTUDIANTES",
            "PROFESIONALES",
            "GENERAL",
            "ACADEMICO",
        ];
        if (!tiposValidos.includes(tipoAudiencia)) {
            throw new Error(`Tipo de audiencia debe ser uno de: ${tiposValidos.join(", ")}`);
        }
    }
    validateDuration(duracion) {
        if (duracion < 30) {
            throw new Error("La duración mínima del evento es de 30 minutos");
        }
        if (duracion > 10080) {
            // 1 semana en minutos
            throw new Error("La duración máxima del evento es de 1 semana");
        }
    }
    validateCapacity(capacidad) {
        if (capacidad < 1) {
            throw new Error("La capacidad mínima es de 1 persona");
        }
        if (capacidad > 10000) {
            throw new Error("La capacidad máxima es de 10,000 personas");
        }
    }
    // ✅ MÉTODOS DE NEGOCIO
    canBeUpdated() {
        const now = new Date();
        return this._fec_ini_eve > now && this._estado_eve === "ACTIVO";
    }
    canBeDeleted() {
        return this.canBeUpdated(); // Mismas reglas que actualización
    }
    canBeClosed() {
        const now = new Date();
        return this._fec_ini_eve <= now && this._estado_eve === "ACTIVO";
    }
    isActive() {
        return this._estado_eve === "ACTIVO";
    }
    isUpcoming() {
        const now = new Date();
        return this._fec_ini_eve > now && this._estado_eve === "ACTIVO";
    }
    isInProgress() {
        const now = new Date();
        const fechaFin = this._fec_fin_eve || this._fec_ini_eve;
        return (this._fec_ini_eve <= now &&
            fechaFin >= now &&
            this._estado_eve === "ACTIVO");
    }
    isFinished() {
        return this._estado_eve === "CERRADO" || this._estado_eve === "FINALIZADO";
    }
    updateBasicInfo(data) {
        if (!this.canBeUpdated()) {
            throw new Error("El evento no puede ser actualizado");
        }
        // Validar solo los campos que se están actualizando
        if (data.nom_eve !== undefined) {
            if (!data.nom_eve?.trim()) {
                throw new Error("El nombre del evento no puede estar vacío");
            }
            this._nom_eve = data.nom_eve;
        }
        if (data.des_eve !== undefined) {
            if (!data.des_eve?.trim()) {
                throw new Error("La descripción del evento no puede estar vacía");
            }
            this._des_eve = data.des_eve;
        }
        if (data.capacidad_max_eve !== undefined) {
            this.validateCapacity(data.capacidad_max_eve);
            this._capacidad_max_eve = data.capacidad_max_eve;
        }
        if (data.precio !== undefined && !this._es_gratuito) {
            this.validatePrice(false, data.precio);
            this._precio = data.precio;
        }
        this._fecha_actualizacion = new Date();
    }
    close() {
        if (!this.canBeClosed()) {
            throw new Error("El evento no puede ser cerrado en este momento");
        }
        this._estado_eve = "CERRADO";
        this._fecha_actualizacion = new Date();
    }
    cancel() {
        if (!this.canBeUpdated()) {
            throw new Error("El evento no puede ser cancelado");
        }
        this._estado_eve = "CANCELADO";
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