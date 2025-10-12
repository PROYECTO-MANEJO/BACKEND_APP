"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Urgency = exports.Priority = exports.ChangeType = exports.RequestStatus = void 0;
var RequestStatus;
(function (RequestStatus) {
    RequestStatus["BORRADOR"] = "BORRADOR";
    RequestStatus["PENDIENTE"] = "PENDIENTE";
    RequestStatus["EN_REVISION"] = "EN_REVISION";
    RequestStatus["APROBADA"] = "APROBADA";
    RequestStatus["RECHAZADA"] = "RECHAZADA";
    RequestStatus["ESPERANDO_INFORMACION"] = "ESPERANDO_INFORMACION";
    RequestStatus["EN_DESARROLLO"] = "EN_DESARROLLO";
    RequestStatus["EN_TESTING"] = "EN_TESTING";
    RequestStatus["EN_PAUSA"] = "EN_PAUSA";
    RequestStatus["COMPLETADA"] = "COMPLETADA";
    RequestStatus["CERRADA"] = "CERRADA";
    RequestStatus["CANCELADA"] = "CANCELADA";
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
var ChangeType;
(function (ChangeType) {
    ChangeType["FUNCIONALIDAD"] = "FUNCIONALIDAD";
    ChangeType["CORRECCION"] = "CORRECCION";
    ChangeType["MEJORA"] = "MEJORA";
    ChangeType["CONFIGURACION"] = "CONFIGURACION";
    ChangeType["SEGURIDAD"] = "SEGURIDAD";
    ChangeType["RENDIMIENTO"] = "RENDIMIENTO";
    ChangeType["DOCUMENTACION"] = "DOCUMENTACION";
})(ChangeType || (exports.ChangeType = ChangeType = {}));
var Priority;
(function (Priority) {
    Priority["BAJA"] = "BAJA";
    Priority["MEDIA"] = "MEDIA";
    Priority["ALTA"] = "ALTA";
    Priority["CRITICA"] = "CRITICA";
})(Priority || (exports.Priority = Priority = {}));
var Urgency;
(function (Urgency) {
    Urgency["NORMAL"] = "NORMAL";
    Urgency["URGENTE"] = "URGENTE";
    Urgency["INMEDIATA"] = "INMEDIATA";
})(Urgency || (exports.Urgency = Urgency = {}));
//# sourceMappingURL=ChangeRequestEnums.js.map