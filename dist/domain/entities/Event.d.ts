/**
 * Event Entity - Domain Layer
 *
 * Representa un evento del sistema con todas sus reglas de negocio
 * y validaciones correspondientes.
 */
export interface EventData {
    id?: string;
    nom_eve: string;
    des_eve: string;
    id_cat_eve: number;
    fec_ini_eve: Date;
    fec_fin_eve?: Date | null;
    hor_ini_eve: Date;
    hor_fin_eve?: Date | null;
    dur_eve: number;
    are_eve: string;
    ubi_eve: string;
    ced_org_eve: string;
    capacidad_max_eve: number;
    tipo_audiencia_eve: string;
    es_gratuito: boolean;
    precio?: number | null;
    porcentaje_asistencia_aprobacion: number;
    estado_eve?: string;
    fecha_creacion?: Date;
    fecha_actualizacion?: Date;
    categoria?: any;
    organizador?: any;
    participaciones?: any[];
    carreras?: number[];
}
export declare class Event {
    private _id?;
    private _nom_eve;
    private _des_eve;
    private _id_cat_eve;
    private _fec_ini_eve;
    private _fec_fin_eve?;
    private _hor_ini_eve;
    private _hor_fin_eve?;
    private _dur_eve;
    private _are_eve;
    private _ubi_eve;
    private _ced_org_eve;
    private _capacidad_max_eve;
    private _tipo_audiencia_eve;
    private _es_gratuito;
    private _precio?;
    private _porcentaje_asistencia_aprobacion;
    private _estado_eve;
    private _fecha_creacion?;
    private _fecha_actualizacion?;
    constructor(data: EventData);
    private validateEventData;
    private validateDates;
    private validateAttendancePercentage;
    private validatePrice;
    private validateAudienceType;
    private validateDuration;
    private validateCapacity;
    canBeUpdated(): boolean;
    canBeDeleted(): boolean;
    canBeClosed(): boolean;
    isActive(): boolean;
    isUpcoming(): boolean;
    isInProgress(): boolean;
    isFinished(): boolean;
    updateBasicInfo(data: Partial<EventData>): void;
    close(): void;
    cancel(): void;
    get id(): string | undefined;
    get nom_eve(): string;
    get des_eve(): string;
    get id_cat_eve(): number;
    get fec_ini_eve(): Date;
    get fec_fin_eve(): Date | null;
    get hor_ini_eve(): Date;
    get hor_fin_eve(): Date | null;
    get dur_eve(): number;
    get are_eve(): string;
    get ubi_eve(): string;
    get ced_org_eve(): string;
    get capacidad_max_eve(): number;
    get tipo_audiencia_eve(): string;
    get es_gratuito(): boolean;
    get precio(): number | null;
    get porcentaje_asistencia_aprobacion(): number;
    get estado_eve(): string;
    get fecha_creacion(): Date | undefined;
    get fecha_actualizacion(): Date | undefined;
    toPlainObject(): EventData;
}
//# sourceMappingURL=Event.d.ts.map